"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { BeerArtCard, BeerArt } from "./components/beer-art-card";
import { BeerArtLightbox } from "./components/beer-art-lightbox";

export default function BeerArtPage() {
  const t = useTranslations("beerArt");
  const [items, setItems] = useState<BeerArt[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<BeerArt | null>(null);

  useEffect(() => {
    fetch("/api/beer-art?limit=50")
      .then((r) => r.json())
      .then((data) => setItems(data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-jp font-bold text-gold-400 mb-4">{t("title")}</h1>
      <p className="text-foreground-secondary mb-8">{t("subtitle")}</p>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="aspect-square bg-background-secondary border border-border rounded-lg animate-pulse"
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="text-center text-foreground-secondary py-12">{t("noItems")}</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {items.map((item) => (
            <BeerArtCard key={item.id} item={item} onClick={() => setSelectedItem(item)} />
          ))}
        </div>
      )}

      <BeerArtLightbox item={selectedItem} onClose={() => setSelectedItem(null)} />
    </main>
  );
}
