"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { BeerArt } from "./beer-art-card";

interface BeerArtLightboxProps {
  item: BeerArt | null;
  onClose: () => void;
}

export function BeerArtLightbox({ item, onClose }: BeerArtLightboxProps) {
  const t = useTranslations("beerArt");

  useEffect(() => {
    if (!item) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [item, onClose]);

  if (!item) return null;

  return (
    <div
      className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div className="max-w-4xl max-h-[90vh] relative" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white hover:text-gold-400 text-3xl font-bold leading-none p-2"
          aria-label="Close lightbox"
        >
          &times;
        </button>
        <img
          src={item.imageUrl}
          alt={item.title}
          className="max-w-full max-h-[80vh] object-contain rounded-lg"
        />
        <div className="mt-4 text-center text-white">
          <h3 className="text-xl font-semibold">{item.title}</h3>
          {item.description && <p className="text-foreground-secondary mt-2">{item.description}</p>}
          {item.customerName && (
            <p className="text-sm text-foreground-tertiary mt-2">
              {t("customer")}: {item.customerName}
            </p>
          )}
          {item.artistName && (
            <p className="text-sm text-foreground-tertiary">
              {t("artist")}: {item.artistName}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
