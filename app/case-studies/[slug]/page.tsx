"use client";

import { useParams } from "next/navigation";
import { motion } from "framer-motion";

type CaseStudyDetail = {
  slug: string;
  title: string;
  industry: string;
  overview: string;
  problem: string;
  strategy: string;
  results: string;
  keyMetrics: string;
  featuredImage: string;
  gallery: string[];
};

const CASE_DETAILS: CaseStudyDetail[] = [
{
  slug: "shopify-fashion-store-growth",
  title: "Scaling a Shopify Fashion Store with SEO & CRO",
  industry: "E-commerce",
  overview: "A mid-sized Shopify fashion brand partnered with us to improve search visibility and increase online sales through SEO optimization and conversion-focused store improvements.",

  problem: "The store had great products but struggled with low organic visibility, slow page speed, and poorly optimized product pages which limited traffic and conversions.",

  strategy: "We performed a full Shopify SEO audit, optimized product and collection pages, improved technical SEO, enhanced page speed, implemented structured data, and redesigned key landing pages for better conversion.",

  results: "Within 4 months, the store experienced significant growth in organic traffic, higher rankings for competitive keywords, and a noticeable increase in online sales.",

  keyMetrics: "Traffic +162%, Conversion Rate +41%, Revenue +58%, 12 Keywords Ranking Top 3",

  featuredImage: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?q=80&w=1200&auto=format&fit=crop",

  gallery: [
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1607082350899-7e105aa886ae?q=80&w=1200&auto=format&fit=crop",
  ],
},
];

export default function CaseStudyPage() {
  const params = useParams();
  const caseStudy = CASE_DETAILS.find((c) => c.slug === params.slug);

  if (!caseStudy)
    return <p className="text-white p-8">Case study not found</p>;

  return (
    <main className="bg-[#0A0A0A] text-white">

      {/* HERO */}
      <section className="relative h-[60vh] flex items-center justify-center text-center">

        <img
          src={caseStudy.featuredImage}
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />

        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black"></div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10"
        >
          <p className="text-purple-400 mb-3 uppercase tracking-widest">
            {caseStudy.industry}
          </p>

          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            {caseStudy.title}
          </h1>

          <div className="inline-block bg-white/10 backdrop-blur px-6 py-2 rounded-full text-sm">
            Case Study
          </div>
        </motion.div>
      </section>

      {/* CONTENT */}
      <section className="max-w-5xl mx-auto px-6 py-20 space-y-14">

        {/* OVERVIEW */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold mb-4">Overview</h2>
          <p className="text-gray-400 leading-relaxed text-lg">
            {caseStudy.overview}
          </p>
        </motion.div>

        {/* PROBLEM + STRATEGY GRID */}
        <div className="grid md:grid-cols-2 gap-10">

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur"
          >
            <h3 className="text-2xl font-semibold mb-4 text-red-400">
              Problem
            </h3>
            <p className="text-gray-400">{caseStudy.problem}</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur"
          >
            <h3 className="text-2xl font-semibold mb-4 text-blue-400">
              Strategy
            </h3>
            <p className="text-gray-400">{caseStudy.strategy}</p>
          </motion.div>

        </div>

        {/* RESULTS */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-white/10 p-10 rounded-3xl"
        >
          <h2 className="text-3xl font-bold mb-4">Results</h2>
          <p className="text-gray-300 text-lg">{caseStudy.results}</p>
        </motion.div>

        {/* METRICS */}
        <div className="grid md:grid-cols-3 gap-6">

          <div className="bg-white/5 border border-white/10 p-6 rounded-xl text-center">
            <h3 className="text-4xl font-bold text-green-400 mb-2">150%</h3>
            <p className="text-gray-400">Traffic Growth</p>
          </div>

          <div className="bg-white/5 border border-white/10 p-6 rounded-xl text-center">
            <h3 className="text-4xl font-bold text-purple-400 mb-2">38%</h3>
            <p className="text-gray-400">Conversion Increase</p>
          </div>

          <div className="bg-white/5 border border-white/10 p-6 rounded-xl text-center">
            <h3 className="text-4xl font-bold text-blue-400 mb-2">Top 3</h3>
            <p className="text-gray-400">Search Rankings</p>
          </div>

        </div>

        {/* GALLERY */}
        <div>
          <h2 className="text-3xl font-bold mb-6">Gallery</h2>

          <div className="grid md:grid-cols-3 gap-6">
            {caseStudy.gallery.map((img, i) => (
              <motion.img
                key={i}
                src={img}
                whileHover={{ scale: 1.05 }}
                className="rounded-xl object-cover h-56 w-full cursor-pointer"
              />
            ))}
          </div>
        </div>

      </section>
    </main>
  );
}
