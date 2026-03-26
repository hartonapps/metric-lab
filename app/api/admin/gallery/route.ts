import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { requireAdmin } from "@/lib/serverAdmin";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  const snap = await adminDb.collection("gallery").orderBy("order", "asc").get();
  const gallery = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  return NextResponse.json({ success: true, gallery });
}

export async function POST(req: Request) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  const body = await req.json();
  const url = String(body.url || "").trim();
  if (!url) return NextResponse.json({ success: false, message: "Image URL required" }, { status: 400 });

  const docRef = adminDb.collection("gallery").doc();
  await docRef.set({
    url,
    alt: String(body.alt || "").trim(),
    order: Number(body.order) || Date.now(),
    createdAt: FieldValue.serverTimestamp(),
  });

  return NextResponse.json({ success: true, message: "Gallery image added" });
}

export async function PATCH(req: Request) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  const body = await req.json();
  const id = String(body.id || "").trim();
  if (!id) return NextResponse.json({ success: false, message: "id required" }, { status: 400 });

  const updates: Record<string, unknown> = {};
  if (typeof body.url === "string") updates.url = body.url.trim();
  if (typeof body.alt === "string") updates.alt = body.alt.trim();
  if (typeof body.order === "number") updates.order = body.order;
  updates.updatedAt = FieldValue.serverTimestamp();

  await adminDb.collection("gallery").doc(id).set(updates, { merge: true });
  return NextResponse.json({ success: true, message: "Gallery image updated" });
}

export async function DELETE(req: Request) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  const url = new URL(req.url);
  const id = String(url.searchParams.get("id") || "").trim();
  if (!id) return NextResponse.json({ success: false, message: "id required" }, { status: 400 });

  await adminDb.collection("gallery").doc(id).delete();
  return NextResponse.json({ success: true, message: "Gallery image deleted" });
}
