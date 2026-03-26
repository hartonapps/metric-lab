import "@fontsource/inter";
import "./globals.css";
import Navbar from "../components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Metric Lab - Shopify Growth Engineers",
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
    <html lang="en" className="font-sans" data-scroll-behavior="smooth">
      <body className="antialiased bg-[#0A0A0A] text-white">
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}