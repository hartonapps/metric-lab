"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";
import { authedFetch } from "@/lib/clientAuth";

type Stats = {
  totalUsers: number;
  totalTeams: number;
  totalCoupons: number;
  totalDeposits: number;
  successfulTx: number;
  failedTx: number;
  pendingTeams: number;
};

type AdminData = {
  stats: Stats;
  users: any[];
  teams: any[];
  transactions: any[];
  coupons: any[];
  gallery: any[];
  caseStudies: any[];
};

const EMPTY_STATS: Stats = {
  totalUsers: 0,
  totalTeams: 0,
  totalCoupons: 0,
  totalDeposits: 0,
  successfulTx: 0,
  failedTx: 0,
  pendingTeams: 0,
};

export default function AdminDashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
const [tab, setTab] = useState<
  "overview" | "users" | "teams" | "transactions" | "coupons" | "gallery" | "caseStudies"
>("overview");

const [data, setData] = useState<AdminData>({
  stats: EMPTY_STATS,
  users: [],
  teams: [],
  transactions: [],
  coupons: [],
  gallery: [],
  caseStudies: [],
});

  const [userSearch, setUserSearch] = useState("");
  const [teamStatus, setTeamStatus] = useState("all");
  const [txStatus, setTxStatus] = useState("all");

  const [newCoupon, setNewCoupon] = useState({
    code: "",
    balanceCredit: 0,
    slotCredit: 0,
    maxUses: "",
    expiresAt: "",
    active: true,
  });
  const [newGallery, setNewGallery] = useState({ url: "", alt: "", order: 0 });
  const [newStudy, setNewStudy] = useState({
    slug: "",
    title: "",
    industry: "",
    overview: "",
    problem: "",
    strategy: "",
    results: "",
    featuredImage: "",
    gallery: "",
    metrics: "",
    status: "draft",
  });

  const fetchOverview = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    try {
      const res = await authedFetch("/api/admin/overview", { method: "GET" });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.message || "Failed to load admin data");
        return;
      }

