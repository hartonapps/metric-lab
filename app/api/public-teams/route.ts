import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const snap = await adminDb.collection("teams").orderBy("name", "asc").get();

    const teams = snap.docs
      .map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || "",
          role: data.role || "",
          bio: data.bio || "",
          email: data.email || "",
          image: data.image || "",
          status: data.status || "",
        };
      })
      .filter((item) => item.status === "published");

    const url = new URL(req.url);
    const limitParam = Number(url.searchParams.get("limit") || "");
    const limitedTeams =
      Number.isFinite(limitParam) && limitParam > 0 ? teams.slice(0, limitParam) : teams;

    return NextResponse.json({ success: true, teams: limitedTeams });
  } catch (err) {
    console.error("Public teams error:", err);
    return NextResponse.json({ success: false, message: "Unable to load teams" }, { status: 500 });
  }
}
