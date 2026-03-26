import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { requireAdmin } from "@/lib/serverAdmin";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  const url = new URL(req.url);
  const q = (url.searchParams.get("q") || "").toLowerCase();

  const snap = await adminDb.collection("users").orderBy("createdAt", "desc").limit(500).get();
  let users = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

  if (q) {
    users = users.filter((u: any) =>
      String(u.email || "").toLowerCase().includes(q) || String(u.uid || "").toLowerCase().includes(q)
    );
  }

  return NextResponse.json({ success: true, users });
}

export async function PATCH(req: Request) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  const body = await req.json();
  const uid = String(body.uid || "").trim();

  if (!uid) {
    return NextResponse.json({ success: false, message: "uid is required" }, { status: 400 });
  }

  const patch: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() };

  if (typeof body.role === "string") patch.role = body.role;
  if (typeof body.blocked === "boolean") patch.blocked = body.blocked;
  if (typeof body.balanceDelta === "number" && Number.isFinite(body.balanceDelta) && body.balanceDelta !== 0) {
    patch.balance = FieldValue.increment(body.balanceDelta);
  }
  if (typeof body.slotsDelta === "number" && Number.isFinite(body.slotsDelta) && body.slotsDelta !== 0) {
    patch.slots = FieldValue.increment(body.slotsDelta);
  }

  await adminDb.collection("users").doc(uid).set(patch, { merge: true });

  return NextResponse.json({ success: true, message: "User updated" });
}