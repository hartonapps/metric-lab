"use client";

import { useState } from "react";
import { User } from "firebase/auth";
import { addFunds } from "@/lib/firebaseUsers"; // ← use addFunds instead of logDeposit

/**
 * ✅ Extend Window type for Paystack
 */
declare global {
  interface Window {
    PaystackPop?: {
      setup: (options: {
        key: string;
        email: string;
        amount: number;
        currency: string;
        callback: (response: { reference: string }) => void;
        onClose: () => void;
      }) => {
        openIframe: () => void;
      };
    };
  }
}

type Props = {
  user: User;
  setBalance: (b: number | ((prev: number) => number)) => void;
};

/**
 * ✅ Load Paystack script safely
 */
const loadPaystackScript = () =>
  new Promise<void>((resolve, reject) => {
    if (typeof window === "undefined") {
      return reject("Window not available");
    }

    // Already loaded
    if (window.PaystackPop) {
      return resolve();
    }

    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;

    script.onload = () => resolve();
    script.onerror = () => reject("Failed to load Paystack script");

    document.body.appendChild(script);
  });

export default function FundWallet({ user, setBalance }: Props) {
  const [amount, setAmount] = useState<number | "">("");
  const [loading, setLoading] = useState(false);

  /**
   * ✅ Handle Payment
   */
const handlePayment = async () => {
  if (!window.PaystackPop) {
    alert("Paystack not loaded");
    return;
  }

  const amountKobo = Math.round(Number(amount) * 100);

  const handler = window.PaystackPop.setup({
    key: process.env.NEXT_PUBLIC_PAYSTACK_KEY!,
    email: user.email!,
    amount: amountKobo,
    currency: "NGN",
    callback: (response) => {
      verifyPayment(response.reference); // called on success
    },
onClose: () => {
  setLoading(false);
  alert("Transaction cancelled");

  // fire-and-forget async logging
  fetch("/api/log-cancelled-deposit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      uid: user.uid,
      amount: Number(amount),
      type: "deposit",
      status: "cancelled",
    }),
  }).catch(console.error);

  setAmount(""); // reset input
},
  });

  handler.openIframe(); // <-- make sure you call openIframe() on the handler, NOT on PaystackPop directly
};

  /**
   * ✅ Verify payment on backend
   */
const verifyPayment = async (reference: string) => {
  try {
    // Prevent processing the same reference twice
    if ((window as any).processedReferences?.has(reference)) return;
    (window as any).processedReferences = (window as any).processedReferences || new Set();
    (window as any).processedReferences.add(reference);

    const res = await fetch("/api/verify-paystack", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reference,
        uid: user.uid,
      }),
    });

    const data = await res.json();

    if (data.success) {
      alert("Payment successful ✅");

      // 🔹 Update UI balance immediately
      setBalance((prev) => prev + Number(amount));

      // 🔹 Reset input
      setAmount("");

      // 🔹 Optional: mark transaction processed in your frontend
      console.log("Transaction logged:", reference);
    } else {
      alert("Verification failed");
      console.error("Verification error:", data.message || data);
    }
  } catch (err) {
    console.error("Server error during verification:", err);
    alert("Server error during verification");
  } finally {
    setLoading(false);
  }
};

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handlePayment();
      }}
      className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full"
    >
      <input
        type="number"
        placeholder="Enter amount"
        value={amount}
        onChange={(e) =>
          setAmount(e.target.value ? Number(e.target.value) : "")
        }
        className="bg-white px-4 py-2 rounded-lg border border-gray-300 text-black placeholder-gray-400 w-full sm:w-40"
      />

      <button
        type="submit"
        disabled={loading}
        className={`px-5 py-2 rounded-lg font-medium transition w-full sm:w-auto
        ${
          loading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-green-500 hover:bg-green-600 active:scale-95"
        } text-white`}
      >
        {loading ? "Processing..." : "Fund Wallet"}
      </button>
    </form>
  );
}