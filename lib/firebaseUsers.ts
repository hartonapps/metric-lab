// lib/firebaseUsers.ts
import { doc, setDoc, getDoc, updateDoc, serverTimestamp, collection, addDoc } from "firebase/firestore";
import { db } from "./firebaseClient";
import { User } from "firebase/auth";

/**
 * ✅ Create a Firestore user profile with wallet
 */
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

/**
 * ✅ Get user wallet balance
 */
export async function getUserBalance(uid: string) {
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) throw new Error("User not found");
  return snap.data()?.balance || 0;
}

/**
 * ✅ Add funds to wallet and log transaction
 */
export async function addFunds(uid: string, amount: number) {
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) throw new Error("User not found");

  const balance = snap.data()?.balance || 0;
  const newBalance = balance + amount;

  await updateDoc(userRef, { balance: newBalance });

  // 🔹 Log deposit in transactions
  await logDeposit(uid, amount);

  return newBalance;
}

/**
 * ✅ Log deposit in transactions collection
 */
export async function logDeposit(uid: string, amount: number) {
  try {
    await addDoc(collection(db, "transactions"), {
      uid,
      amount,
      type: "deposit",
      status: "success",
      createdAt: serverTimestamp(),
    });
    console.log("Deposit logged successfully!");
  } catch (err) {
    console.error("Failed to log deposit:", err);
  }
}