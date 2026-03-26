import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { requireAuth } from "@/lib/serverAuth";
import { adminDb } from "@/lib/firebaseAdmin";
import { ensureServerUser } from "@/lib/serverUsers";

export const runtime = "nodejs";

function toNumber(value: unknown, fallback = 0) {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export async function POST(req: Request) {
  try {
    const auth = await requireAuth(req);
    if (auth instanceof NextResponse) return auth;

    await ensureServerUser(auth.uid, auth.email);

    const { code } = await req.json();
    const normalizedCode = String(code || "").trim().toUpperCase();

    if (!normalizedCode) {
      return NextResponse.json({ success: false, message: "Coupon code is required" }, { status: 400 });
    }

    const result = await adminDb.runTransaction(async (tx) => {
      const userRef = adminDb.collection("users").doc(auth.uid);
      const couponRef = adminDb.collection("coupons").doc(normalizedCode);
      const redeemRef = adminDb.collection("couponRedemptions").doc(`${normalizedCode}_${auth.uid}`);
      const transactionRef = adminDb.collection("transactions").doc();

      const [userSnap, couponSnap, redemptionSnap] = await Promise.all([
        tx.get(userRef),
        tx.get(couponRef),
        tx.get(redeemRef),
      ]);

      if (!userSnap.exists) throw new Error("USER_NOT_FOUND");

      const user = userSnap.data() || {};
      if (Boolean(user.blocked)) throw new Error("USER_BLOCKED");

      if (!couponSnap.exists) throw new Error("COUPON_NOT_FOUND");

      const coupon = couponSnap.data() || {};
      if (!coupon.active) throw new Error("COUPON_INACTIVE");
      if (redemptionSnap.exists) throw new Error("COUPON_ALREADY_USED");

      const maxUsesRaw = coupon.maxUses;
      const maxUses = maxUsesRaw == null ? null : toNumber(maxUsesRaw, 0);
      const usedCount = toNumber(coupon.usedCount, 0);
      if (maxUses !== null && usedCount >= maxUses) throw new Error("COUPON_EXHAUSTED");

      const expiresAt = coupon.expiresAt?.toDate?.();
      if (expiresAt && expiresAt.getTime() < Date.now()) throw new Error("COUPON_EXPIRED");

      const balanceCredit = toNumber(coupon.balanceCredit, 0);
      const slotCredit = toNumber(coupon.slotCredit, 0);

      if (balanceCredit <= 0 && slotCredit <= 0) {
        throw new Error("COUPON_INVALID");
      }

      const currentBalance = typeof user.balance === "number" ? user.balance : 0;
      const currentSlots = typeof user.slots === "number" ? user.slots : 0;

      tx.update(userRef, {
        balance: currentBalance + balanceCredit,
        slots: currentSlots + slotCredit,
        updatedAt: FieldValue.serverTimestamp(),
      });

      tx.update(couponRef, {
        usedCount: usedCount + 1,
        updatedAt: FieldValue.serverTimestamp(),
      });

      tx.set(redeemRef, {
        uid: auth.uid,
        code: normalizedCode,
        balanceCredit,
        slotCredit,
        createdAt: FieldValue.serverTimestamp(),
      });

      tx.set(transactionRef, {
        uid: auth.uid,
        amount: balanceCredit,
        type: "coupon_redeem",
        status: "success",
        meta: {
          code: normalizedCode,
          slotCredit,
          balanceCredit,
        },
        createdAt: FieldValue.serverTimestamp(),
      });

      return {
        newBalance: currentBalance + balanceCredit,
        newSlots: currentSlots + slotCredit,
        balanceCredit,
        slotCredit,
      };
    });

    return NextResponse.json({
      success: true,
      message: "Coupon redeemed",
      ...result,
    });
  } catch (error: unknown) {
    const code = error instanceof Error ? error.message : "UNKNOWN";

    const mapping: Record<string, { status: number; message: string }> = {
      USER_BLOCKED: { status: 403, message: "User is blocked" },
      COUPON_NOT_FOUND: { status: 404, message: "Coupon not found" },
      COUPON_INACTIVE: { status: 400, message: "Coupon is inactive" },
      COUPON_ALREADY_USED: { status: 400, message: "Coupon already redeemed" },
      COUPON_EXHAUSTED: { status: 400, message: "Coupon usage limit reached" },
      COUPON_EXPIRED: { status: 400, message: "Coupon has expired" },
      COUPON_INVALID: { status: 400, message: "Coupon has no credit value" },
    };

    const hit = mapping[code];
    if (hit) return NextResponse.json({ success: false, message: hit.message }, { status: hit.status });

    return NextResponse.json({ success: false, message: "Failed to redeem coupon" }, { status: 500 });
  }
}