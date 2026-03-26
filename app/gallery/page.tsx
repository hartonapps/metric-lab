"use client";

import { useEffect, useState } from "react";

type GalleryItem = {
  id: string;
  url: string;
  alt: string;
};

export default function Gallery() {
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGallery = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/public-gallery");
        if (!res.ok) throw new Error("Failed to load gallery");
        const { gallery } = await res.json();
        setGallery(gallery || []);
      } catch (err) {
        console.error("Gallery load error:", err);
        setError("Failed to load gallery.");
      } finally {
        setLoading(false);
      }
    };

    void fetchGallery();
  }, []);

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-4 text-center">
          <span className="text-[#95BF47]">Gallery</span>
        </h1>
        <p className="text-center text-gray-400 mb-10">
          A snapshot of Metric Lab’s engineering-driven work.
        </p>

        {loading && <p className="text-center text-gray-400">Loading gallery…</p>}
        {error && <p className="text-center text-red-400">{error}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {gallery.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedImage(item)}
              className="relative overflow-hidden rounded-lg group focus:outline-none"
            >
              <img
                src={item.url}
                alt={item.alt || "Gallery image"}
                className="w-full h-48 object-cover transition-transform group-hover:scale-105"
              />
            </button>
          ))}
        </div>
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage.url}
            alt={selectedImage.alt || "Full image"}
            className="max-w-[90%] max-h-[90%] rounded-lg"
          />
        </div>
      )}
    </main>
  );
}
