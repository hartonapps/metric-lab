"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";

import Container from "./container";

export default function Section({
  children,
  id,
  dark = false,
}: {
  children: React.ReactNode;
  id?: string;
  dark?: boolean;
}) {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    gsap.fromTo(
      sectionRef.current,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power3.out",
      }
    );
  }, []);

  return (
    <section
      id={id}
      className={`py-28 ${dark ? "bg-[#050505]" : "bg-[#0A0A0A]"}`}
    >
      <Container>
        <div ref={sectionRef}>{children}</div>
      </Container>
    </section>
  );
}
