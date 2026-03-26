import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";

export async function GET(req: Request, { params }: { params: { slug: string } }) {
  try {
    const slug = String(params.slug || "").trim();
    if (!slug) return NextResponse.json({ success: false, message: "Slug required" }, { status: 400 });

    const snap = await adminDb.collection("caseStudies").where("slug", "==", slug).limit(1).get();
    if (snap.empty) {
      return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
    }

    const data = snap.docs[0].data();
    return NextResponse.json({
      success: true,
      study: {
        slug: data.slug || "",
        title: data.title || "",
        industry: data.industry || "",
        overview: data.overview || "",
        problem: data.problem || "",
        strategy: data.strategy || "",
        results: data.results || "",
        featuredImage: data.featuredImage || "",
        gallery: data.gallery || [],
        metrics: data.metrics || [],
      },
    });
  } catch (err) {
    console.error("Case study detail error:", err);
    return NextResponse.json({ success: false, message: "Unable to load case study" }, { status: 500 });
  }
}
