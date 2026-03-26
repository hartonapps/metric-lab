import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const snap = await adminDb
      .collection("caseStudies")
      .orderBy("createdAt", "desc")
      .get();

    const studies = snap.docs.map((doc) => {
      const data = doc.data();
      return {
        slug: data.slug || doc.id,
        title: data.title || "",
        industry: data.industry || "",
        overview: data.overview || "",
        featuredImage: data.featuredImage || "",
        status: data.status || "draft",
      };
    });

    // ✅ Use NextRequest for nextUrl
    const limitParam = req.nextUrl.searchParams.get("limit") || "";
    const limit = Number(limitParam);
    const limited =
      Number.isFinite(limit) && limit > 0 ? studies.slice(0, limit) : studies;

    return NextResponse.json({ success: true, studies: limited });
  } catch (err) {
    console.error("Public case studies error:", err);
    return NextResponse.json(
      { success: false, message: "Unable to load case studies" },
      { status: 500 }
    );
  }
}