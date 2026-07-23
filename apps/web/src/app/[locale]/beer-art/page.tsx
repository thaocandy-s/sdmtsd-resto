"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { BeerArtCard, BeerArt } from "./components/beer-art-card";
import { BeerArtLightbox } from "./components/beer-art-lightbox";

export default function BeerArtPage() {
  const t = useTranslations("beerArt");
  const tc = useTranslations("common");
  const [items, setItems] = useState<BeerArt[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<BeerArt | null>(null);

  // Pagination states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 8; // Fits 4 columns on desktop, 2 columns on mobile

  useEffect(() => {
    setLoading(true);
    fetch(`/api/beer-art?page=${page}&limit=${limit}`)
      .then((r) => r.json())
      .then((res) => {
        setItems(res.data || []);
        if (res.meta) {
          setTotalPages(res.meta.totalPages || 1);
          setTotalItems(res.meta.total || 0);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page]);

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
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {items.map((item) => (
              <BeerArtCard key={item.id} item={item} onClick={() => setSelectedItem(item)} />
            ))}
          </div>

          {!loading && totalPages > 1 && (
            <div className="mt-12 bg-background-secondary border border-border rounded-xl px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md max-w-2xl mx-auto">
              <div className="text-sm text-foreground-secondary font-medium">
                {tc("showingPage", {
                  page,
                  totalPages,
                  total: totalItems,
                })}
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setPage(Math.max(page - 1, 1))}
                  disabled={page === 1}
                  className="flex-1 sm:flex-none px-4 py-2 min-h-[44px] sm:min-h-0 border border-border rounded-lg text-sm font-semibold text-foreground-secondary hover:text-gold-400 hover:border-gold-500/40 hover:bg-background-tertiary disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center justify-center cursor-pointer"
                >
                  &larr; {tc("previous")}
                </button>
                <button
                  onClick={() => setPage(Math.min(page + 1, totalPages))}
                  disabled={page === totalPages}
                  className="flex-1 sm:flex-none px-4 py-2 min-h-[44px] sm:min-h-0 border border-border rounded-lg text-sm font-semibold text-foreground-secondary hover:text-gold-400 hover:border-gold-500/40 hover:bg-background-tertiary disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center justify-center cursor-pointer"
                >
                  {tc("next")} &rarr;
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <BeerArtLightbox item={selectedItem} onClose={() => setSelectedItem(null)} />
    </main>
  );
}
