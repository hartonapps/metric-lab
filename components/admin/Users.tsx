"use client";

import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  increment,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebaseClient";

export default function Users({ transactions }: any) {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [amount, setAmount] = useState("");

  // 🔄 live users
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), (snap) => {
      setUsers(
        snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }))
      );
    });

    return () => unsub();
  }, []);

  // 🔍 filter users live
  const filteredUsers = users.filter((u) => {
    const val = search.toLowerCase();
    return (
      u.email?.toLowerCase().includes(val) ||
      u.uid?.toLowerCase().includes(val)
    );
  });

  // 💰 adjust balance
  const adjustBalance = async (userId: string, value: number) => {
    await updateDoc(doc(db, "users", userId), {
      balance: increment(value),
    });

    alert("Balance updated");
  };

  // 🚫 block user
  const toggleBlock = async (userId: string, current: boolean) => {
    await updateDoc(doc(db, "users", userId), {
      blocked: !current,
    });
  };

  // 🧾 user transactions
const userTx = (transactions || []).filter(
  (t: any) => t.userId === selectedUser?.uid
);

  return (
    <div className="mt-10 space-y-6">
      
      {/* HEADER */}
      <div>
        <h2 className="text-xl font-semibold">Users</h2>
        <p className="text-gray-400 text-sm">
          Search, manage balances, monitor activity
        </p>
      </div>

      {/* 🔍 SEARCH */}
      <input
        placeholder="Search by email or UID..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-3 rounded-lg bg-white/5 border border-white/10 focus:outline-none"
      />

      {/* 👥 USER LIST */}
      <div className="grid md:grid-cols-2 gap-4">
        {filteredUsers.slice(0, 20).map((u) => (
          <div
            key={u.id}
            onClick={() => setSelectedUser(u)}
            className="cursor-pointer bg-white/5 border border-white/10 p-4 rounded-xl hover:bg-white/10 transition"
          >
            <p className="font-medium">{u.email}</p>
            <p className="text-sm text-gray-400">
              ₦{u.balance || 0}
            </p>

            {u.blocked && (
              <span className="text-xs text-red-400">Blocked</span>
            )}
          </div>
        ))}
      </div>

      {/* 🧑 SELECTED USER PANEL */}
      {selectedUser && (
        <div className="bg-white/5 border border-white/10 p-6 rounded-xl space-y-4">
          
          <h3 className="text-lg font-semibold">
            {selectedUser.email}
          </h3>

          <p>UID: {selectedUser.uid}</p>
          <p>Balance: ₦{selectedUser.balance || 0}</p>

          {/* 💰 BALANCE CONTROL */}
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="p-2 rounded bg-black/40 border border-white/10"
            />

            <button
              onClick={() =>
                adjustBalance(selectedUser.id, Number(amount))
              }
              className="bg-green-600 px-3 py-2 rounded"
            >
              Add
            </button>

            <button
              onClick={() =>
                adjustBalance(selectedUser.id, -Number(amount))
              }
              className="bg-red-600 px-3 py-2 rounded"
            >
              Remove
            </button>
          </div>

          {/* 🚫 BLOCK */}
          <button
            onClick={() =>
              toggleBlock(selectedUser.id, selectedUser.blocked)
            }
            className="bg-yellow-600 px-3 py-2 rounded"
          >
            {selectedUser.blocked ? "Unblock User" : "Block User"}
          </button>

          {/* 🧾 USER TRANSACTIONS */}
          <div>
            <h4 className="mt-4 mb-2 font-medium">
              User Transactions
            </h4>

            <div className="max-h-60 overflow-y-auto space-y-2">
              {userTx.map((t: any) => (
                <div
                  key={t.id}
                  className="flex justify-between text-sm border-b border-white/5 pb-1"
                >
                  <span>₦{t.amount}</span>
                  <span>{t.type}</span>
                  <span
                    className={
                      t.status === "success"
                        ? "text-green-400"
                        : "text-red-400"
                    }
                  >
                    {t.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}