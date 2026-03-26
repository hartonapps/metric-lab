import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { requireAuth } from "@/lib/serverAuth";
import { adminDb } from "@/lib/firebaseAdmin";
import { ensureServerUser } from "@/lib/serverUsers";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { amount, type } = await req.json();
  const debitAmount = Number(amount);

  if (!Number.isFinite(debitAmount) || debitAmount <= 0) {
    return NextResponse.json({ success: false, message: "Amount must be > 0" }, { status: 400 });
  }

  await ensureServerUser(auth.uid, auth.email);

  try {
    const result = await adminDb.runTransaction(async (tx) => {
      const userRef = adminDb.collection("users").doc(auth.uid);
      const txRef = adminDb.collection("transactions").doc();

      const userSnap = await tx.get(userRef);
      if (!userSnap.exists) throw new Error("USER_NOT_FOUND");

      const user = userSnap.data() || {};
      if (Boolean(user.blocked)) throw new Error("USER_BLOCKED");

      const currentBalance = typeof user.balance === "number" ? user.balance : 0;

      if (currentBalance < debitAmount) {
        throw new Error("INSUFFICIENT_BALANCE");
      }

      const newBalance = currentBalance - debitAmount;

      tx.update(userRef, {
        balance: newBalance,
        updatedAt: FieldValue.serverTimestamp(),
      });

      tx.set(txRef, {
        uid: auth.uid,
        amount: debitAmount,
        type: type || "debit",
        status: "success",
        createdAt: FieldValue.serverTimestamp(),
      });

      return { newBalance };
    });

    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    const message = err?.message === "INSUFFICIENT_BALANCE" ? "Insufficient balance" : "Server error";
    return NextResponse.json({ success: false, message }, { status: message === "Server error" ? 500 : 400 });
  }
}