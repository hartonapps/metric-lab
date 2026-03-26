import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { User } from "firebase/auth";
import { db } from "./firebaseClient";

export async function createUserProfile(user: User) {
  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      balance: 0,
      slots: 0,
      role: "user",
      blocked: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return;
  }

  const data = snap.data();
  const patch: Record<string, unknown> = {
    updatedAt: serverTimestamp(),
  };

  if (typeof data.balance !== "number") patch.balance = 0;
  if (typeof data.slots !== "number") patch.slots = 0;
  if (!data.role) patch.role = "user";
  if (typeof data.blocked !== "boolean") patch.blocked = false;

  await updateDoc(userRef, patch);
}

export async function getUserBalance(uid: string) {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) throw new Error("User not found");
  return snap.data()?.balance || 0;
}

export async function logDeposit(uid: string, amount: number) {
  await addDoc(collection(db, "transactions"), {
    uid,
    amount,
    type: "deposit",
    status: "success",
    createdAt: serverTimestamp(),
  });
}