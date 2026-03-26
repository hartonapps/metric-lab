import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { requireAuth } from "@/lib/serverAuth";
import { adminDb } from "@/lib/firebaseAdmin";
import { ensureServerUser } from "@/lib/serverUsers";
import { SLOT_PRICE_NGN } from "@/lib/billing";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const auth = await requireAuth(req);
    if (auth instanceof NextResponse) return auth;

    const body = await req.json();
    const slots = Number(body.slots);

    if (!Number.isFinite(slots) || slots < 1 || !Number.isInteger(slots)) {
      return NextResponse.json({ success: false, message: "Slots must be a whole number >= 1" }, { status: 400 });
    }

    await ensureServerUser(auth.uid, auth.email);

    const totalCost = slots * SLOT_PRICE_NGN;

    const result = await adminDb.runTransaction(async (tx) => {
      const userRef = adminDb.collection("users").doc(auth.uid);
      const txRef = adminDb.collection("transactions").doc();

      const userSnap = await tx.get(userRef);
      if (!userSnap.exists) throw new Error("USER_NOT_FOUND");

      const user = userSnap.data() || {};
      if (Boolean(user.blocked)) throw new Error("USER_BLOCKED");

      const balance = typeof user.balance === "number" ? user.balance : 0;
      const currentSlots = typeof user.slots === "number" ? user.slots : 0;

      if (balance < totalCost) throw new Error("INSUFFICIENT_BALANCE");

      const newBalance = balance - totalCost;
      const newSlots = currentSlots + slots;

      tx.update(userRef, {
        balance: newBalance,
        slots: newSlots,
        updatedAt: FieldValue.serverTimestamp(),
      });

      tx.set(txRef, {
        uid: auth.uid,
        amount: totalCost,
        type: "slot_purchase",
        status: "success",
        meta: {
          slotsAdded: slots,
          slotPrice: SLOT_PRICE_NGN,
        },
        createdAt: FieldValue.serverTimestamp(),
      });

      return { newBalance, newSlots, totalCost };
    });

    return NextResponse.json({
      success: true,
      message: `${slots} slot(s) purchased`,
      ...result,
    });
  } catch (error: unknown) {
    const code = error instanceof Error ? error.message : "UNKNOWN";

    if (code === "USER_BLOCKED") {
      return NextResponse.json({ success: false, message: "User is blocked" }, { status: 403 });
    }
    if (code === "INSUFFICIENT_BALANCE") {
      return NextResponse.json({ success: false, message: "Insufficient balance" }, { status: 400 });
    }

    return NextResponse.json({ success: false, message: "Failed to purchase slots" }, { status: 500 });
  }
}