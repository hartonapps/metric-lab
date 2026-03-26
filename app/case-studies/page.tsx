"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import TrackPage from "@/components/analytics/TrackPage";

type CaseStudyPreview = {
  slug: string;
  title: string;
  industry: string;
  overview: string;
  featuredImage: string;
};

export default function CaseStudiesPage() {
  const [studies, setStudies] = useState<CaseStudyPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudies = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/public-case-studies");
        if (!res.ok) throw new Error("Failed to load case studies");
        const data = await res.json();
        setStudies(data.studies || []);
      } catch (err) {
        console.error("Case studies load error:", err);
        setError("Unable to load case studies.");
      } finally {
        setLoading(false);
      }
    };

    void fetchStudies();
  }, []);

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white py-16 px-6">
      <TrackPage pageName="Case Studies" />
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="text-center space-y-4">
          <h1 className="text-4xl font-bold">
            Case Studies <span className="text-[#95BF47]">Showcasing</span> Impact
          </h1>
          <p className="text-gray-400">
            Everything we ship is backed by measurable business outcomes. Browse the work below.
          </p>
        </header>

        {loading && <p className="text-center text-gray-400">Loading case studies…</p>}
        {error && <p className="text-center text-red-400">{error}</p>}

        <div className="grid md:grid-cols-2 gap-6">
          {studies.map((study) => (
            <Link key={study.slug} href={`/case-studies/${study.slug}`} className="group block rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-[#95BF47]">
              <div className="aspect-[16/9] overflow-hidden rounded-xl bg-gray-900">
                <img src={study.featuredImage} alt={study.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
              </div>
              <div className="mt-4 space-y-2">
                <p className="text-xs uppercase tracking-widest text-[#95BF47]">{study.industry}</p>
                <h2 className="text-2xl font-semibold">{study.title}</h2>
                <p className="text-sm text-gray-300 line-clamp-3">{study.overview}</p>
                <span className="text-sm text-[#95BF47]">View case study →</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
