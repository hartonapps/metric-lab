"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebaseClient";
import { User } from "firebase/auth";
import TeamForm from "@/components/TeamForm";
import FundWallet from "@/components/FundWallet";
import { getUserBalance, createUserProfile } from "@/lib/firebaseUsers";

export default function AddTeamPage() {
const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);

  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (!isMounted) return;

      if (!currentUser) {
        router.replace("/auth");
        return;
      }

      setUser(currentUser);

      try {
        await createUserProfile(currentUser);
        const bal = await getUserBalance(currentUser.uid);

        if (isMounted) setBalance(bal || 0);
      } catch (err) {
        console.error("Error fetching balance:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [router]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.replace("/auth");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  // 🔄 Loading state
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

        {/* BALANCE CARD */}
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

        {/* FORM CARD */}
        <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-6 md:p-8 transition hover:shadow-xl">
          <TeamForm
            user={user}
            balance={balance}
            setBalance={setBalance}
          />
        </div>
      </div>
    </main>
  );
}