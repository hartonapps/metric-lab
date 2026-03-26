"use client";

import React, { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

type GuideModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type Slide = {
  title: string;
  content: React.ReactNode;
};

export default function GuideModal({ isOpen, onClose }: GuideModalProps) {
  const slides = useMemo<Slide[]>(
    () => [
      {
        title: "1. Fund Wallet",
        content: (
          <p className="text-sm text-gray-700">
            Add money with Paystack in the wallet card. Your balance updates once payment is verified.
          </p>
        ),
      },
      {
        title: "2. Buy Slots",
        content: (
          <p className="text-sm text-gray-700">
            Slots are what you spend to submit team entries. Choose quantity and buy with wallet balance.
          </p>
        ),
      },
      {
        title: "3. Redeem Coupon",
        content: (
          <p className="text-sm text-gray-700">
            If you have a coupon code, redeem it to get slot credit, balance credit, or both.
          </p>
        ),
      },
      {
        title: "4. Submit Team",
        content: (
          <p className="text-sm text-gray-700">
            Fill the team form, upload image to ImgBB, then submit. One slot is deducted per successful submission.
          </p>
        ),
      },
      {
        title: "5. Transactions",
        content: (
          <p className="text-sm text-gray-700">
            Use the transaction section to track deposits, slot purchases, coupon redemptions, and slot usage.
          </p>
        ),
      },
    ],
    []
  );

  const [currentSlide, setCurrentSlide] = useState(0);

  if (!isOpen) return null;

  const nextSlide = () => setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1));
  const prevSlide = () => setCurrentSlide((prev) => Math.max(prev - 1, 0));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-white p-6 shadow-xl">
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-500 hover:text-gray-700">
          <X size={24} />
        </button>

        <h2 className="mb-4 text-2xl font-bold text-gray-900">{slides[currentSlide].title}</h2>
        <div>{slides[currentSlide].content}</div>

        <div className="mt-6 flex justify-center space-x-2">
          {slides.map((_, idx) => (
            <span
              key={idx}
              className={`h-2.5 w-2.5 rounded-full ${idx === currentSlide ? "bg-blue-600" : "bg-gray-300"}`}
            />
          ))}
        </div>

        <div className="mt-6 flex justify-between">
          <button
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 disabled:opacity-40"
          >
            <ChevronLeft className="mr-1" /> Prev
          </button>
          <button
            onClick={nextSlide}
            disabled={currentSlide === slides.length - 1}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 disabled:opacity-40"
          >
            Next <ChevronRight className="ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
}