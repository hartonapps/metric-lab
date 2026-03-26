"use client";

import { useState } from "react";
import { User } from "firebase/auth";
import { authedFetch } from "@/lib/clientAuth";
import { MIN_WALLET_FUND_NGN } from "@/lib/billing";

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
    processedReferences?: Set<string>;
  }
}

type Props = {
  user: User;
  onFunded: (newBalance: number) => void;
};

const loadPaystackScript = () =>
  new Promise<void>((resolve, reject) => {
    if (typeof window === "undefined") return reject(new Error("Window not available"));

    if (window.PaystackPop) return resolve();

    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;

    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Paystack script"));

    document.body.appendChild(script);
  });

async function safeJson(res: Response) {
  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) return null;
  return res.json();
}

export default function FundWallet({ user, onFunded }: Props) {
  const [amount, setAmount] = useState<number | "">("");
  const [loading, setLoading] = useState(false);

  const verifyPayment = async (reference: string) => {
    try {
      window.processedReferences = window.processedReferences || new Set();
      if (window.processedReferences.has(reference)) return;
      window.processedReferences.add(reference);

      const res = await authedFetch("/api/verify-paystack", {
        method: "POST",
        body: JSON.stringify({ reference }),
      });

      const data = await safeJson(res);

      if (res.ok && data?.success) {
        alert("Wallet funded successfully.");
        onFunded(Number(data.newBalance || 0));
        setAmount("");
      } else {
        alert(data?.message || "Verification failed");
      }
    } catch {
      alert("Server error during verification");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!amount || Number(amount) < MIN_WALLET_FUND_NGN) {
      alert(`Minimum funding is NGN ${MIN_WALLET_FUND_NGN}.`);
      return;
    }

    setLoading(true);

    try {
      await loadPaystackScript();

      if (!window.PaystackPop) {
        alert("Paystack not loaded");
        setLoading(false);
        return;
      }

      const amountKobo = Math.round(Number(amount) * 100);

      const handler = window.PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_KEY!,
        email: user.email || "",
        amount: amountKobo,
        currency: "NGN",
        callback: (response) => {
          void verifyPayment(response.reference);
        },
        onClose: () => {
          setLoading(false);
          void authedFetch("/api/log-cancelled-deposit", {
            method: "POST",
            body: JSON.stringify({
              amount: Number(amount),
              type: "deposit",
              status: "cancelled",
            }),
          });
        },
      });

      handler.openIframe();
    } catch {
      setLoading(false);
      alert("Unable to start payment");
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void handlePayment();
      }}
      className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center"
    >
      <input
        type="number"
        min={MIN_WALLET_FUND_NGN}
        placeholder={`Amount (min ${MIN_WALLET_FUND_NGN})`}
        value={amount}
        onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : "")}
        className="w-full min-w-0 rounded-lg border border-gray-300 bg-white px-4 py-2 text-black placeholder-gray-400 sm:w-52"
      />

      <button
        type="submit"
        disabled={loading}
        className={`w-full rounded-lg px-5 py-2 font-medium text-white transition sm:w-auto ${
          loading ? "cursor-not-allowed bg-gray-400" : "bg-green-600 hover:bg-green-700"
        }`}
      >
        {loading ? "Processing..." : "Fund Wallet"}
      </button>
    </form>
  );
}
