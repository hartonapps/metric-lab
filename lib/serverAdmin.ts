import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { requireAuth } from "@/lib/serverAuth";

type AdminUser = { uid: string; email?: string };

function parseCsv(value?: string | null) {
  if (!value) return [];
  return value.split(",").map((x) => x.trim().toLowerCase()).filter(Boolean);
}

export async function requireAdmin(req: Request): Promise<AdminUser | NextResponse> {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  if (process.env.ADMIN_ALLOW_ALL_AUTHED === "true") {
    return auth;
  }

  const adminEmails = parseCsv(process.env.ADMIN_EMAILS);
  const adminUids = parseCsv(process.env.ADMIN_UIDS);

  if (auth.email && adminEmails.includes(auth.email.toLowerCase())) {
    return auth;
  }

  if (adminUids.includes(auth.uid.toLowerCase())) {
    return auth;
  }

  const userSnap = await adminDb.collection("users").doc(auth.uid).get();
  const role = String(userSnap.data()?.role || "user").toLowerCase();

  if (role === "admin") {
    return auth;
  }

  return NextResponse.json({ success: false, message: "Admin access denied" }, { status: 403 });
}