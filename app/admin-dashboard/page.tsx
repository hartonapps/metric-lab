"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";

import AdminGate from "@/components/admin/AdminGate";
import Dashboard from "@/components/admin/Dashboard";
import Users from "@/components/admin/Users";
import Transactions from "@/components/admin/Transactions";
import Teams from "@/components/admin/Teams";

export default function AdminPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [visits, setVisits] = useState<any[]>([]);

  useEffect(() => {
    const u = onSnapshot(collection(db, "users"), s =>
      setUsers(s.docs.map(d => ({ id: d.id, ...d.data() })))
    );

    const t = onSnapshot(collection(db, "transactions"), s =>
      setTransactions(s.docs.map(d => ({ id: d.id, ...d.data() })))
    );

    const tm = onSnapshot(collection(db, "teams"), s =>
      setTeams(s.docs.map(d => ({ id: d.id, ...d.data() })))
    );

    const v = onSnapshot(collection(db, "analytics_visits"), s =>
      setVisits(s.docs.map(d => ({ id: d.id, ...d.data() })))
    );

    return () => {
      u(); t(); tm(); v();
    };
  }, []);

  return (
    <AdminGate>
      <div className="p-6">
        <Dashboard users={users} transactions={transactions} visits={visits} />
        <Users />
        <br />
        <br />
        <Transactions transactions={transactions} />
        <Teams teams={teams} />
      </div>
    </AdminGate>
  );
}