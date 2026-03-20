import { NextResponse } from "next/server";
import axios from "axios";
import { db } from "@/lib/firebaseClient";
import {
  doc,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";

export async function POST(req: Request) {
  try {
    const { reference, uid } = await req.json();

    if (!reference || !uid) {
      return NextResponse.json({
        success: false,
        message: "Missing reference or uid",
      });
    }

    // 🔹 1. Verify with Paystack FIRST
    const paystackRes = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const paystackData = paystackRes.data?.data;

    if (!paystackData) {
      return NextResponse.json({
        success: false,
        message: "Invalid Paystack response",
      });
    }

    const status: string = paystackData.status;
    const amount: number = Number(paystackData.amount) / 100;

    // ❌ Do NOT credit failed payments
    if (status !== "success") {
      return NextResponse.json({
        success: false,
        message: `Transaction ${status}`,
      });
    }

    // 🔥 2. Use Firestore transaction (THIS FIXES EVERYTHING)
    const result = await runTransaction(db, async (transaction) => {
      const txnRef = doc(db, "transactions", reference); // ✅ unique ID
      const userRef = doc(db, "users", uid);

      const txnDoc = await transaction.get(txnRef);

      // 🚨 If already processed → STOP
      if (txnDoc.exists()) {
        return { alreadyProcessed: true };
      }

      const userDoc = await transaction.get(userRef);

      if (!userDoc.exists()) {
        throw new Error("User not found");
      }

      const currentBalance = userDoc.data().balance || 0;

      // ✅ Create transaction record
      transaction.set(txnRef, {
        uid,
        amount,
        type: "deposit",
        status: "success",
        reference,
        createdAt: serverTimestamp(),
      });

      // ✅ Update balance ONCE
      transaction.update(userRef, {
        balance: currentBalance + amount,
      });

      return { alreadyProcessed: false, amount };
    });

    // 🔁 If duplicate request
    if (result.alreadyProcessed) {
      return NextResponse.json({
        success: true,
        message: "Already processed",
      });
    }

    return NextResponse.json({
      success: true,
      message: "Payment successful",
      amount: result.amount, // ✅ send back trusted amount
    });
  } catch (err: any) {
    console.error(
      "Paystack verification error:",
      err.response?.data || err.message || err
    );

    return NextResponse.json({
      success: false,
      message: "Error verifying payment",
    });
  }
}