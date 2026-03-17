// app/team-directory/page.tsx  (or wherever your TeamDirectory file lives)
"use client";

import { useEffect, useState } from "react";
import TeamCard from "../../components/TeamCard";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";

type TeamMember = {
  name: string;
  role: string;
  bio: string;
  email: string;
  image: string;
  id?: string;
};

export default function TeamDirectory() {
  const [search, setSearch] = useState("");
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    // Query: only published team members (optional). Remove where(...) if not using status.
    const q = query(
      collection(db, "teams"),
      // where("status", "==", "published"), // uncomment if you use status
      orderBy("name", "asc")
    );

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const items: TeamMember[] = snapshot.docs.map((doc) => {
          const data = doc.data() as any;
          return {
            id: doc.id,
            name: data.name || "",
            role: data.role || "",
            bio: data.bio || "",
            email: data.email || "",
            image: data.image || "",
          };
        });
        setTeam(items);
        setLoading(false);
      },
      (err) => {
        console.error("Firestore error:", err);
        setError("Failed to load team. Try again later.");
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  const filteredTeam = team.filter(
    (member) =>
      member.name.toLowerCase().includes(search.toLowerCase()) ||
      member.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">
          Meet Our <span className="text-[#95BF47]">Team</span>
        </h1>

        {/* Search Bar */}
        <div className="mb-8 flex justify-center">
          <input
            type="text"
            placeholder="Search by name or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md px-4 py-2 rounded-lg bg-[#111] border border-gray-800 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#95BF47]"
          />
        </div>

        {/* Status */}
        {loading && <p className="text-center text-gray-300 mb-6">Loading team…</p>}
        {error && <p className="text-center text-red-400 mb-6">{error}</p>}

        {/* Team Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTeam.length === 0 && !loading ? (
            <p className="text-gray-400 col-span-full text-center">No team members found.</p>
          ) : (
            filteredTeam.map((member) => (
              <TeamCard
                key={member.id ?? member.email}
                name={member.name}
                role={member.role}
                bio={member.bio}
                email={member.email}
                image={member.image}
              />
            ))
          )}
        </div>
      </div>
    </main>
  );
        }
