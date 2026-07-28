"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import dynamic from "next/dynamic";
import { TourPlace } from "./types";
import { TourPlaceImages } from "./TourPlaceImages";
import { TourPlaceInfo } from "./TourPlaceInfo";

// Lightbox only loads when an image is clicked on the client
const TourPlaceLightbox = dynamic(
  () => import("./TourPlaceLightbox").then((m) => m.TourPlaceLightbox),
  { ssr: false }
);

interface TourPlaceDetailProps {
  place: TourPlace;
}

export function TourPlaceDetail({ place }: TourPlaceDetailProps) {
  const t = useTranslations("tourist");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-foreground-secondary mb-6">
        <Link href="/tourist" className="hover:text-gold-400 transition-colors">
          {t("title")}
        </Link>
        <span>/</span>
        <span className="text-foreground">{place.name}</span>
      </nav>

      {/* Header */}
      <div className="mb-6">
        <span className="inline-block px-3 py-1 bg-gold-500/10 text-gold-400 rounded-full text-sm mb-3">
          {place.category.name}
        </span>
        <h1 className="text-4xl font-jp font-bold text-gold-400 mb-2">{place.name}</h1>
      </div>

      {/* Images section */}
      <TourPlaceImages
        name={place.name}
        imageUrl={place.imageUrl}
        images={place.images}
        onSelectImage={setSelectedImage}
      />

      {/* Description & Info section */}
      <TourPlaceInfo place={place} />

      {/* Back Link */}
      <div className="text-center">
        <Link
          href="/tourist"
          className="inline-block text-gold-400 hover:text-gold-300 font-medium"
        >
          &larr; {t("backToList")}
        </Link>
      </div>

      {/* Lightbox Modal */}
      <TourPlaceLightbox
        selectedImage={selectedImage}
        name={place.name}
        onClose={() => setSelectedImage(null)}
      />
    </main>
  );
}
