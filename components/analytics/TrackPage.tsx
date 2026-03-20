"use client";

import { useEffect } from "react";
import { collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";

type TrackPageProps = {
  pageName: string;
};

export default function TrackPage({ pageName }: TrackPageProps) {
  useEffect(() => {
    const visitedKey = `visited_${pageName}`;

    // ✅ Check if this page was already visited on this browser
    if (!localStorage.getItem(visitedKey)) {
      const trackVisit = async () => {
        try {
          await addDoc(collection(db, "analytics_visits"), {
            pageName,
            timestamp: serverTimestamp(),
          });

          // Mark as visited in localStorage
          localStorage.setItem(visitedKey, "true");
        } catch (err) {
          console.error("Error tracking page visit:", err);
        }
      };
      trackVisit();
    }
  }, [pageName]);

  return null;
}