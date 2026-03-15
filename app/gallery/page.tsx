"use client";

import { useState } from "react";
import GALLERY from "../../data/gallery";

export default function Gallery() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-12 text-center">
          <span className="text-[#95BF47]">Gallery</span>
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {GALLERY.map((img, idx) => (
            <div
              key={idx}
              className="relative cursor-pointer overflow-hidden rounded-lg group"
              onClick={() => setSelectedImage(img)}
            >
              <img
                src={img}
                alt={`Gallery ${idx + 1}`}
                className="w-full h-48 object-cover transition-transform group-hover:scale-105"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Fullscreen Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt="Full Image"
            className="max-w-[90%] max-h-[90%] rounded-lg"
          />
        </div>
      )}
    </main>
  );
}
