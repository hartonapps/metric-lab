import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";

export async function GET() {
  try {
    const snap = await adminDb.collection("gallery").orderBy("order", "asc").get();
    const images = snap.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        url: data.url || "",
        alt: data.alt || "",
      };
    });

    return NextResponse.json({ success: true, gallery: images.slice(0, 10) });
  } catch (err) {
    console.error("Public gallery error:", err);
    return NextResponse.json({ success: false, message: "Unable to load gallery" }, { status: 500 });
  }
}
