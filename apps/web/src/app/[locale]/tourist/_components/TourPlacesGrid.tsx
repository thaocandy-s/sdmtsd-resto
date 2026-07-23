"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { TourPlace } from "./types";

interface TourPlacesGridProps {
  places: TourPlace[];
  loading: boolean;
}

export function TourPlacesGrid({ places, loading }: TourPlacesGridProps) {
  const t = useTranslations("tourist");

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-background-secondary border border-border rounded-lg overflow-hidden"
          >
            <div className="h-48 bg-background-tertiary animate-pulse" />
            <div className="p-4">
              <div className="h-4 bg-background-tertiary rounded animate-pulse mb-2" />
              <div className="h-3 bg-background-tertiary rounded animate-pulse w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (places.length === 0) {
    return <p className="text-center text-foreground-secondary py-12">{t("noPlaces")}</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {places.map((place) => (
        <Link
          key={place.id}
          href={`/tourist/${place.slug}`}
          className="group bg-background-secondary border border-border rounded-lg overflow-hidden hover:border-gold-500/50 transition-all"
        >
          <div className="h-48 bg-background-tertiary">
            {place.imageUrl ? (
              <img
                src={place.imageUrl}
                alt={place.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-foreground-tertiary">
                {t("noImage")}
              </div>
            )}
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-foreground group-hover:text-gold-400 transition-colors">
              {place.name}
            </h3>
            {place.description && (
              <p className="text-sm text-foreground-secondary mt-1 line-clamp-2">
                {place.description}
              </p>
            )}
            <span className="inline-block mt-2 text-xs px-2 py-1 bg-gold-500/10 text-gold-400 rounded">
              {place.category.name}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
