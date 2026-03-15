"use client";

import { useRef, useState, useEffect } from "react";
import { gsap } from "gsap";
import { ChevronDownIcon } from "@heroicons/react/24/solid";

type Props = {
  question: string;
  answer: string;
};

export default function FAQItem({ question, answer }: Props) {
  const [open, setOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contentRef.current) return;

    if (open) {
      gsap.to(contentRef.current, {
        height: "auto",
        duration: 0.4,
        ease: "power3.out",
        opacity: 1,
        paddingTop: 10,
        paddingBottom: 10,
      });
    } else {
      gsap.to(contentRef.current, {
        height: 0,
        duration: 0.4,
        ease: "power3.in",
        opacity: 0,
        paddingTop: 0,
        paddingBottom: 0,
      });
    }
  }, [open]);

  return (
    <div className="bg-[#111] border border-gray-800 rounded-xl mb-4 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center px-6 py-4 text-left hover:bg-[#222] transition"
      >
        <span className="text-gray-300 font-medium">{question}</span>
        <ChevronDownIcon
          className={`w-5 h-5 text-[#95BF47] transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        ref={contentRef}
        className="px-6 overflow-hidden text-gray-400 text-sm"
        style={{ height: 0, opacity: 0 }}
      >
        <p>{answer}</p>
      </div>
    </div>
  );
}
