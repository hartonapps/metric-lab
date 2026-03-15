// app/layout.tsx
import "@fontsource/inter"; // Inter font
import type { Metadata } from "next";
import "./globals.css";
import Navbar from "../components/Navbar"; // Import the Navbar we made
import Footer from "@/components/Footer";

// Metadata for your website (title, description)
export const metadata = {
  title: "Metric Lab — Shopify Growth Engineers",
  description:
    "Metric Lab helps Shopify brands scale with development, SEO, and conversion optimization.",
  icons: {
    icon: "/favicon.ico"
  }
}
// Root layout function — wraps all pages
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="font-sans">
      <body className="antialiased bg-[#0A0A0A] text-white">
        {/* Navbar appears on every page */}
        <Navbar />
        {/* This renders the content of each page */}
        {children}
        <Footer />
      </body>
    </html>
  );
}

