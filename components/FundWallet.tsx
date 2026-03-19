"use client";

import { useState } from "react";
import { User } from "firebase/auth";

type Props = {
  user: User;
  setBalance: (b: number | ((prev: number) => number)) => void;
};

// ✅ Dynamic Paystack script loader
const loadPaystackScript = () =>
  new Promise<void>((resolve, reject) => {
    if (typeof window === "undefined") return reject("Window not defined");
    if (window.PaystackPop) return resolve();

    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.onload = () => resolve();
    script.onerror = () => reject("Failed to load Paystack script");
    document.body.appendChild(script);
  });

export default function FundWallet({ user, setBalance }: Props) {
  const [amount, setAmount] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    // 1️⃣ Load script
    try {
      await loadPaystackScript();
    } catch (err) {
      alert(err);
      return;
    }

    // 2️⃣ Validate input
    if (!user?.email) {
      alert("User email missing");
      return;
    }
    if (!amount || amount <= 0) {
      alert("Enter a valid amount");
      return;
    }

    const key = process.env.NEXT_PUBLIC_PAYSTACK_KEY;
    if (!key || !key.startsWith("pk_")) {
      alert("Invalid Paystack public key!");
      return;
    }

    const amountKobo = Math.round(amount * 100);
    setLoading(true);

    // 3️⃣ Initialize Paystack
    const handler = window.PaystackPop?.setup({
      key,
      email: user.email,
      amount: amountKobo,
      currency: "NGN",

      callback: function (response) {
        verifyPayment(response.reference);
      },
      onClose: function () {
        setLoading(false);
        alert("Transaction cancelled");
      },
    });

    handler.openIframe();
  };

  const verifyPayment = async (reference: string) => {
    try {
      const res = await fetch("/api/verify-paystack", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reference, uid: user.uid }),
      });

      const data = await res.json();

      if (data.success) {
        alert("Payment successful ✅");
        setBalance((prev) => prev + amount);
      } else {
        alert("Verification failed");
        console.error("Verification error:", data.message || data);
      }
    } catch (err) {
      console.error(err);
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
        value={amount || ""}
        onChange={(e) => setAmount(Number(e.target.value))}
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