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
    "https://randomuser.me/api/portraits/women/1.jpg",
},
  {
  slug: "shopify-conversion-redesign",
  title: "Shopify Conversion Rate Redesign",
  industry: "E-commerce",
  overview:
    "Improved conversion rate for a Shopify electronics store by redesigning product pages and simplifying checkout flow.",
  featuredImage:
    "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop",
},

{
  slug: "shopify-speed-optimization",
  title: "Shopify Store Speed Optimization",
  industry: "E-commerce",
  overview:
    "Boosted site performance and user experience by optimizing scripts, compressing assets, and improving Shopify page load times.",
  featuredImage:
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop",
},

{
  slug: "shopify-product-launch-campaign",
  title: "Shopify Product Launch Campaign",
  industry: "E-commerce",
  overview:
    "Executed a successful launch strategy for a Shopify skincare brand, generating strong traffic and first-month sales.",
  featuredImage:
    "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1200&auto=format&fit=crop",
},
{
  slug: "shopify-email-marketing-growth",
  title: "Shopify Email Marketing Growth",
  industry: "E-commerce",
  overview:
    "Implemented automated email flows that significantly increased repeat purchases and customer retention.",
  featuredImage:
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop",
},

{
  slug: "shopify-store-migration",
  title: "E-commerce Platform Migration to Shopify",
  industry: "E-commerce",
  overview:
    "Successfully migrated an online furniture brand from WooCommerce to Shopify with improved performance and usability.",
  featuredImage:
    "https://images.unsplash.com/photo-1503602642458-232111445657?q=80&w=1200&auto=format&fit=crop",
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
