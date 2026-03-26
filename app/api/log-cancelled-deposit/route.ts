import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { requireAuth } from "@/lib/serverAuth";
import { adminDb } from "@/lib/firebaseAdmin";
import { ensureServerUser } from "@/lib/serverUsers";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { amount, type, status } = await req.json();

  if (!type || !status) {
    return NextResponse.json({ success: false, message: "Missing fields" }, { status: 400 });
  }

  await ensureServerUser(auth.uid, auth.email);

  await adminDb.collection("transactions").add({
    uid: auth.uid,
    amount: Number(amount) || 0,
    type,
    status,
    reference: null,
    createdAt: FieldValue.serverTimestamp(),
  });

  return NextResponse.json({ success: true, message: "Cancelled transaction logged" });
}