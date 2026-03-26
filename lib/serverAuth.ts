import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebaseAdmin";

export type AuthenticatedUser = {
  uid: string;
  email?: string;
};

type FirebaseLookupUser = {
  localId: string;
  email?: string;
};

async function verifyWithIdentityToolkit(token: string): Promise<AuthenticatedUser | null> {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) return null;

  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: token }),
      cache: "no-store",
    }
  );

  if (!res.ok) return null;

  const data = (await res.json()) as { users?: FirebaseLookupUser[] };
  const user = data.users?.[0];

  if (!user?.localId) return null;

  return {
    uid: user.localId,
    email: user.email,
  };
}

export async function requireAuth(req: Request): Promise<AuthenticatedUser | NextResponse> {
  const header = req.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";

  if (!token) {
    return NextResponse.json({ success: false, message: "Missing auth token" }, { status: 401 });
  }

  try {
    const decoded = await adminAuth.verifyIdToken(token, true);
    return {
      uid: decoded.uid,
      email: decoded.email,
    };
  } catch {
    try {
      const fallback = await verifyWithIdentityToolkit(token);
      if (fallback) return fallback;
    } catch {
      // no-op
    }

    return NextResponse.json(
      {
        success: false,
        message: "Invalid auth token. Add FIREBASE_CLIENT_EMAIL/FIREBASE_PRIVATE_KEY for strict server verification.",
      },
      { status: 401 }
    );
  }
}