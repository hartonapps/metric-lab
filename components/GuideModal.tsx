"use client";

import React, { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

type GuideModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type Slide = {
  title: string;
  content: React.ReactNode;
};

export default function GuideModal({ isOpen, onClose }: GuideModalProps) {
  const slides: Slide[] = [
    {
      title: "Your Balance",
      content: (
        <p className="text-gray-700 dark:text-gray-300 text-sm">
          This section shows your current wallet balance. You can fund your wallet
          by entering an amount and clicking <strong>"Fund Wallet"</strong>.
          Successful payments will update your balance in real-time.
        </p>
      ),
    },
    {
      title: "Add Team Member",
      content: (
        <p className="text-gray-700 dark:text-gray-300 text-sm">
          Use the form to submit a new team member. Fill in all fields including
          name, role, bio, email, and upload a profile image. Each submission
          costs ₦100, which will be deducted from your balance automatically.
        </p>
      ),
    },
    {
      title: "Transaction History",
      content: (
        <p className="text-gray-700 dark:text-gray-300 text-sm">
          All your deposits and team submissions appear here in real-time. You
          can see the amount, type, status, and date of each transaction.
        </p>
      ),
    },
    {
      title: "Help & Support",
      content: (
        <p className="text-gray-700 dark:text-gray-300 text-sm">
          If you encounter any issues, contact us via the link below the form or
          reach out to our support channel.
        </p>
      ),
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  if (!isOpen) return null;

  const nextSlide = () => setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1));
  const prevSlide = () => setCurrentSlide((prev) => Math.max(prev - 1, 0));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-2xl w-full p-6 relative overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          <X size={24} />
        </button>

        {/* Slide content */}
        <div className="transition-all duration-300">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            {slides[currentSlide].title}
          </h2>
          <div>{slides[currentSlide].content}</div>
        </div>

        {/* Slide indicators */}
        <div className="flex justify-center space-x-2 mt-6">
          {slides.map((_, idx) => (
            <span
              key={idx}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                idx === currentSlide ? "bg-blue-500 dark:bg-blue-400" : "bg-gray-300 dark:bg-gray-700"
              }`}
            />
          ))}
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between mt-6">
          <button
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white disabled:opacity-40"
          >
            <ChevronLeft className="mr-1" /> Prev
          </button>
          <button
            onClick={nextSlide}
            disabled={currentSlide === slides.length - 1}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white disabled:opacity-40"
          >
            Next <ChevronRight className="ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
}