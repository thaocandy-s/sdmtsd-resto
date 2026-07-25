"use client";

import { useTranslations } from "next-intl";

export interface BeerArt {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string;
  customerName: string | null;
  artistName: string | null;
  isPopular: boolean;
}

interface BeerArtCardProps {
  item: BeerArt;
  onClick: () => void;
}

export function BeerArtCard({ item, onClick }: BeerArtCardProps) {
  const tc = useTranslations("common");

  return (
    <button
      onClick={onClick}
      className="aspect-square bg-background-secondary border border-border rounded-lg overflow-hidden hover:border-gold-500/50 transition-all group relative"
    >
      <img
        src={item.imageUrl}
        alt={item.title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        loading="lazy"
      />
      {item.isPopular && (
        <span className="absolute top-2 right-2 px-2 py-1 bg-gold-500 text-background text-xs rounded font-medium">
          {tc("popular")}
        </span>
      )}
    </button>
  );
}
