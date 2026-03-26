"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "firebase/auth";
import TrackPage from "@/components/analytics/TrackPage";
import GuideModal from "@/components/GuideModal";
import TeamForm from "@/components/TeamForm";
import FundWallet from "@/components/FundWallet";
import { auth } from "@/lib/firebaseClient";
import { authedFetch } from "@/lib/clientAuth";
import { SLOT_PRICE_NGN } from "@/lib/billing";

type Transaction = {
  id: string;
  uid: string;
  amount: number;
  type: string;
  status: string;
  createdAt: string | null;
  meta?: Record<string, unknown> | null;
};

async function safeJson(res: Response) {
  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) return null;
  return res.json();
}

export default function AddTeamPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [balance, setBalance] = useState(0);
  const [slots, setSlots] = useState(0);
  const [blocked, setBlocked] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  const [buySlotsQty, setBuySlotsQty] = useState("");
  const [buyingSlots, setBuyingSlots] = useState(false);

  const [couponCode, setCouponCode] = useState("");
  const [redeemingCoupon, setRedeemingCoupon] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const router = useRouter();

  const refreshProfile = useCallback(async () => {
    if (!auth.currentUser) return;

    setRefreshing(true);
    try {
      const res = await authedFetch("/api/me", { method: "GET" });
      const data = await safeJson(res);

      if (!res.ok || !data?.success) {
        if (data?.message) {
          alert(data.message);
        }
        return;
      }

      setBalance(Number(data.profile?.balance || 0));
      setSlots(Number(data.profile?.slots || 0));
      setBlocked(Boolean(data.profile?.blocked));
      setTransactions(data.transactions || []);
    } catch {
      alert("Unable to load account data right now.");
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (!currentUser) {
        setUser(null);
        setLoading(false);
        router.replace("/auth");
        return;
      }

      setUser(currentUser);
      await refreshProfile();
    });

    return () => unsubscribe();
  }, [router, refreshProfile]);

  const handleLogout = async () => {
    await auth.signOut();
    router.replace("/auth");
  };

  const handleBuySlots = async () => {
    if (blocked) {
      setNotice({ type: "error", text: "Your account is blocked. Contact support." });
      return;
    }
    setNotice(null);
    const qty = Number(buySlotsQty);
    if (!Number.isFinite(qty) || qty < 1 || !Number.isInteger(qty)) {
      setNotice({ type: "error", text: "Enter slot quantity (minimum 1)." });
      return;
    }

    setBuyingSlots(true);
    try {
      const res = await authedFetch("/api/purchase-slots", {
        method: "POST",
        body: JSON.stringify({ slots: qty }),
      });
      const data = await safeJson(res);

      if (!res.ok || !data?.success) {
        setNotice({ type: "error", text: data?.message || "Unable to buy slots." });
        return;
      }

      setBalance(Number(data.newBalance || 0));
      setSlots(Number(data.newSlots || 0));
      setBuySlotsQty("");
      setNotice({ type: "success", text: `Purchased ${qty} slot(s) successfully.` });
    } finally {
      setBuyingSlots(false);
    }
  };

  const handleRedeemCoupon = async () => {
    if (blocked) {
      setNotice({ type: "error", text: "Your account is blocked. Contact support." });
      return;
    }
    setNotice(null);
    const code = couponCode.trim().toUpperCase();
    if (!code) {
      setNotice({ type: "error", text: "Enter a coupon code." });
      return;
    }

    setRedeemingCoupon(true);
    try {
      const res = await authedFetch("/api/redeem-coupon", {
        method: "POST",
        body: JSON.stringify({ code }),
      });
      const data = await safeJson(res);

      if (!res.ok || !data?.success) {
        setNotice({ type: "error", text: data?.message || "Coupon redeem failed." });
        return;
      }

      setBalance(Number(data.newBalance || 0));
      setSlots(Number(data.newSlots || 0));
      setCouponCode("");
      setTransactions((prev) => [
        {
          id: `local_coupon_${Date.now()}`,
          uid: user?.uid || "",
          amount: Number(data.balanceCredit || 0),
          type: "coupon_redeem",
          status: "success",
          createdAt: new Date().toISOString(),
          meta: {
            code,
            slotCredit: Number(data.slotCredit || 0),
            balanceCredit: Number(data.balanceCredit || 0),
          },
        },
        ...prev,
      ]);
      setNotice({
        type: "success",
        text: `Coupon applied: +${Number(data.slotCredit || 0)} slots, +NGN ${Number(data.balanceCredit || 0)}.`,
      });
    } finally {
      setRedeemingCoupon(false);
    }
  };

  const visibleTransactions = useMemo(
    () =>
      transactions.filter((tx) =>
        ["slot_usage", "slot_purchase", "deposit", "coupon_redeem"].includes(tx.type)
      ),
    [transactions]
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-500">
        <p className="animate-pulse text-lg">Checking account...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-6 sm:py-10">
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
        <TrackPage pageName="Add Team Page" />

        <header className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">Add Team Workspace</h1>
            <p className="text-sm text-gray-500">Wallet, slots, coupon, submission, and history in one place.</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setIsGuideOpen(true)}
              className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700 sm:w-auto"
            >
              Guide
            </button>
            <button
              onClick={handleLogout}
              className="w-full rounded-lg bg-red-500 px-4 py-2 text-white shadow-md transition hover:bg-red-600 sm:w-auto"
            >
              Logout
            </button>
          </div>
        </header>

        <div className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="min-w-0 rounded-2xl bg-gray-900 p-5 text-white shadow-xl sm:p-6">
            <p className="text-sm opacity-70">Wallet Balance</p>
            <p className="mt-1 text-3xl font-bold tracking-wide">NGN {balance.toLocaleString()}</p>
            <div className="mt-4">
              {blocked ? (
                <p className="text-sm text-red-200">Funding disabled: this account is blocked.</p>
              ) : (
                <FundWallet user={user} onFunded={(newBalance) => setBalance(newBalance)} />
              )}
            </div>
          </div>

          <div className="min-w-0 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-sm text-gray-500">Available Slots</p>
            <p className="mt-1 text-3xl font-bold text-gray-900">{slots}</p>
            <p className="mt-1 text-xs text-gray-500">1 slot = NGN {SLOT_PRICE_NGN}</p>

            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,6rem)_auto]">
              <label className="sr-only" htmlFor="slot-qty">Slot Quantity</label>
              <input
                id="slot-qty"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="Qty"
                value={buySlotsQty}
                onChange={(e) => setBuySlotsQty(e.target.value.replace(/[^\d]/g, ""))}
                className="relative z-10 w-full cursor-text rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 caret-gray-900 placeholder:text-gray-400 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 sm:w-24"
              />
              <button
                onClick={() => void handleBuySlots()}
                disabled={buyingSlots || blocked}
                className="w-full rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700 disabled:opacity-60 sm:w-auto"
              >
                {buyingSlots ? "Buying..." : "Buy Slots"}
              </button>
            </div>
          </div>

          <div className="min-w-0 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-sm text-gray-500">Coupon Code</p>
            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
              <label className="sr-only" htmlFor="coupon-code">Coupon Code</label>
              <input
                id="coupon-code"
                type="text"
                placeholder="Enter code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                className="relative z-10 w-full cursor-text rounded-lg border border-gray-300 px-3 py-2 text-sm uppercase text-gray-900 caret-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
              <button
                onClick={() => void handleRedeemCoupon()}
                disabled={redeemingCoupon || blocked}
                className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-60 sm:w-auto"
              >
                {redeemingCoupon ? "Applying..." : "Apply"}
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-500">Coupons can credit balance and/or slots.</p>
          </div>
        </div>
        {notice && (
          <div
            className={`mb-6 rounded-lg border px-4 py-3 text-sm ${
              notice.type === "success"
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {notice.text}
          </div>
        )}
        {blocked && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            This account is blocked. You cannot fund wallet, buy slots, redeem coupons, or submit team entries.
          </div>
        )}

        <TeamForm
          user={user}
          slots={blocked ? 0 : slots}
          onTeamSubmitted={(nextSlots) => {
            setSlots(nextSlots);
            void refreshProfile();
          }}
        />

        <div className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Transaction History</h2>
            {refreshing && <p className="text-xs text-gray-500">Refreshing...</p>}
          </div>

          {visibleTransactions.length === 0 ? (
            <p className="text-gray-600">No transactions yet.</p>
          ) : (
            <div className="overflow-auto rounded-xl border border-gray-200 bg-white">
              <table className="w-full table-auto border-collapse text-black">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    <th className="border-b px-3 py-2">Amount</th>
                    <th className="border-b px-3 py-2">Type</th>
                    <th className="border-b px-3 py-2">Status</th>
                    <th className="border-b px-3 py-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleTransactions.map((tx) => (
                    <tr
                      key={tx.id}
                      className={`transition hover:bg-gray-50 ${tx.status === "failed" ? "bg-red-50 text-red-600" : ""}`}
                    >
                      <td className="border-b px-3 py-2 text-sm">{tx.amount}</td>
                      <td className="border-b px-3 py-2 text-sm capitalize">{tx.type.replaceAll("_", " ")}</td>
                      <td className="border-b px-3 py-2 text-sm capitalize">{tx.status}</td>
                      <td className="border-b px-3 py-2 text-sm">
                        {tx.createdAt ? new Date(tx.createdAt).toLocaleString() : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <GuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </main>
  );
}
