"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Team", href: "/team-directory" },
    { name: "Case Studies", href: "/case-studies" },
    { name: "Gallery", href: "/gallery" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-white hover:text-[#95BF47] transition-colors"
        >
          Metric Lab
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8 text-sm text-gray-300">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="relative group hover:text-[#95BF47] transition"
            >
              {link.name}

              {/* underline animation */}
              <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-[#95BF47] transition-all group-hover:w-full"></span>
            </Link>
          ))}
        </div>

        {/* Mobile Button */}
        <button
          className="md:hidden text-gray-300"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden border-t border-gray-800 bg-black/90 backdrop-blur-lg">
          <div className="flex flex-col px-6 py-4 space-y-4 text-gray-300">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="hover:text-[#95BF47] transition"
                onClick={() => setOpen(false)}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}