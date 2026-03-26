import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { requireAdmin } from "@/lib/serverAdmin";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  const url = new URL(req.url);
  const status = url.searchParams.get("status");

  let query = adminDb.collection("transactions").orderBy("createdAt", "desc").limit(500);
  if (status && status !== "all") {
    query = adminDb.collection("transactions").where("status", "==", status).orderBy("createdAt", "desc").limit(500);
  }

  const snap = await query.get();
  const transactions = snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      ...data,
      createdAt: data.createdAt?.toDate?.()?.toISOString?.() || null,
    };
  });

  return NextResponse.json({ success: true, transactions });
}