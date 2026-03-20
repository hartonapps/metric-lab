"use client";

import TrackPage from "@/components/analytics/TrackPage";
import GuideModal from "@/components/GuideModal";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebaseClient";
import { User } from "firebase/auth";
import TeamForm from "@/components/TeamForm";
import FundWallet from "@/components/FundWallet";
import { createUserProfile } from "@/lib/firebaseUsers";
import { collection, doc, onSnapshot, query, orderBy, where } from "firebase/firestore";

type Transaction = {
  id: string;
  uid: string;
  amount: number;
  type: string;
  status: string;
  createdAt: any;
};

export default function AddTeamPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [txLoading, setTxLoading] = useState(true);
  // top of AddTeamPage
const [isGuideOpen, setIsGuideOpen] = useState(false);

  const router = useRouter();

  /**
   * ✅ AUTH + REAL-TIME BALANCE
   */
  useEffect(() => {
    let isMounted = true;
    let unsubscribeBalance: (() => void) | null = null;

    const unsubscribeAuth = auth.onAuthStateChanged(async (currentUser) => {
      if (!isMounted) return;

      if (!currentUser) {
        router.replace("/auth");
        return;
      }

      setUser(currentUser);

      try {
        // Ensure user profile exists
        await createUserProfile(currentUser);

        // Real-time balance listener
        const userRef = doc(db, "users", currentUser.uid);
        unsubscribeBalance = onSnapshot(
          userRef,
          (snap) => {
            if (!isMounted) return;

            if (snap.exists()) {
              const data = snap.data();
              setBalance(data.balance || 0);
            }
          },
          (err) => console.error("Balance listener error:", err)
        );
      } catch (err) {
        console.error("Error setting up balance listener:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribeAuth();
      if (unsubscribeBalance) unsubscribeBalance();
    };
  }, [router]);

  
  /**
   * ✅ REAL-TIME TRANSACTIONS
   */
  useEffect(() => {
    if (!user?.uid) return;

    setTxLoading(true);

    const txQuery = query(
      collection(db, "transactions"),
      where("uid", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      txQuery,
      (snapshot) => {
        const txs: Transaction[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as Transaction));

        setTransactions(txs);
        setTxLoading(false);
      },
      (err) => console.error("Transactions listener error:", err)
    );

    return () => unsubscribe();
  }, [user?.uid]);

  

  /**
   * ✅ LOGOUT
   */
  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.replace("/auth");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500">
        <p className="animate-pulse text-lg">Checking authentication...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-6 sm:py-10">
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
     <TrackPage pageName="Add Team Page" />

        {/* HEADER */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Add Team Member
          </h1>

          <button
            onClick={handleLogout}
            className="w-full sm:w-auto px-4 py-2 bg-red-500 hover:bg-red-600 active:scale-95 transition text-white rounded-lg shadow-md"
          >
            Logout
          </button>
        </header>

        

        {/* BALANCE */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 bg-gray-900 text-white rounded-2xl p-5 sm:p-6 mb-8 shadow-xl">
          <div>
            <p className="text-sm opacity-70">Your balance</p>
            <p className="text-2xl sm:text-3xl font-bold tracking-wide mt-1">
              ₦{balance.toLocaleString()}
            </p>
          </div>

          <div className="w-full sm:w-auto">
            <FundWallet user={user} setBalance={setBalance} />
          </div>
        </div>

        {/* TEAM FORM */}
        <div >
          <TeamForm
            user={user}
            balance={balance}
            setBalance={setBalance}
          />
        </div>

        <br />
        <br />
      {/* SHOW GUIDE BUTTON */}
<div className="mb-4">
  <button
    onClick={() => setIsGuideOpen(true)}
    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
  >
    Show Guide
  </button>
</div>

<GuideModal
  isOpen={isGuideOpen}
  onClose={() => setIsGuideOpen(false)}
/>

        {/* TRANSACTIONS */}
        <div className="w-full mt-8">
          <h2 className="text-xl font-bold mb-4 text-gray-900">
            Transaction History
          </h2>

          {txLoading ? (
            <p className="text-gray-600 animate-pulse">Loading transactions...</p>
          ) : transactions.length === 0 ? (
            <p className="text-gray-600">No transactions found.</p>
          ) : (
            <div className="overflow-auto">
              <table className="w-full table-auto border-collapse text-black">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    <th className="px-3 py-2 border-b">User</th>
                    <th className="px-3 py-2 border-b">Amount</th>
                    <th className="px-3 py-2 border-b">Type</th>
                    <th className="px-3 py-2 border-b">Status</th>
                    <th className="px-3 py-2 border-b">Date</th>
                  </tr>
                </thead>

                <tbody>
                 {transactions
  .filter(tx => tx.type === "team_submission" || tx.type === "deposit")
  .map((tx) => (
    <tr
      key={tx.id}
      className={`hover:bg-gray-50 transition ${
        tx.status === "failed" ? "bg-red-50 text-red-600" : ""
      }`}
    >
      <td className="px-3 py-2 border-b text-sm break-words">{tx.uid}</td>
      <td className="px-3 py-2 border-b text-sm">₦{tx.amount}</td>
      <td className="px-3 py-2 border-b text-sm capitalize">{tx.type}</td>
      <td className="px-3 py-2 border-b text-sm capitalize">{tx.status}</td>
      <td className="px-3 py-2 border-b text-sm">{tx.createdAt?.toDate?.().toLocaleString()}</td>
    </tr>
  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}