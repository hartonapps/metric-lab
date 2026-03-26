"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import TrackPage from "@/components/analytics/TrackPage";
import { motion } from "framer-motion";

type CaseStudy = {
  slug: string;
  title: string;
  industry: string;
  overview: string;
  problem: string;
  strategy: string;
  results: string;
  featuredImage: string;
  gallery: string[];
  metrics: { value: string; label: string; color?: string }[];
};

export default function CaseStudyPage() {
  const params = useParams<{ slug?: string }>();
  const slug = params?.slug;
  const [study, setStudy] = useState<CaseStudy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    const fetchStudy = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/public-case-studies/${slug}`);
        if (!res.ok) throw new Error("Not found");
        const data = await res.json();
        setStudy(data.study || null);
      } catch (err) {
        console.error("Case study load error:", err);
        setError("Case study not found.");
      } finally {
        setLoading(false);
      }
    };

    void fetchStudy();
  }, [slug]);

  if (loading) {
    return <main className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center">Loading case study…</main>;
  }

  if (error || !study) {
    return <main className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center">{error || "Case study unavailable"}</main>;
  }

  return (
    <main className="bg-[#0A0A0A] text-white">
      <TrackPage pageName={`Case Study ${study.slug}`} />
      <section className="relative h-[60vh] flex items-center justify-center text-center">
        <img src={study.featuredImage} alt={study.title} className="absolute inset-0 w-full h-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black" />
        <div className="relative z-10 px-6">
          <p className="text-purple-400 mb-3 uppercase tracking-widest text-sm">{study.industry}</p>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">{study.title}</h1>
          <div className="inline-block bg-white/10 backdrop-blur px-6 py-2 rounded-full text-sm">Case Study</div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-20 space-y-16">
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-3xl font-bold mb-4">Overview</h2>
          <p className="text-gray-400 leading-relaxed text-lg">{study.overview}</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-10">
          <motion.div whileHover={{ scale: 1.02 }} className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur">
            <h3 className="text-2xl font-semibold mb-4 text-red-400">Problem</h3>
            <p className="text-gray-400">{study.problem}</p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur">
            <h3 className="text-2xl font-semibold mb-4 text-blue-400">Strategy</h3>
            <p className="text-gray-400">{study.strategy}</p>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-white/10 p-10 rounded-3xl">
          <h2 className="text-3xl font-bold mb-4">Results</h2>
          <p className="text-gray-300 text-lg">{study.results}</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {study.metrics.map((metric, i) => (
            <motion.div key={i} whileHover={{ scale: 1.05 }} className="bg-white/5 border border-white/10 p-8 rounded-2xl text-center backdrop-blur hover:border-purple-500/40 transition">
              <h3 className={`text-4xl md:text-5xl font-bold mb-3 ${metric.color || "text-green-400"}`}>{metric.value}</h3>
              <p className="text-gray-400">{metric.label}</p>
            </motion.div>
          ))}
        </div>

        <div>
          <h2 className="text-3xl font-bold mb-6">Gallery</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {study.gallery.map((img, i) => (
              <motion.img key={i} src={img} alt={`${study.title} ${i + 1}`} whileHover={{ scale: 1.05 }} className="rounded-xl object-cover h-56 w-full cursor-pointer" />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
