import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { requireAuth } from "@/lib/serverAuth";
import { adminDb } from "@/lib/firebaseAdmin";
import { ensureServerUser } from "@/lib/serverUsers";

export const runtime = "nodejs";

type TeamPayload = {
  name: string;
  role: string;
  bio: string;
  email: string;
  image: string;
};

function sanitizeInput(payload: TeamPayload) {
  return {
    name: payload.name.trim().slice(0, 120),
    role: payload.role.trim().slice(0, 120),
    bio: payload.bio.trim().slice(0, 700),
    email: payload.email.trim().toLowerCase().slice(0, 160),
    image: payload.image.trim().slice(0, 500),
  };
}

function validate(payload: TeamPayload) {
  if (!payload.name.trim()) return "Name is required";
  if (!payload.role.trim()) return "Role is required";
  if (!payload.email.trim()) return "Email is required";
  if (!/^\S+@\S+\.\S+$/.test(payload.email)) return "Email is invalid";
  if (!payload.image.trim()) return "Image URL is required";
  if (!/^https?:\/\//i.test(payload.image)) return "Image URL is invalid";
  return null;
}

export async function POST(req: Request) {
  try {
    const auth = await requireAuth(req);
    if (auth instanceof NextResponse) return auth;

    await ensureServerUser(auth.uid, auth.email);

    const body = (await req.json()) as TeamPayload;
    const validationError = validate(body);

    if (validationError) {
      return NextResponse.json({ success: false, message: validationError }, { status: 400 });
    }

    const clean = sanitizeInput(body);

    const result = await adminDb.runTransaction(async (tx) => {
      const userRef = adminDb.collection("users").doc(auth.uid);
      const teamRef = adminDb.collection("teams").doc();
      const transactionRef = adminDb.collection("transactions").doc();

      const userSnap = await tx.get(userRef);
      if (!userSnap.exists) throw new Error("USER_NOT_FOUND");

      const user = userSnap.data() || {};
      if (Boolean(user.blocked)) throw new Error("USER_BLOCKED");

      const currentSlots = typeof user.slots === "number" ? user.slots : 0;
      if (currentSlots < 1) throw new Error("NO_SLOTS");

      tx.update(userRef, {
        slots: currentSlots - 1,
        updatedAt: FieldValue.serverTimestamp(),
      });

      tx.set(teamRef, {
        ...clean,
        userId: auth.uid,
        createdAt: FieldValue.serverTimestamp(),
        status: "pending",
      });

      tx.set(transactionRef, {
        uid: auth.uid,
        amount: 1,
        type: "slot_usage",
        status: "success",
        meta: {
          teamId: teamRef.id,
        },
        createdAt: FieldValue.serverTimestamp(),
      });

      return {
        teamId: teamRef.id,
        newSlots: currentSlots - 1,
      };
    });

    return NextResponse.json({
      success: true,
      message: "Team submitted successfully",
      ...result,
    });
  } catch (error: unknown) {
    const code = error instanceof Error ? error.message : "UNKNOWN";

    if (code === "USER_BLOCKED") {
      return NextResponse.json({ success: false, message: "User is blocked" }, { status: 403 });
    }
    if (code === "NO_SLOTS") {
      return NextResponse.json({ success: false, message: "No slots available" }, { status: 400 });
    }

    return NextResponse.json({ success: false, message: "Failed to submit team" }, { status: 500 });
  }
}