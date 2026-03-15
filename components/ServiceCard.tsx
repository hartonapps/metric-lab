"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";

type Props = {
  title: string;
  description: string;
};

export default function ServiceCard({ title, description }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cardRef.current) return;

    gsap.fromTo(
      cardRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
    );
  }, []);

  return (
    <div
      ref={cardRef}
      className="bg-[#111] border border-gray-800 rounded-xl p-8 hover:border-[#95BF47] hover:shadow-[0_0_30px_rgba(149,191,71,0.2)] transition"
    >
      <h3 className="text-xl font-semibold mb-4">{title}</h3>

      <p className="text-gray-400 text-sm leading-relaxed">
        {description}
      </p>
    </div>
  );
}
