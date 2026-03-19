"use client";

import { useState } from "react";
import { User } from "firebase/auth";

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
    try {
      await loadPaystackScript();
    } catch (err) {
      alert(err);
      return;
    }

    // Validate user
    if (!user?.email) {
      alert("User email missing");
      return;
    }

    // Validate amount
    if (!amount || Number(amount) <= 0) {
      alert("Enter a valid amount");
      return;
    }

    const key = process.env.NEXT_PUBLIC_PAYSTACK_KEY;

    if (!key || !key.startsWith("pk_")) {
      alert("Invalid Paystack public key");
      return;
    }

    const amountKobo = Math.round(Number(amount) * 100);
    setLoading(true);

    const handler = window.PaystackPop?.setup({
      key,
      email: user.email,
      amount: amountKobo,
      currency: "NGN",

      callback: (response) => {
        verifyPayment(response.reference);
      },

      onClose: () => {
        setLoading(false);
        alert("Transaction cancelled");
      },
    });

    handler?.openIframe();
  };

  /**
   * ✅ Verify payment on backend
   */
  const verifyPayment = async (reference: string) => {
    try {
      const res = await fetch("/api/verify-paystack", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reference,
          uid: user.uid,
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert("Payment successful ✅");

        // Update balance safely
        setBalance((prev) => prev + Number(amount));
        setAmount(""); // reset input
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