import { NextResponse } from "next/server";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";

export async function POST(req: Request) {
  try {
    const { uid, amount, type, status } = await req.json();

    if (!uid || !type || !status) {
      return NextResponse.json({ success: false, message: "Missing fields" });
    }

    await addDoc(collection(db, "transactions"), {
      uid,
      amount: amount || 0,
      type,
      status,
      reference: null, // no reference for cancelled tx
      createdAt: serverTimestamp(),
    });

    return NextResponse.json({ success: true, message: "Cancelled transaction logged" });
  } catch (err) {
    console.error("Error logging cancelled transaction:", err);
    return NextResponse.json({ success: false, message: "Failed to log cancelled transaction" });
  }
}