"use client";

import { useState } from "react";

type Props = {
  users?: any[];
  transactions?: any[];
  visits?: any[];
};

export default function Dashboard({ users = [], transactions = [], visits = [] }: Props) {
  const [filter, setFilter] = useState("all");

  // 📊 STATS
  const totalUsers = users.length;

  const successfulTx = (transactions || []).filter((t) => t.status === "success");
  const failedTx = (transactions || []).filter((t) => t.status === "failed");

  const totalDeposits = successfulTx
    .filter((t) => t.type === "deposit")
    .reduce((sum, t) => sum + t.amount, 0);

  // 🔹 Dynamic page visits
  const totalVisits = visits.length;

  // Build unique page boxes
  const pages = Array.from(new Set((visits || []).map((v) => v.pageName)));

  // 🔎 Filtered Transactions
  const filteredTx =
    filter === "all"
      ? transactions || []
      : (transactions || []).filter((t) => t.status === filter);

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-gray-400 text-sm">Financial + system overview</p>
      </div>

      {/* 📊 STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card title="Users" value={totalUsers} />
        <Card title="Deposits" value={`₦${totalDeposits.toLocaleString()}`} />
        <Card title="Successful Tx" value={successfulTx.length} />
        <Card title="Failed Tx" value={failedTx.length} />
        <Card title="Total Visits" value={totalVisits} />
      </div>

      {/* 🔹 PAGE VISIT BOXES */}
      <div>
        <h2 className="text-lg font-medium mt-4 mb-2">Page Visits</h2>
        <div className="grid md:grid-cols-4 gap-4">
          {pages.map((page) => {
            const count = (visits || []).filter((v) => v.pageName === page).length;
            return <Card key={page} title={page} value={`${count} visits`} />;
          })}
        </div>
      </div>

      {/* 🔎 FILTER TABS */}
      <div className="flex gap-2 mt-6">
        <FilterBtn label="All" value="all" current={filter} set={setFilter} />
        <FilterBtn label="Success" value="success" current={filter} set={setFilter} />
        <FilterBtn label="Failed" value="failed" current={filter} set={setFilter} />
      </div>

      {/* 🧾 RECENT TRANSACTIONS */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <h2 className="mb-3 font-medium">Recent Transactions</h2>

        <div className="space-y-2 max-h-80 overflow-y-auto">
          {filteredTx.slice(0, 15).map((t) => (
            <div
              key={t.id}
              className="flex justify-between items-center text-sm border-b border-white/5 pb-2"
            >
              <span className="text-gray-300">{t.userId?.slice(0, 6)}...</span>
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
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* 🔥 CARD COMPONENT */
function Card({ title, value }: any) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:scale-[1.02] transition">
      <p className="text-gray-400 text-sm">{title}</p>
      <h2 className="text-xl font-semibold mt-1">{value}</h2>
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
        active
          ? "bg-blue-600 text-white"
          : "bg-white/5 text-gray-300 hover:bg-white/10"
      }`}
    >
      {label}
    </button>
  );
}