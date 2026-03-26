"use client";

import { useEffect } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";

type TrackPageProps = {
  pageName: string;
};

export default function TrackPage({ pageName }: TrackPageProps) {
  useEffect(() => {
    const visitedKey = `visited_${pageName}`;

    if (localStorage.getItem(visitedKey)) return;

    const trackVisit = async () => {
      try {
        await addDoc(collection(db, "analytics_visits"), {
          pageName,
          timestamp: serverTimestamp(),
        });
      } catch {
        // Ignore analytics write errors to avoid noisy console for end-users.
      } finally {
        localStorage.setItem(visitedKey, "true");
      }
    };

    void trackVisit();
  }, [pageName]);

  return null;
}