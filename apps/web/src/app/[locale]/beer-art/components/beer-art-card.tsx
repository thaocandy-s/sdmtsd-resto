"use client";

export interface BeerArt {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string;
  customerName: string | null;
  artistName: string | null;
}

interface BeerArtCardProps {
  item: BeerArt;
  onClick: () => void;
}

export function BeerArtCard({ item, onClick }: BeerArtCardProps) {
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
    </button>
  );
}
