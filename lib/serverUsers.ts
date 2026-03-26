import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebaseAdmin";

export type UserWallet = {
  uid: string;
  email: string | null;
  balance: number;
  slots: number;
  blocked: boolean;
  role: string;
};

export async function ensureServerUser(uid: string, email?: string | null): Promise<UserWallet> {
  const userRef = adminDb.collection("users").doc(uid);
  const snap = await userRef.get();

  if (!snap.exists) {
    const profile: UserWallet = {
      uid,
      email: email || null,
      balance: 0,
      slots: 0,
      blocked: false,
      role: "user",
    };

    await userRef.set({
      ...profile,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return profile;
  }

  const data = snap.data() || {};
  const normalized: UserWallet = {
    uid,
    email: typeof data.email === "string" ? data.email : email || null,
    balance: typeof data.balance === "number" ? data.balance : 0,
    slots: typeof data.slots === "number" ? data.slots : 0,
    blocked: Boolean(data.blocked),
    role: typeof data.role === "string" ? data.role : "user",
  };

  await userRef.set(
    {
      email: normalized.email,
      balance: normalized.balance,
      slots: normalized.slots,
      blocked: normalized.blocked,
      role: normalized.role,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  return normalized;
}