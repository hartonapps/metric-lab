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
  {
  slug: "shopify-conversion-redesign",
  title: "Shopify Conversion Rate Redesign",
  industry: "E-commerce",
  overview: "An electronics retailer partnered with us to improve their Shopify store's user experience and increase conversion rates.",
  problem: "The store had strong traffic but low conversions due to cluttered product pages and a complicated checkout process.",
  strategy: "We redesigned product layouts, improved product descriptions, added trust signals, and simplified the checkout experience.",
  results: "The store saw a strong increase in completed purchases and improved customer engagement.",
  keyMetrics: "Conversion +36%, Cart Abandonment -22%, Revenue +40%",
  featuredImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop",
  gallery: [
    "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?q=80&w=1200&auto=format&fit=crop",
  ],
},

{
  slug: "shopify-speed-optimization",
  title: "Shopify Store Speed Optimization",
  industry: "E-commerce",
  overview: "A growing Shopify store struggled with slow load times that negatively impacted SEO rankings and customer experience.",
  problem: "Heavy themes, large images, and unused scripts caused slow performance across mobile and desktop.",
  strategy: "We optimized code, compressed media files, removed unnecessary apps, and implemented lazy loading.",
  results: "The site became significantly faster which improved SEO rankings and reduced bounce rate.",
  keyMetrics: "Page Speed +72%, Bounce Rate -31%, Traffic +24%",
  featuredImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop",
  gallery: [
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1559028012-481c04fa702d?q=80&w=1200&auto=format&fit=crop",
  ],
},

{
  slug: "shopify-product-launch-campaign",
  title: "Shopify Product Launch Campaign",
  industry: "E-commerce",
  overview: "Supported a skincare brand launching a new product line on Shopify with a targeted marketing and landing page strategy.",
  problem: "The brand needed to generate awareness and sales quickly after launching a new product.",
  strategy: "We created optimized landing pages, email campaigns, and targeted ads to drive qualified traffic.",
  results: "The launch campaign generated strong engagement and exceeded the brand's first-month sales goals.",
  keyMetrics: "Revenue +65%, Traffic +120%, Email Subscribers +2,400",
  featuredImage: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1200&auto=format&fit=crop",
  gallery: [
    "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1596464716127-f2a82984de30?q=80&w=1200&auto=format&fit=crop",
  ],
},

{
  slug: "shopify-email-marketing-growth",
  title: "Shopify Email Marketing Growth",
  industry: "E-commerce",
  overview: "Implemented a full email marketing automation system for a Shopify lifestyle brand.",
  problem: "The store relied heavily on paid ads and had no structured email marketing strategy.",
  strategy: "We built automated flows including welcome emails, abandoned cart recovery, and post-purchase follow-ups.",
  results: "Email quickly became one of the brand's highest-performing revenue channels.",
  keyMetrics: "Email Revenue +48%, Repeat Customers +33%, Cart Recovery +21%",
  featuredImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop",
  gallery: [
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1556742031-c6961e8560b0?q=80&w=1200&auto=format&fit=crop",
  ],
},

{
  slug: "shopify-store-migration",
  title: "E-commerce Platform Migration to Shopify",
  industry: "E-commerce",
  overview: "Migrated a furniture retailer from WooCommerce to Shopify to improve scalability and ease of management.",
  problem: "The previous platform caused frequent downtime and made inventory management difficult.",
  strategy: "We handled full product migration, redesigned the store, and optimized the new Shopify setup.",
  results: "The brand experienced smoother operations and better customer experience after the migration.",
  keyMetrics: "Page Speed +60%, Sales +34%, Bounce Rate -28%",
  featuredImage: "https://images.unsplash.com/photo-1503602642458-232111445657?q=80&w=1200&auto=format&fit=crop",
  gallery: [
    "https://images.unsplash.com/photo-1503602642458-232111445657?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1560185008-b033106af5c3?q=80&w=1200&auto=format&fit=crop",
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