setData({
  stats: json.stats || EMPTY_STATS,
  users: json.users || [],
  teams: json.teams || [],
  transactions: json.transactions || [],
  coupons: json.coupons || [],
  gallery: json.gallery || [],
  caseStudies: json.caseStudies || [],
});
    } catch {
      setError("Failed to load admin data");
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        setLoading(false);
        setUser(null);
        return;
      }
      setUser(u);
      await fetchOverview();
    });
    return () => unsub();
  }, [fetchOverview]);

  const filteredUsers = useMemo(() => {
    const q = userSearch.toLowerCase().trim();
    if (!q) return data.users;
    return data.users.filter(
      (u) => String(u.email || "").toLowerCase().includes(q) || String(u.uid || "").toLowerCase().includes(q)
    );
  }, [data.users, userSearch]);

  const filteredTeams = useMemo(() => {
    if (teamStatus === "all") return data.teams;
    return data.teams.filter((t) => t.status === teamStatus);
  }, [data.teams, teamStatus]);

  const filteredTx = useMemo(() => {
    if (txStatus === "all") return data.transactions;
    return data.transactions.filter((t) => t.status === txStatus);
  }, [data.transactions, txStatus]);

  async function updateUser(uid: string, patch: Record<string, unknown>) {
    setActionMessage(null);
    setActionLoading(`user:${uid}`);
    try {
      const res = await authedFetch("/api/admin/users", {
        method: "PATCH",
        body: JSON.stringify({ uid, ...patch }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setActionMessage({ type: "error", text: json.message || "Failed to update user" });
        return;
      }
      setActionMessage({ type: "success", text: "User updated successfully." });
      await fetchOverview();
    } finally {
      setActionLoading(null);
    }
  }

  async function updateTeam(id: string, patch: Record<string, unknown>) {
    setActionMessage(null);
    setActionLoading(`team:${id}`);
    try {
      const res = await authedFetch("/api/admin/teams", {
        method: "PATCH",
        body: JSON.stringify({ id, ...patch }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setActionMessage({ type: "error", text: json.message || "Failed to update team" });
        return;
      }
      setActionMessage({ type: "success", text: "Team updated successfully." });
      await fetchOverview();
    } finally {
      setActionLoading(null);
    }
  }

  async function deleteTeam(id: string) {
    setActionMessage(null);
    setActionLoading(`team:${id}`);
    try {
      const res = await authedFetch(`/api/admin/teams?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setActionMessage({ type: "error", text: json.message || "Failed to delete team" });
        return;
      }
      setActionMessage({ type: "success", text: "Team deleted successfully." });
      await fetchOverview();
    } finally {
      setActionLoading(null);
    }
  }

  async function createCoupon() {
    setActionMessage(null);
    setActionLoading("coupon:create");
    try {
      const payload = {
        ...newCoupon,
        code: newCoupon.code.trim().toUpperCase(),
        maxUses: newCoupon.maxUses === "" ? null : Number(newCoupon.maxUses),
      };

      const res = await authedFetch("/api/admin/coupons", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        setActionMessage({ type: "error", text: json.message || "Failed to create coupon" });
        return;
      }

      setNewCoupon({ code: "", balanceCredit: 0, slotCredit: 0, maxUses: "", expiresAt: "", active: true });
      setActionMessage({ type: "success", text: "Coupon created successfully." });
      await fetchOverview();
    } finally {
      setActionLoading(null);
    }
  }

  async function toggleCoupon(id: string, active: boolean) {
    setActionMessage(null);
    setActionLoading(`coupon:${id}`);
    try {
      const res = await authedFetch(`/api/admin/coupons/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify({ active: !active }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setActionMessage({ type: "error", text: json.message || "Failed to update coupon" });
        return;
      }
      setActionMessage({ type: "success", text: "Coupon updated successfully." });
      await fetchOverview();
    } finally {
      setActionLoading(null);
    }
  }

  async function deleteCoupon(id: string) {
    setActionMessage(null);
    setActionLoading(`coupon:${id}`);
    try {
      const res = await authedFetch(`/api/admin/coupons/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setActionMessage({ type: "error", text: json.message || "Failed to delete coupon" });
        return;
      }
      setActionMessage({ type: "success", text: "Coupon deleted successfully." });
      await fetchOverview();
    } finally {
      setActionLoading(null);
    }
  }

  async function fetchGalleryItems() {
    setActionMessage(null);
    setActionLoading("gallery:fetch");
    try {
      const res = await authedFetch("/api/admin/gallery", { method: "GET" });
      const json = await res.json();
      if (res.ok && json.success) {
        setData((prev) => ({ ...prev, gallery: json.gallery || [] }));
      }
    } finally {
      setActionLoading(null);
    }
  }

  async function createGalleryImage() {
    setActionMessage(null);
    setActionLoading("gallery:create");
    try {
      const res = await authedFetch("/api/admin/gallery", {
        method: "POST",
        body: JSON.stringify(newGallery),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setActionMessage({ type: "error", text: json.message || "Failed to add gallery image" });
        return;
      }
      setActionMessage({ type: "success", text: "Gallery image added." });
      setNewGallery({ url: "", alt: "", order: 0 });
      await fetchGalleryItems();
    } finally {
      setActionLoading(null);
    }
  }

  async function deleteGalleryImage(id: string) {
    setActionMessage(null);
    setActionLoading(`gallery:${id}`);
    try {
      const res = await authedFetch(`/api/admin/gallery?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setActionMessage({ type: "error", text: json.message || "Failed to delete image" });
        return;
      }
      setActionMessage({ type: "success", text: "Gallery image deleted." });
      await fetchGalleryItems();
    } finally {
      setActionLoading(null);
    }
  }

  async function fetchCaseStudies() {
    setActionMessage(null);
    setActionLoading("caseStudies:fetch");
    try {
      const res = await authedFetch("/api/admin/case-studies", { method: "GET" });
      const json = await res.json();
      if (res.ok && json.success) {
        setData((prev) => ({ ...prev, caseStudies: json.studies || [] }));
      }
    } finally {
      setActionLoading(null);
    }
  }

  async function createCaseStudy() {
    setActionMessage(null);
    setActionLoading("caseStudies:create");
    try {
      const payload = {
        ...newStudy,
        gallery: newStudy.gallery.split(",").map((url) => url.trim()).filter(Boolean),
        metrics: newStudy.metrics,
      };
      const res = await authedFetch("/api/admin/case-studies", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setActionMessage({ type: "error", text: json.message || "Failed to create case study" });
        return;
      }
      setActionMessage({ type: "success", text: "Case study created." });
      setNewStudy({
        slug: "",
        title: "",
        industry: "",
        overview: "",
        problem: "",
        strategy: "",
        results: "",
        featuredImage: "",
        gallery: "",
        metrics: "",
        status: "draft",
      });
      await fetchCaseStudies();
    } finally {
      setActionLoading(null);
    }
  }

  async function deleteCaseStudy(slug: string) {
    setActionMessage(null);
    setActionLoading(`caseStudies:${slug}`);
    try {
      const res = await authedFetch(`/api/admin/case-studies?slug=${encodeURIComponent(slug)}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setActionMessage({ type: "error", text: json.message || "Failed to delete case study" });
        return;
      }
      setActionMessage({ type: "success", text: "Case study deleted." });
      await fetchCaseStudies();
    } finally {
      setActionLoading(null);
    }
  }

  useEffect(() => {
    if (tab === "gallery") void fetchGalleryItems();
    if (tab === "caseStudies") void fetchCaseStudies();
  }, [tab]);

  if (loading) {
    return <div className="p-8">Loading admin...</div>;
  }

  if (!user) {
    return <div className="p-8">Please login first at `/auth`.</div>;
  }

  return (
    <main className="min-h-screen bg-[#0b0b0e] text-white p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Admin Control Center</h1>
            <p className="text-sm text-gray-400">Manage users, funds, slots, teams, transactions, and coupons.</p>
          </div>
          <button onClick={() => void fetchOverview()} className="rounded-lg bg-blue-600 px-4 py-2 text-sm">
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {error && <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>}
        {actionMessage && (
          <div
            className={`rounded-lg border p-3 text-sm ${
              actionMessage.type === "success"
                ? "border-green-500/40 bg-green-500/10 text-green-300"
                : "border-red-500/40 bg-red-500/10 text-red-300"
            }`}
          >
            {actionMessage.text}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
          <Stat title="Users" value={data.stats.totalUsers} />
          <Stat title="Teams" value={data.stats.totalTeams} />
          <Stat title="Pending Teams" value={data.stats.pendingTeams} />
          <Stat title="Coupons" value={data.stats.totalCoupons} />
          <Stat title="Deposits" value={`NGN ${Number(data.stats.totalDeposits || 0).toLocaleString()}`} />
          <Stat title="Success Tx" value={data.stats.successfulTx} />
          <Stat title="Failed Tx" value={data.stats.failedTx} />
        </div>

        <div className="flex flex-wrap gap-2">
          {(
            ["overview", "users", "teams", "transactions", "coupons", "gallery", "caseStudies"] as const
          ).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-lg px-4 py-2 text-sm capitalize ${
                tab === t ? "bg-white text-black" : "bg-white/10 text-white"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "overview" && (
          <section className="rounded-xl border border-white/10 bg-white/5 p-4">
            <h2 className="mb-3 text-lg font-semibold">Quick Actions</h2>
            <p className="text-sm text-gray-300">Use tabs to perform detailed operations. Fast actions:</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button onClick={() => setTab("coupons")} className="rounded-lg bg-indigo-600 px-3 py-2 text-sm">Create Coupon</button>
              <button onClick={() => setTab("teams")} className="rounded-lg bg-emerald-600 px-3 py-2 text-sm">Moderate Teams</button>
              <button onClick={() => setTab("users")} className="rounded-lg bg-amber-600 px-3 py-2 text-sm">Manage Users</button>
            </div>
          </section>
        )}

        {tab === "users" && (
          <section className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-semibold">Users</h2>
              <input
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search by email or uid"
                className="rounded-lg bg-black/40 px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-3">
              {filteredUsers.slice(0, 200).map((u) => (
                <div key={u.uid} className="rounded-lg border border-white/10 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-medium">{u.email || u.uid}</p>
                      <p className="text-xs text-gray-400">UID: {u.uid}</p>
                      <p className="text-xs text-gray-400">Balance: NGN {Number(u.balance || 0).toLocaleString()} | Slots: {Number(u.slots || 0)}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button disabled={actionLoading === `user:${u.uid}`} onClick={() => void updateUser(u.uid, { blocked: !u.blocked })} className="rounded bg-yellow-600 px-3 py-1 text-xs disabled:opacity-50">
                        {actionLoading === `user:${u.uid}` ? "Working..." : u.blocked ? "Unblock" : "Block"}
                      </button>
                      <button disabled={actionLoading === `user:${u.uid}`} onClick={() => void updateUser(u.uid, { role: u.role === "admin" ? "user" : "admin" })} className="rounded bg-purple-600 px-3 py-1 text-xs disabled:opacity-50">
                        {u.role === "admin" ? "Make User" : "Make Admin"}
                      </button>
                      <button disabled={actionLoading === `user:${u.uid}`} onClick={() => void updateUser(u.uid, { balanceDelta: 1000 })} className="rounded bg-green-600 px-3 py-1 text-xs disabled:opacity-50">+NGN 1000</button>
                      <button disabled={actionLoading === `user:${u.uid}`} onClick={() => void updateUser(u.uid, { slotsDelta: 5 })} className="rounded bg-blue-600 px-3 py-1 text-xs disabled:opacity-50">+5 Slots</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {tab === "teams" && (
          <section className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-semibold">Teams</h2>
              <select value={teamStatus} onChange={(e) => setTeamStatus(e.target.value)} className="rounded-lg bg-black/40 px-3 py-2 text-sm">
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="published">Published</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div className="space-y-3">
              {filteredTeams.slice(0, 200).map((t) => (
                <div key={t.id} className="rounded-lg border border-white/10 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-medium">{t.name}</p>
                      <p className="text-xs text-gray-400">{t.role} | {t.email}</p>
                      <p className="text-xs text-gray-400">Status: {t.status || "pending"}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button disabled={actionLoading === `team:${t.id}`} onClick={() => void updateTeam(t.id, { status: "published" })} className="rounded bg-green-600 px-3 py-1 text-xs disabled:opacity-50">Publish</button>
                      <button disabled={actionLoading === `team:${t.id}`} onClick={() => void updateTeam(t.id, { status: "rejected" })} className="rounded bg-orange-600 px-3 py-1 text-xs disabled:opacity-50">Reject</button>
                      <button disabled={actionLoading === `team:${t.id}`} onClick={() => void updateTeam(t.id, { status: "pending" })} className="rounded bg-blue-600 px-3 py-1 text-xs disabled:opacity-50">Pending</button>
                      <button disabled={actionLoading === `team:${t.id}`} onClick={() => void deleteTeam(t.id)} className="rounded bg-red-600 px-3 py-1 text-xs disabled:opacity-50">{actionLoading === `team:${t.id}` ? "Working..." : "Delete"}</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {tab === "transactions" && (
          <section className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-semibold">Transactions</h2>
              <select value={txStatus} onChange={(e) => setTxStatus(e.target.value)} className="rounded-lg bg-black/40 px-3 py-2 text-sm">
                <option value="all">All</option>
                <option value="success">Success</option>
                <option value="failed">Failed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="space-y-2">
              {filteredTx.slice(0, 300).map((tx) => (
                <div key={tx.id} className="flex flex-wrap items-center justify-between rounded border border-white/10 px-3 py-2 text-sm">
                  <span>{tx.uid}</span>
                  <span>NGN {Number(tx.amount || 0).toLocaleString()}</span>
                  <span>{tx.type}</span>
                  <span className={tx.status === "success" ? "text-green-400" : "text-red-400"}>{tx.status}</span>
                  <span className="text-xs text-gray-400">{tx.createdAt ? new Date(tx.createdAt).toLocaleString() : "-"}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {tab === "coupons" && (
          <section className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-4">
            <h2 className="text-lg font-semibold">Coupons</h2>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-6">
              <label className="flex flex-col gap-1 text-xs text-gray-300">
                Coupon Code
                <input value={newCoupon.code} onChange={(e) => setNewCoupon((p) => ({ ...p, code: e.target.value.toUpperCase() }))} placeholder="WELCOME50" className="rounded bg-black/40 px-3 py-2 text-sm text-white" />
              </label>
              <label className="flex flex-col gap-1 text-xs text-gray-300">
                Balance Credit (NGN)
                <input type="number" value={newCoupon.balanceCredit} onChange={(e) => setNewCoupon((p) => ({ ...p, balanceCredit: Number(e.target.value || 0) }))} placeholder="1000" className="rounded bg-black/40 px-3 py-2 text-sm text-white" />
              </label>
              <label className="flex flex-col gap-1 text-xs text-gray-300">
                Slot Credit
                <input type="number" value={newCoupon.slotCredit} onChange={(e) => setNewCoupon((p) => ({ ...p, slotCredit: Number(e.target.value || 0) }))} placeholder="5" className="rounded bg-black/40 px-3 py-2 text-sm text-white" />
              </label>
              <label className="flex flex-col gap-1 text-xs text-gray-300">
                Max Uses (Optional)
                <input value={newCoupon.maxUses} onChange={(e) => setNewCoupon((p) => ({ ...p, maxUses: e.target.value }))} placeholder="Leave empty for unlimited" className="rounded bg-black/40 px-3 py-2 text-sm text-white" />
              </label>
              <label className="flex flex-col gap-1 text-xs text-gray-300">
                Expiry Date (Optional)
                <input type="datetime-local" value={newCoupon.expiresAt} onChange={(e) => setNewCoupon((p) => ({ ...p, expiresAt: e.target.value }))} className="rounded bg-black/40 px-3 py-2 text-sm text-white" />
              </label>
              <div className="flex items-end">
                <button disabled={actionLoading === "coupon:create"} onClick={() => void createCoupon()} className="w-full rounded bg-indigo-600 px-3 py-2 text-sm disabled:opacity-50">{actionLoading === "coupon:create" ? "Creating..." : "Create Coupon"}</button>
              </div>
            </div>

            <div className="space-y-2">
              {data.coupons.map((c) => (
                <div key={c.id} className="flex flex-wrap items-center justify-between rounded border border-white/10 px-3 py-2 text-sm">
                  <span className="font-medium">{c.id}</span>
                  <span>Balance: NGN {Number(c.balanceCredit || 0).toLocaleString()}</span>
                  <span>Slots: {Number(c.slotCredit || 0)}</span>
                  <span>Used: {Number(c.usedCount || 0)} / {c.maxUses ?? "unlimited"}</span>
                  <span>{c.active ? "Active" : "Disabled"}</span>
                  <div className="flex gap-2">
                    <button disabled={actionLoading === `coupon:${c.id}`} onClick={() => void toggleCoupon(c.id, Boolean(c.active))} className="rounded bg-blue-600 px-2 py-1 text-xs disabled:opacity-50">
                      {actionLoading === `coupon:${c.id}` ? "Working..." : c.active ? "Disable" : "Enable"}
                    </button>
                    <button disabled={actionLoading === `coupon:${c.id}`} onClick={() => void deleteCoupon(c.id)} className="rounded bg-red-600 px-2 py-1 text-xs disabled:opacity-50">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {tab === "gallery" && (
          <section className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-4">
            <h2 className="text-lg font-semibold">Gallery</h2>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
              <label className="text-xs text-gray-300">
                Image URL
                <input
                  value={newGallery.url}
                  onChange={(e) => setNewGallery((prev) => ({ ...prev, url: e.target.value }))}
                  className="mt-1 w-full rounded bg-black/40 px-3 py-2 text-sm text-white"
                  placeholder="https://..."
                />
              </label>
              <label className="text-xs text-gray-300">
                Alt text
                <input
                  value={newGallery.alt}
                  onChange={(e) => setNewGallery((prev) => ({ ...prev, alt: e.target.value }))}
                  className="mt-1 w-full rounded bg-black/40 px-3 py-2 text-sm text-white"
                  placeholder="Description"
                />
              </label>
              <label className="text-xs text-gray-300">
                Order
                <input
                  type="number"
                  value={newGallery.order}
                  onChange={(e) => setNewGallery((prev) => ({ ...prev, order: Number(e.target.value) || 0 }))}
                  className="mt-1 w-full rounded bg-black/40 px-3 py-2 text-sm text-white"
                />
              </label>
              <button
                disabled={actionLoading === "gallery:create"}
                onClick={() => void createGalleryImage()}
                className="rounded bg-indigo-600 px-4 py-2 text-sm text-white disabled:opacity-50"
              >
                {actionLoading === "gallery:create" ? "Adding..." : "Add Image"}
              </button>
            </div>
            <div className="space-y-2">
              {data.gallery.map((item) => (
                <div key={item.id} className="flex flex-wrap items-center justify-between rounded border border-white/10 px-3 py-2 text-sm">
                  <span className="truncate">{item.url}</span>
                  <button
                    disabled={actionLoading === `gallery:${item.id}`}
                    onClick={() => void deleteGalleryImage(item.id)}
                    className="rounded bg-red-600 px-3 py-1 text-xs disabled:opacity-50"
                  >
                    {actionLoading === `gallery:${item.id}` ? "Removing..." : "Delete"}
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {tab === "caseStudies" && (
          <section className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-4">
            <h2 className="text-lg font-semibold">Case Studies</h2>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {[
                { label: "Slug", field: "slug" },
                { label: "Title", field: "title" },
                { label: "Industry", field: "industry" },
                { label: "Featured Image URL", field: "featuredImage" },
              ].map(({ label, field }) => (
                <label key={field} className="text-xs text-gray-300">
                  {label}
                  <input
                    value={newStudy[field as keyof typeof newStudy]}
                    onChange={(e) =>
                      setNewStudy((prev) => ({ ...prev, [field]: e.target.value }))
                    }
                    className="mt-1 w-full rounded bg-black/40 px-3 py-2 text-sm text-white"
                  />
                </label>
              ))}
            </div>
            <div className="grid grid-cols-1 gap-3">
              <label className="text-xs text-gray-300">
                Overview
                <textarea
                  value={newStudy.overview}
                  onChange={(e) => setNewStudy((prev) => ({ ...prev, overview: e.target.value }))}
                  className="mt-1 w-full rounded bg-black/40 px-3 py-2 text-sm text-white"
                />
              </label>
              <label className="text-xs text-gray-300">
                Problem
                <textarea
                  value={newStudy.problem}
                  onChange={(e) => setNewStudy((prev) => ({ ...prev, problem: e.target.value }))}
                  className="mt-1 w-full rounded bg-black/40 px-3 py-2 text-sm text-white"
                />
              </label>
              <label className="text-xs text-gray-300">
                Strategy
                <textarea
                  value={newStudy.strategy}
                  onChange={(e) => setNewStudy((prev) => ({ ...prev, strategy: e.target.value }))}
                  className="mt-1 w-full rounded bg-black/40 px-3 py-2 text-sm text-white"
                />
              </label>
              <label className="text-xs text-gray-300">
                Results
                <textarea
                  value={newStudy.results}
                  onChange={(e) => setNewStudy((prev) => ({ ...prev, results: e.target.value }))}
                  className="mt-1 w-full rounded bg-black/40 px-3 py-2 text-sm text-white"
                />
              </label>
              <label className="text-xs text-gray-300">
                Gallery URLs (comma separated)
                <input
                  value={newStudy.gallery}
                  onChange={(e) => setNewStudy((prev) => ({ ...prev, gallery: e.target.value }))}
                  className="mt-1 w-full rounded bg-black/40 px-3 py-2 text-sm text-white"
                />
              </label>
              <label className="text-xs text-gray-300">
                Metrics (JSON array)
                <textarea
                  value={newStudy.metrics}
                  onChange={(e) => setNewStudy((prev) => ({ ...prev, metrics: e.target.value }))}
                  className="mt-1 w-full rounded bg-black/40 px-3 py-2 text-sm text-white"
                />
              </label>
              <label className="text-xs text-gray-300">
                Status
                <select
                  value={newStudy.status}
                  onChange={(e) => setNewStudy((prev) => ({ ...prev, status: e.target.value }))}
                  className="mt-1 w-full rounded bg-black/40 px-3 py-2 text-sm text-white"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="pending">Pending</option>
                </select>
              </label>
              <button
                disabled={actionLoading === "caseStudies:create"}
                onClick={() => void createCaseStudy()}
                className="rounded bg-indigo-600 px-4 py-2 text-sm text-white disabled:opacity-50"
              >
                {actionLoading === "caseStudies:create" ? "Saving..." : "Save Case Study"}
              </button>
            </div>
            <div className="space-y-2">
              {data.caseStudies.map((study) => (
                <div key={study.slug} className="flex flex-wrap items-center justify-between rounded border border-white/10 px-3 py-2 text-sm">
                  <div>
                    <p className="font-medium">{study.title || study.slug}</p>
                    <p className="text-xs text-gray-400">{study.industry} | {study.status}</p>
                  </div>
                  <button
                    disabled={actionLoading === `caseStudies:${study.slug}`}
                    onClick={() => void deleteCaseStudy(study.slug)}
                    className="rounded bg-red-600 px-3 py-1 text-xs disabled:opacity-50"
                  >
                    {actionLoading === `caseStudies:${study.slug}` ? "Deleting..." : "Delete"}
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function Stat({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-3">
      <p className="text-xs text-gray-400">{title}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}
