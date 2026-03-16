"use client";

import { useState } from "react";
import TeamCard from "../../components/TeamCard";

type TeamMember = {
  name: string;
  role: string;
  bio: string;
  email: string;
  image: string;
};

const TEAM: TeamMember[] = [
{
  name: "Kate Williams",
  role: "Shopify Consultant",
  bio: "Helps brands build, optimize, and scale high-performing Shopify stores.",
  email: "iamkatewilliams084@gmail.com",
  image: "https://randomuser.me/api/portraits/women/1.jpg",
},
];

export default function TeamDirectory() {
  const [search, setSearch] = useState("");

  const filteredTeam = TEAM.filter(
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

        {/* Team Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTeam.map((member) => (
            <TeamCard
              key={member.email}
              name={member.name}
              role={member.role}
              bio={member.bio}
              email={member.email}
              image={member.image}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
