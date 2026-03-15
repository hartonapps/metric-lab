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
    name: "Alice Johnson",
    role: "Shopify Engineer",
    bio: "Builds scalable and optimized Shopify stores.",
    email: "alice@metriclab.com",
    image: "https://randomuser.me/api/portraits/women/68.jpg",
  },
  {
    name: "Bob Smith",
    role: "SEO",
    bio: "Leads data-driven SEO campaigns for ecommerce growth.",
    email: "bob@metrclab.com",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
  }, {
    name: "Bob Laiyl",
    role: "SEO Player",
    bio: "Leads data-driven SEO campaigns for ecommerce growth.",
    email: "bob@metriclab.com",
    image: "https://randomuser.me/api/portraits/men/98.jpg",
  },
    {
    name: "Carolina",
    role: "Marketing Strategist",
    bio: "Designs high-converting marketing funnels.",
    email: "caroolina@metriclab.com",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    name: "Carol Lee",
    role: "Marketing Strategist",
    bio: "Designs high-converting marketing funnels.",
    email: "carol@metriclab.com",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    name: "David King",
    role: "Full Stack Developer",
    bio: "Handles Shopify apps and integrations.",
    email: "david@metriclab.com",
    image: "https://randomuser.me/api/portraits/men/45.jpg",
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
