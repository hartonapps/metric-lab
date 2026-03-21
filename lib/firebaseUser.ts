import { doc, getDoc, updateDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";

export async function addFunds(uid: string, amount: number, reference: string) {
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) throw new Error("User not found");

  const balance = snap.data()?.balance || 0;
  const newBalance = balance + amount;

  await updateDoc(userRef, { balance: newBalance });

  // 🔥 Log transaction WITH reference
  await addDoc(collection(db, "transactions"), {
    uid,
    amount,
    type: "deposit",
    status: "success",
    reference,
    createdAt: serverTimestamp(),
  });

  return newBalance;
}