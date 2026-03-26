"use client";

import { useEffect, useMemo, useState } from "react";
import TeamCard from "../../components/TeamCard";

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

    const fetchTeams = async () => {
      try {
        const res = await fetch("/api/public-teams");
        if (!res.ok) throw new Error("Failed to load teams");
        const data = await res.json();
        setTeam(data.teams || []);
      } catch (err) {
        console.error("Team directory error:", err);
        setError("Failed to load team. Try again later.");
      } finally {
        setLoading(false);
      }
    };

    void fetchTeams();
  }, []);

  const filteredTeam = useMemo(
    () =>
      team.filter(
        (member) =>
          member.name.toLowerCase().includes(search.toLowerCase()) ||
          member.role.toLowerCase().includes(search.toLowerCase())
      ),
    [search, team]
  );

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">
          Meet Our <span className="text-[#95BF47]">Team</span>
        </h1>

        <div className="mb-8 flex justify-center">
          <input
            type="text"
            placeholder="Search by name or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md px-4 py-2 rounded-lg bg-[#111] border border-gray-800 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#95BF47]"
          />
        </div>

        {loading && <p className="text-center text-gray-300 mb-6">Loading team…</p>}
        {error && <p className="text-center text-red-400 mb-6">{error}</p>}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {!loading && filteredTeam.length === 0 ? (
            <p className="text-gray-400 col-span-full text-center">
              No team members found.
            </p>
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
