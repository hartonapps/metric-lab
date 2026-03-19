import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebaseClient";
import { User } from "firebase/auth";

// ✅ Create a Firestore user profile with wallet
export async function createUserProfile(user: User) {
  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      balance: 0,          // start wallet with 0
      createdAt: serverTimestamp(),
    });
  }
}

// ✅ Get user wallet balance
export async function getUserBalance(uid: string) {
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) throw new Error("User not found");
  return snap.data()?.balance || 0;
}

// ✅ Add funds to wallet (called after Paystack payment verified)
export async function addFunds(uid: string, amount: number) {
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) throw new Error("User not found");

  const balance = snap.data()?.balance || 0;
  await updateDoc(userRef, { balance: balance + amount });
  return balance + amount;
}