import axios from "axios";
import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { requireAuth } from "@/lib/serverAuth";
import { adminDb } from "@/lib/firebaseAdmin";
import { ensureServerUser } from "@/lib/serverUsers";

export const runtime = "nodejs";

function hasServerFirebaseCredentials() {
  return Boolean(process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY);
}

export async function POST(req: Request) {
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

    const { reference } = await req.json();

    if (!reference || typeof reference !== "string") {
      return NextResponse.json({ success: false, message: "Missing reference" }, { status: 400 });
    }

    await ensureServerUser(auth.uid, auth.email);

    const paystackRes = await axios.get(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const paystackData = paystackRes.data?.data;

    if (!paystackData) {
      return NextResponse.json({ success: false, message: "Invalid Paystack response" }, { status: 502 });
    }

    const status = String(paystackData.status || "");
    const amount = Number(paystackData.amount) / 100;

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ success: false, message: "Invalid payment amount" }, { status: 400 });
    }

    if (status !== "success") {
      return NextResponse.json({ success: false, message: `Transaction ${status}` }, { status: 400 });
    }

    const result = await adminDb.runTransaction(async (tx) => {
      const txnRef = adminDb.collection("transactions").doc(reference);
      const userRef = adminDb.collection("users").doc(auth.uid);

      const txnDoc = await tx.get(txnRef);
      if (txnDoc.exists) {
        const existing = txnDoc.data() || {};
        const existingAmount = typeof existing.amount === "number" ? existing.amount : amount;
        return { alreadyProcessed: true, amount: existingAmount };
      }

      const userDoc = await tx.get(userRef);
      if (!userDoc.exists) throw new Error("USER_NOT_FOUND");

      const userData = userDoc.data() || {};
      if (Boolean(userData.blocked)) throw new Error("USER_BLOCKED");

      const currentBalance = typeof userData.balance === "number" ? userData.balance : 0;
      const newBalance = currentBalance + amount;

      tx.set(txnRef, {
        uid: auth.uid,
        amount,
        type: "deposit",
        status: "success",
        reference,
        meta: {
          gateway: "paystack",
        },
        createdAt: FieldValue.serverTimestamp(),
      });

      tx.update(userRef, {
        balance: newBalance,
        updatedAt: FieldValue.serverTimestamp(),
      });

      return {
        alreadyProcessed: false,
        amount,
        newBalance,
      };
    });

    if (result.alreadyProcessed) {
      return NextResponse.json({
        success: true,
        message: "Already processed",
        amount: result.amount,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Payment successful",
      amount: result.amount,
      newBalance: result.newBalance,
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "USER_BLOCKED") {
      return NextResponse.json({ success: false, message: "User is blocked" }, { status: 403 });
    }

    const message =
      axios.isAxiosError(error)
        ? error.response?.data?.message || error.message
        : error instanceof Error
          ? error.message
          : "Error verifying payment";

    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
