import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { requireAdmin } from "@/lib/serverAdmin";

export const runtime = "nodejs";

function sanitizeMetrics(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((item) => ({
      value: String((item as any).value || ""),
      label: String((item as any).label || ""),
      color: String((item as any).color || "text-green-400"),
    }));
  }
  try {
    const parsed = JSON.parse(String(value));
    if (Array.isArray(parsed)) return sanitizeMetrics(parsed);
  } catch {
    return [];
  }
  return [];
}

export async function GET(req: Request) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  const snap = await adminDb.collection("caseStudies").orderBy("createdAt", "desc").get();
  const studies = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  return NextResponse.json({ success: true, studies });
}

export async function POST(req: Request) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  const body = await req.json();
  const slug = String(body.slug || "").trim();
  if (!slug) return NextResponse.json({ success: false, message: "Slug required" }, { status: 400 });

  await adminDb.collection("caseStudies").doc(slug).set({
    slug,
    title: String(body.title || ""),
    industry: String(body.industry || ""),
    overview: String(body.overview || ""),
    problem: String(body.problem || ""),
    strategy: String(body.strategy || ""),
    results: String(body.results || ""),
    featuredImage: String(body.featuredImage || ""),
    gallery: Array.isArray(body.gallery) ? body.gallery : [],
    metrics: sanitizeMetrics(body.metrics),
    status: String(body.status || "draft"),
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  return NextResponse.json({ success: true, message: "Case study created" });
}

export async function PATCH(req: Request) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  const body = await req.json();
  const slug = String(body.slug || "").trim();
  if (!slug) return NextResponse.json({ success: false, message: "Slug required" }, { status: 400 });

  const updates: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() };
  if (typeof body.title === "string") updates.title = body.title;
  if (typeof body.industry === "string") updates.industry = body.industry;
  if (typeof body.overview === "string") updates.overview = body.overview;
  if (typeof body.problem === "string") updates.problem = body.problem;
  if (typeof body.strategy === "string") updates.strategy = body.strategy;
  if (typeof body.results === "string") updates.results = body.results;
  if (typeof body.featuredImage === "string") updates.featuredImage = body.featuredImage;
  if (Array.isArray(body.gallery)) updates.gallery = body.gallery;
  if (body.metrics) updates.metrics = sanitizeMetrics(body.metrics);
  if (typeof body.status === "string") updates.status = body.status;

  await adminDb.collection("caseStudies").doc(slug).set(updates, { merge: true });
  return NextResponse.json({ success: true, message: "Case study updated" });
}

export async function DELETE(req: Request) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  const url = new URL(req.url);
  const slug = String(url.searchParams.get("slug") || "").trim();
  if (!slug) return NextResponse.json({ success: false, message: "Slug required" }, { status: 400 });

  await adminDb.collection("caseStudies").doc(slug).delete();
  return NextResponse.json({ success: true, message: "Case study deleted" });
}
