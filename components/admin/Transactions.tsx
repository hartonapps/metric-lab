"use client";

import { useState, useMemo } from "react";

type Transaction = {
  id: string;
  userId: string;
  email?: string;
  amount: number;
  type: string; // deposit/withdraw
  status: string; // success/failed
  timestamp: any;
};

type Props = {
  transactions: Transaction[];
  users: { uid: string; email: string }[];
};

export default function Transactions({ transactions = [], users = [] }: Props) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  // 🔹 Filtered transactions
const filteredTx = useMemo(() => {
  let tx = [...(transactions || [])];

  // Filter by status
  if (filter !== "all") {
    tx = tx.filter((t) => t?.status === filter);
  }

  // Filter by user UID or email safely
  if (search.trim()) {
    const searchLower = search.toLowerCase();

    tx = tx.filter((t) => {
      const user = (users || []).find((u) => u?.uid === t?.userId);

      const email =
        user && typeof user.email === "string"
          ? user.email.toLowerCase()
          : "";

      const uid =
        typeof t?.userId === "string"
          ? t.userId.toLowerCase()
          : "";

      return uid.includes(searchLower) || email.includes(searchLower);
    });
  }

  // Sort newest first safely
  tx.sort(
    (a, b) =>
      (b?.timestamp?.seconds || 0) - (a?.timestamp?.seconds || 0)
  );

  return tx;
}, [transactions, users, search, filter]);

  return (
    <div className="space-y-4">
      {/* Search & Filter */}
      <div className="flex flex-wrap gap-2 items-center">
        <input
          type="text"
          placeholder="Search by UID or email..."
          className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm flex-1"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <FilterBtn label="All" value="all" current={filter} set={setFilter} />
        <FilterBtn label="Success" value="success" current={filter} set={setFilter} />
        <FilterBtn label="Failed" value="failed" current={filter} set={setFilter} />
      </div>

      {/* Transactions Table */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 max-h-96 overflow-y-auto">
        {filteredTx.length === 0 ? (
          <p className="text-gray-400 text-sm">No transactions found.</p>
        ) : (
          filteredTx.map((t) => {
            const user = users.find((u) => u.uid === t.userId);
            return (
              <div
                key={t.id}
                className="flex justify-between items-center text-sm border-b border-white/5 py-2"
              >
                <span className="text-gray-300">{user?.email || t.userId}</span>
                <span className="font-medium">₦{t.amount}</span>
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    t.status === "success"
                      ? "bg-green-500/20 text-green-400"
                      : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {t.status}
                </span>
                <span className="text-gray-400 text-xs">{t.type}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

/* 🔘 FILTER BUTTON COMPONENT */
function FilterBtn({ label, value, current, set }: any) {
  const active = current === value;

  return (
    <button
      onClick={() => set(value)}
      className={`px-4 py-2 rounded-lg text-sm transition ${
        active ? "bg-blue-600 text-white" : "bg-white/5 text-gray-300 hover:bg-white/10"
      }`}
    >
      {label}
    </button>
  );
}