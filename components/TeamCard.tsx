// components/TeamCard.tsx
"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { EnvelopeIcon } from "@heroicons/react/24/solid";

type Props = {
  name?: string;
  role?: string;
  bio?: string;
  email?: string;
  image?: string;
  isViewAll?: boolean;
};

export default function TeamCard({
  name = "Team Member",
  role = "Team Role",
  bio,
  email,
  image,
  isViewAll = false,
}: Props) {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = isViewAll ? linkRef.current : divRef.current;
    if (!element) return;

    gsap.fromTo(
      element,
      { opacity: 0, y: 40, scale: 0.96 },
      { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "power3.out" }
    );
  }, [isViewAll]);

  /* ---------------------------------- */
  /* VIEW FULL TEAM CARD                */
  /* ---------------------------------- */
  if (isViewAll) {
    return (
      <Link
        href="/team-directory"
        ref={linkRef}
        className="group relative rounded-xl border border-gray-800 bg-[#0b0b0b] p-8 flex flex-col items-center justify-center text-center hover:border-[#95BF47] transition duration-300"
      >
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 blur-3xl bg-[#95BF47]/10"></div>

        <div className="relative z-10">
          <p className="text-lg font-semibold text-white mb-2">View Full Team</p>

          <div className="flex items-center justify-center gap-2 text-[#95BF47] group-hover:gap-3 transition-all duration-300">
            <span className="text-sm font-medium">Explore</span>
            <ArrowRight size={18} />
          </div>
        </div>
      </Link>
    );
  }

  /* ---------------------------------- */
  /* NORMAL TEAM CARD                   */
  /* ---------------------------------- */

  // Build mailto subject and body using the member's name and role.
  const toEmail = email && email.trim().length > 0 ? email.trim() : "hellometriclab@gmail.com";
  const subject = encodeURIComponent("Shopify Growth Inquiry");
  const bodyText = `Hello ${name},\n\nI need a ${role} for my Shopify store.\n\nThanks,\n`;
  const body = encodeURIComponent(bodyText);

  const mailto = `mailto:${toEmail}?subject=${subject}&body=${body}`;

  return (
    <div
      ref={divRef}
      className="group relative rounded-xl p-[1px] bg-gradient-to-br from-[#95BF47]/40 via-transparent to-[#95BF47]/40 hover:from-[#95BF47] hover:to-[#95BF47] transition duration-500"
    >
      <div className="flex flex-col justify-between bg-[#0b0b0b]/95 backdrop-blur-lg border border-gray-800 rounded-xl p-7 h-full relative overflow-hidden">
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 blur-3xl bg-[#95BF47]/10"></div>

        <div className="flex flex-col items-center text-center relative z-10">
          {image && (
            <div className="relative mb-5">
              <div className="absolute inset-0 rounded-full blur-xl bg-[#95BF47]/30 opacity-0 group-hover:opacity-100 transition"></div>
              <img
                src={image}
                alt={name}
                className="w-24 h-24 rounded-full object-cover border border-gray-700 group-hover:scale-110 transition duration-500"
              />
            </div>
          )}

          <h3 className="text-xl font-semibold text-white group-hover:text-[#95BF47] transition">{name}</h3>
          <p className="text-gray-400 text-sm mt-1">{role}</p>
          <p className="text-gray-400 text-sm mt-3 leading-relaxed max-w-xs">{bio}</p>
        </div>

        <a
          href={mailto}
          className="relative z-10 mt-6 inline-flex items-center justify-center gap-2 bg-[#95BF47] text-black px-5 py-2.5 rounded-lg text-sm font-semibold hover:scale-105 hover:shadow-[0_0_20px_rgba(149,191,71,0.6)] transition"
        >
          <EnvelopeIcon className="w-4 h-4" />
          Contact
        </a>
      </div>
    </div>
  );
}
