import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/serverAdmin";
import { adminDb } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  const [usersSnap, txSnap, teamsSnap, couponsSnap] = await Promise.all([
    adminDb.collection("users").limit(500).get(),
    adminDb.collection("transactions").orderBy("createdAt", "desc").limit(300).get(),
    adminDb.collection("teams").orderBy("createdAt", "desc").limit(300).get(),
    adminDb.collection("coupons").limit(200).get(),
  ]);

  const users = usersSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const transactions = txSnap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      ...data,
      createdAt: data.createdAt?.toDate?.()?.toISOString?.() || null,
    };
  });
  const teams = teamsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const coupons = couponsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

  return NextResponse.json({
    success: true,
    stats: {
      totalUsers: users.length,
      totalTeams: teams.length,
      totalCoupons: coupons.length,
      totalDeposits: transactions
        .filter((t: any) => t.type === "deposit" && t.status === "success")
        .reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0),
      successfulTx: transactions.filter((t: any) => t.status === "success").length,
      failedTx: transactions.filter((t: any) => t.status === "failed").length,
      pendingTeams: teams.filter((t: any) => t.status === "pending").length,
    },
    users,
    transactions,
    teams,
    coupons,
  });
}