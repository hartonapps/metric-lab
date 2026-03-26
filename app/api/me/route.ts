import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/serverAuth";
import { ensureServerUser } from "@/lib/serverUsers";
import { adminDb } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";

function hasServerFirebaseCredentials() {
  return Boolean(process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY);
}

export async function GET(req: Request) {
  try {
    if (!hasServerFirebaseCredentials()) {
      return NextResponse.json(
        {
          success: false,
          message: "Server Firebase credentials missing. Set FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY.",
        },
        { status: 500 }
      );
    }

    const auth = await requireAuth(req);
    if (auth instanceof NextResponse) return auth;

    const profile = await ensureServerUser(auth.uid, auth.email);

    const txSnap = await adminDb
      .collection("transactions")
      .where("uid", "==", auth.uid)
      .limit(100)
      .get();

    const transactions = txSnap.docs
      .map((d) => {
        const data = d.data();
        const createdAt = data.createdAt?.toDate?.() || null;
        return {
          id: d.id,
          uid: data.uid,
          amount: data.amount || 0,
          type: data.type || "unknown",
          status: data.status || "unknown",
          meta: data.meta || null,
          createdAt: createdAt ? createdAt.toISOString() : null,
        };
      })
      .sort((a, b) => {
        const at = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bt = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bt - at;
      })
      .slice(0, 50);

    return NextResponse.json({
      success: true,
      profile,
      transactions,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unexpected server error";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}