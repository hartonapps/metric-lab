import "@fontsource/inter";
import "./globals.css";
import Navbar from "../components/Navbar";
import Footer from "@/components/Footer";
import Script from "next/script";

export const metadata = {
  title: "Metric Lab — Shopify Growth Engineers",
  description:
    "Metric Lab helps Shopify brands scale with development, SEO, and conversion optimization.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="font-sans">
      <body className="antialiased bg-[#0A0A0A] text-white">
        <Navbar />

        {children}

        <Footer />

        {/* ✅ MOVE SCRIPT HERE (INSIDE BODY) */}
        <Script
          src="https://js.paystack.co/v1/inline.js"
          type="text/javascript"
        />
      </body>
    </html>
  );
}