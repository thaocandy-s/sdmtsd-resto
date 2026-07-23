"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { TourPlace } from "./_components/types";
import { TourPlaceImages } from "./_components/TourPlaceImages";
import { TourPlaceInfo } from "./_components/TourPlaceInfo";
import { TourPlaceLightbox } from "./_components/TourPlaceLightbox";

export default function TouristDetailPage() {
  const t = useTranslations("tourist");
  const params = useParams();
  const slug = params.slug as string;
  const [place, setPlace] = useState<TourPlace | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      fetch(`/api/tourist/${slug}`)
        .then((r) => r.json())
        .then((data) => setPlace(data.data))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [slug]);

  if (loading) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-background-secondary rounded w-1/3" />
          <div className="h-64 bg-background-secondary rounded-lg" />
          <div className="h-4 bg-background-secondary rounded w-2/3" />
          <div className="h-4 bg-background-secondary rounded" />
          <div className="h-4 bg-background-secondary rounded" />
        </div>
      </main>
    );
  }

  if (!place) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">{t("notFound")}</h1>
        <Link href="/tourist" className="text-gold-400 hover:text-gold-300">
          &larr; {t("backToList")}
        </Link>
      </main>
    );
  }

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
