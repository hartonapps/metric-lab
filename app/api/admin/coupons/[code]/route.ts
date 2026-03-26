import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { requireAdmin } from "@/lib/serverAdmin";

export const runtime = "nodejs";

export async function PATCH(req: Request, ctx: { params: Promise<{ code: string }> }) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  const { code } = await ctx.params;
  const id = String(code || "").toUpperCase();
  if (!id) return NextResponse.json({ success: false, message: "code required" }, { status: 400 });

  const body = await req.json();
  const patch: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() };

  if (typeof body.active === "boolean") patch.active = body.active;
  if (typeof body.balanceCredit === "number") patch.balanceCredit = body.balanceCredit;
  if (typeof body.slotCredit === "number") patch.slotCredit = body.slotCredit;
  if (body.maxUses === null || typeof body.maxUses === "number") patch.maxUses = body.maxUses;
  if (body.expiresAt) {
    const date = new Date(String(body.expiresAt));
    if (!Number.isNaN(date.getTime())) patch.expiresAt = Timestamp.fromDate(date);
  }

  await adminDb.collection("coupons").doc(id).set(patch, { merge: true });

  return NextResponse.json({ success: true, message: "Coupon updated" });
}

export async function DELETE(req: Request, ctx: { params: Promise<{ code: string }> }) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  const { code } = await ctx.params;
  const id = String(code || "").toUpperCase();
  if (!id) return NextResponse.json({ success: false, message: "code required" }, { status: 400 });

  await adminDb.collection("coupons").doc(id).delete();
  return NextResponse.json({ success: true, message: "Coupon deleted" });
}