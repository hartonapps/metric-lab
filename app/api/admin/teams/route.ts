import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { requireAdmin } from "@/lib/serverAdmin";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  const url = new URL(req.url);
  const status = url.searchParams.get("status");

  let query = adminDb.collection("teams").orderBy("createdAt", "desc").limit(500);
  if (status && status !== "all") {
    query = adminDb.collection("teams").where("status", "==", status).orderBy("createdAt", "desc").limit(500);
  }

  const snap = await query.get();
  const teams = snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      ...data,
      createdAt: data.createdAt?.toDate?.()?.toISOString?.() || null,
    };
  });

  return NextResponse.json({ success: true, teams });
}

export async function PATCH(req: Request) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  const body = await req.json();
  const id = String(body.id || "").trim();
  if (!id) return NextResponse.json({ success: false, message: "id required" }, { status: 400 });

  const patch: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() };
  if (typeof body.status === "string") patch.status = body.status;
  if (typeof body.name === "string") patch.name = body.name.trim();

  await adminDb.collection("teams").doc(id).set(patch, { merge: true });

  return NextResponse.json({ success: true, message: "Team updated" });
}

export async function DELETE(req: Request) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  const url = new URL(req.url);
  const id = String(url.searchParams.get("id") || "").trim();
  if (!id) return NextResponse.json({ success: false, message: "id required" }, { status: 400 });

  await adminDb.collection("teams").doc(id).delete();
  return NextResponse.json({ success: true, message: "Team deleted" });
}