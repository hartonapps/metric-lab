"use client";

import Link from "next/link";
import { EnvelopeIcon} from "@heroicons/react/24/solid"; // We'll swap in correct socials

export default function Footer() {
  return (
    <footer className="bg-[#0A0A0A] text-gray-400 border-t border-gray-800 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-8">

        {/* About */}
        <div>
          <h3 className="text-white text-xl font-bold mb-2">Metric Lab</h3>
          <p className="text-gray-400 text-sm">
            Engineering Scalable Shopify Growth
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-white font-semibold mb-2">Quick Links</h4>
          <ul className="space-y-1 text-sm">
            <li>
              <Link href="/" className="hover:text-[#95BF47] transition">Home</Link>
            </li>
            <li>
              <Link href="#team" className="hover:text-[#95BF47] transition">Team</Link>
            </li>
            <li>
              <Link href="/case-studies" className="hover:text-[#95BF47] transition">Case Studies</Link>
            </li>
            <li>
              <Link href="/gallery" className="hover:text-[#95BF47] transition">Gallery</Link>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-white font-semibold mb-2">Contact</h4>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <EnvelopeIcon className="w-4 h-4 text-[#95BF47]" />
              <a href="mailto:hellometriclab@gmail.com" className="hover:text-[#95BF47] transition">
                hellometriclab@gmail.com
              </a>
            </li>
            {/* Add socials later */}
          </ul>
        </div>

      </div>

      <div className="text-center text-gray-600 text-sm py-4 border-t border-gray-800">
        © {new Date().getFullYear()} Metric Lab. All rights reserved.
      </div>
    </footer>
  );
}
