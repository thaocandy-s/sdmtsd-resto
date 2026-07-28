"use client";

import { useEffect } from "react";
import Image from "next/image";

interface TourPlaceLightboxProps {
  selectedImage: string | null;
  name: string;
  onClose: () => void;
}

export function TourPlaceLightbox({ selectedImage, name, onClose }: TourPlaceLightboxProps) {
  useEffect(() => {
    if (!selectedImage) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedImage, onClose]);

  if (!selectedImage) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={name}
    >
      <div className="max-w-4xl max-h-[90vh] relative" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white hover:text-gold-400 text-2xl"
          aria-label="Close lightbox"
        >
          &times;
        </button>
        <Image
          src={selectedImage}
          alt={name}
          width={1200}
          height={1200}
          sizes="90vw"
          className="max-w-full max-h-[80vh] w-auto h-auto object-contain rounded-lg"
        />
      </div>
    </div>
  );
}
