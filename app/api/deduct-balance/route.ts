import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseClient";
import { doc, getDoc, updateDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";

export async function POST(req: Request) {
  try {
    const { uid, amount, type } = await req.json();

    if (!uid || !amount) {
      return NextResponse.json({
        success: false,
        message: "Missing uid or amount",
      });
    }

    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return NextResponse.json({
        success: false,
        message: "User not found",
      });
    }

    const currentBalance = userSnap.data().balance || 0;

    // 🚨 Prevent overdraft
    if (currentBalance < amount) {
      return NextResponse.json({
        success: false,
        message: "Insufficient balance",
      });
    }

    // 1️⃣ Deduct balance
    await updateDoc(userRef, {
      balance: currentBalance - amount,
    });

    // 2️⃣ Log transaction
    await addDoc(collection(db, "transactions"), {
      uid,
      amount,
      type: type || "debit",
      status: "success",
      createdAt: serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      newBalance: currentBalance - amount,
    });
  } catch (err) {
    console.error("Deduct balance error:", err);

    return NextResponse.json({
      success: false,
      message: "Server error",
    });
  }
}