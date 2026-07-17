"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import Link from "next/link";

interface BeerArt {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string;
  customerName: string | null;
  artistName: string | null;
}

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
        <p className="text-center text-foreground-secondary py-12">No beer art gallery items yet</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="aspect-square bg-background-secondary border border-border rounded-lg overflow-hidden hover:border-gold-500/50 transition-all group"
            >
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedItem(null)}
        >
          <div className="max-w-4xl max-h-[90vh] relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute -top-10 right-0 text-white hover:text-gold-400 text-2xl"
            >
              &times;
            </button>
            <img
              src={selectedItem.imageUrl}
              alt={selectedItem.title}
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
            <div className="mt-4 text-center text-white">
              <h3 className="text-xl font-semibold">{selectedItem.title}</h3>
              {selectedItem.description && (
                <p className="text-foreground-secondary mt-2">{selectedItem.description}</p>
              )}
              {selectedItem.customerName && (
                <p className="text-sm text-foreground-tertiary mt-2">
                  Customer: {selectedItem.customerName}
                </p>
              )}
              {selectedItem.artistName && (
                <p className="text-sm text-foreground-tertiary">
                  Artist: {selectedItem.artistName}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
