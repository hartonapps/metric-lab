import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { requireAdmin } from "@/lib/serverAdmin";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  const snap = await adminDb.collection("coupons").orderBy("createdAt", "desc").limit(500).get();
  const coupons = snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      ...data,
      expiresAt: data.expiresAt?.toDate?.()?.toISOString?.() || null,
      createdAt: data.createdAt?.toDate?.()?.toISOString?.() || null,
    };
  });

  return NextResponse.json({ success: true, coupons });
}

export async function POST(req: Request) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  const body = await req.json();
  const code = String(body.code || "").trim().toUpperCase();

  if (!code) {
    return NextResponse.json({ success: false, message: "Coupon code required" }, { status: 400 });
  }

  const balanceCredit = Number(body.balanceCredit || 0);
  const slotCredit = Number(body.slotCredit || 0);
  const maxUses = body.maxUses === "" || body.maxUses == null ? null : Number(body.maxUses);

  const payload: Record<string, unknown> = {
    active: body.active !== false,
    balanceCredit: Number.isFinite(balanceCredit) ? balanceCredit : 0,
    slotCredit: Number.isFinite(slotCredit) ? slotCredit : 0,
    maxUses: maxUses !== null && Number.isFinite(maxUses) ? maxUses : null,
    usedCount: 0,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };

  if (body.expiresAt) {
    const date = new Date(String(body.expiresAt));
    if (!Number.isNaN(date.getTime())) {
      payload.expiresAt = Timestamp.fromDate(date);
    }
  }

  await adminDb.collection("coupons").doc(code).set(payload, { merge: true });

  return NextResponse.json({ success: true, message: "Coupon created", id: code });
}