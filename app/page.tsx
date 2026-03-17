import Section from "../components/Section";
import ServiceCard from "../components/ServiceCard";
import TeamCard from "../components/TeamCard";
import FAQItem from "../components/FaqItem";
import Link from "next/link";

export default function Home() {
  return (
    <main>

      {/* HERO */}
      <Section dark>
        <div className="max-w-3xl">
          <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
            Engineering{" "}
            <span className="text-[#95BF47]">Scalable Shopify Growth</span>
          </h1>

          <p className="text-lg text-gray-400 mb-8">
            Metric Lab helps Shopify brands scale through data-driven SEO,
            high-converting storefronts, and performance marketing systems.
          </p>

          <div className="flex flex-wrap gap-4">

            <Link
              href="#team"
              className="bg-[#95BF47] text-black px-6 py-3 rounded-lg font-medium hover:opacity-90 transition"
            >
              Work With Us
            </Link>

            <Link
              href="/team-directory"
              className="border border-gray-700 px-6 py-3 rounded-lg hover:border-[#95BF47] hover:text-[#95BF47] transition"
            >
              Verify Team Member
            </Link>

          </div>
        </div>
      </Section>
{/* ABOUT */}
<Section>
  <div className="max-w-6xl">

    {/* Title */}
    <h2 className="text-3xl md:text-4xl font-bold mb-10">
      About <span className="text-[#95BF47]">Metric Lab</span>
    </h2>

    {/* Grid */}
    <div className="grid md:grid-cols-2 gap-12 items-start">

      {/* Left text */}
      <div>
        <p className="text-gray-400 leading-relaxed mb-6">
          Metric Lab is a collective of Shopify engineers, SEO specialists,
          and growth marketers focused on helping ecommerce brands scale
          sustainably.
        </p>

        <p className="text-gray-400 leading-relaxed">
          We combine technical storefront optimization with data-driven
          marketing strategies to build high-performing Shopify stores
          that grow consistently.
        </p>
      </div>

      {/* Right stats */}
      <div className="grid grid-cols-2 gap-6">

        <div className="bg-[#111] border border-gray-800 rounded-xl p-6 hover:border-[#95BF47] transition">
          <h3 className="text-3xl font-bold text-[#95BF47]">100+</h3>
          <p className="text-gray-400 mt-2 text-sm">Stores Optimized</p>
        </div>

        <div className="bg-[#111] border border-gray-800 rounded-xl p-6 hover:border-[#95BF47] transition">
          <h3 className="text-3xl font-bold text-[#95BF47]">$100k+</h3>
          <p className="text-gray-400 mt-2 text-sm">Revenue Generated</p>
        </div>

        <div className="bg-[#111] border border-gray-800 rounded-xl p-6 hover:border-[#95BF47] transition">
          <h3 className="text-3xl font-bold text-[#95BF47]">150+</h3>
          <p className="text-gray-400 mt-2 text-sm">SEO Campaigns</p>
        </div>

        <div className="bg-[#111] border border-gray-800 rounded-xl p-6 hover:border-[#95BF47] transition">
          <h3 className="text-3xl font-bold text-[#95BF47]">24/7</h3>
          <p className="text-gray-400 mt-2 text-sm">Support</p>
        </div>

        <div className="bg-[#111] border border-gray-800 rounded-xl p-6 hover:border-[#95BF47] transition">
          <h3 className="text-3xl font-bold text-[#95BF47]">100+</h3>
          <p className="text-gray-400 mt-2 text-sm">teams to choose from</p>
        </div>
        
      </div>
    </div>
  </div>
</Section>

{/* SERVICES */}
<Section dark>
  <div className="max-w-6xl">

    <h2 className="text-3xl md:text-4xl font-bold mb-12">
      Our <span className="text-[#95BF47]">Services</span>
    </h2>

    <div className="grid md:grid-cols-3 gap-8">

<ServiceCard
  title="Store Audit & Growth Strategy"
  description="Comprehensive store audits with actionable insights and data-driven strategies to identify gaps, improve performance, and unlock scalable growth."
/>

<ServiceCard
  title="Shopify Store Design & Development"
  description="High-converting Shopify store design and development focused on seamless user experience, modern UI, and revenue-driven structure."
/>

<ServiceCard
  title="Paid Advertising & Traffic Acquisition"
  description="Strategic ad campaigns across platforms like Meta and Google to drive targeted traffic, increase visibility, and generate consistent sales."
/>

<ServiceCard
  title="Conversion Rate Optimization"
  description="Continuous testing and optimization of product pages, funnels, and checkout to maximize conversions and boost revenue."
/>

<ServiceCard
  title="Performance & Speed Optimization"
  description="Advanced speed and performance optimization to ensure fast load times, better user experience, and improved search rankings."
/>
  </div>
</Section>

{/* TEAM PREVIEW */}
<Section id="team">
  <div className="max-w-6xl">

    <h2 className="text-3xl md:text-4xl font-bold mb-12">
      Meet Our <span className="text-[#95BF47]">Team</span>
    </h2>

    <div className="grid md:grid-cols-4 gap-8">

      <TeamCard
        name="Alice Johnson"
        role="Shopify Engineer"
        bio="Builds scalable and optimized Shopify stores."
        email="alice@metriclab.com"
        image="https://randomuser.me/api/portraits/women/68.jpg"
      />

      <TeamCard
        name="Bob Smith"
        role="SEO Specialist"
        bio="Leads data-driven SEO campaigns for ecommerce growth."
        email="bob@metriclab.com"
        image="https://randomuser.me/api/portraits/men/32.jpg"
      />

      <TeamCard
        name="Carol Lee"
        role="Marketing Strategist"
        bio="Designs high-converting marketing funnels."
        email="carol@metriclab.com"
        image="https://randomuser.me/api/portraits/women/44.jpg"
      />

      {/* View All Card */}
      <TeamCard isViewAll />
    </div>
  </div>
</Section>

{/* FAQ */}
<Section dark>
  <div className="max-w-4xl mx-auto">

    <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
      Frequently Asked <span className="text-[#95BF47]">Questions</span>
    </h2>

    <FAQItem
      question="How do you verify your team members?"
      answer="All consultants go through our internal verification process before being listed. You can contact them directly via email."
    />
    <FAQItem
      question="Do you provide custom Shopify development?"
      answer="Yes! We provide full storefront customization, theme optimization, and app integrations tailored to your business."
    />
    <FAQItem
      question="Can I work with multiple consultants?"
      answer="Absolutely. You can reach out to any consultant, or we can match you with the right team for your project."
    />
    <FAQItem
      question="How do I get started with Metric Lab?"
      answer="Click 'Work With Us' in the hero section to scroll to our team or contact a consultant directly via email."
    />

  </div>
</Section>



    </main>
  );
}
