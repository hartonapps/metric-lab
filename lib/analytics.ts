import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";

export const trackVisit = async (page: string) => {
  await addDoc(collection(db, "analytics_visits"), {
    page,
    createdAt: serverTimestamp(),
  });
};