import { NextResponse } from "next/server";
import axios from "axios";
import { addFunds } from "@/lib/firebaseUsers";

export async function POST(req: Request) {
  try {
    const { reference, uid } = await req.json();

    const paystackRes = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const data = paystackRes.data;

    if (data.status && data.data.status === "success") {
      await addFunds(uid, data.data.amount / 100);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, message: "Transaction failed" });
  } catch (err: any) {
    console.error("Paystack verification error:", err.response?.data || err);
    return NextResponse.json({
      success: false,
      message: "Error verifying payment",
    });
  }
}