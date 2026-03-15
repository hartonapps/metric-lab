"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { gsap } from "gsap";
import { useEffect, useRef } from "react";

type CaseStudy = {
  slug: string;
  title: string;
  industry: string;
  overview: string;
  featuredImage: string;
};

const CASES: CaseStudy[] = [
  {
  slug: "shopify-fashion-store-growth",
  title: "Scaling a Shopify Fashion Store with SEO & CRO",
  industry: "E-commerce",
  overview:
    "Helped a growing Shopify fashion brand increase organic traffic and sales through technical SEO improvements, optimized product pages, and conversion-focused design updates.",
  featuredImage:
    "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?q=80&w=1200&auto=format&fit=crop",
},
];

export default function CaseStudies() {
  const containerRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  const ctx = gsap.context(() => {
    gsap.from(".case-card", {
      opacity: 0,
      y: 60,
      scale: 0.95,
      duration: 0.9,
      ease: "power3.out",
      stagger: 0.12,
    });
  }, containerRef);

  return () => ctx.revert(); // cleans animations on route change
}, []);

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white py-24 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-20">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            Case <span className="text-[#95BF47]">Studies</span>
          </h1>

          <p className="text-gray-400 mt-4 max-w-xl mx-auto">
            Real growth stories from brands we've scaled with SEO, CRO, and
            performance marketing.
          </p>
        </div>

        {/* Grid */}
        <div
          ref={containerRef}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-10"
        >
          {CASES.map((c, i) => (
            <motion.div
              key={c.slug}
              whileHover={{ y: -8 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="case-card group relative"
            >
              <Link
                href={`/case-studies/${c.slug}`}
                className="block rounded-2xl overflow-hidden border border-white/10 bg-[#111] backdrop-blur-xl"
              >
                {/* Glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 pointer-events-none bg-[radial-gradient(circle_at_top,rgba(149,191,71,0.25),transparent_70%)]" />

                {/* Image */}
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src={c.featuredImage}
                    alt={c.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col gap-4">
                  <div>
                    <h3 className="text-xl font-semibold group-hover:text-[#95BF47] transition">
                      {c.title}
                    </h3>

                    <p className="text-sm text-gray-500 mt-1">{c.industry}</p>

                    <p className="text-gray-400 text-sm mt-3 leading-relaxed">
                      {c.overview}
                    </p>
                  </div>

                  {/* Button */}
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-sm font-medium text-[#95BF47]">
                      View Case Study
                    </span>

                    <motion.div
                      whileHover={{ x: 4, y: -4 }}
                      className="text-[#95BF47]"
                    >
                      <ArrowUpRight size={18} />
                    </motion.div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}
