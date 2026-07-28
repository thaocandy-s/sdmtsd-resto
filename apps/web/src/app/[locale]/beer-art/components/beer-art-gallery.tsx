"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import dynamic from "next/dynamic";
import { BeerArtCard, BeerArt } from "./beer-art-card";

// Lightbox only loads when the gallery is opened on the client
const BeerArtLightbox = dynamic(
  () => import("./beer-art-lightbox").then((m) => m.BeerArtLightbox),
  { ssr: false }
);

interface BeerArtGalleryProps {
  items: BeerArt[];
}

export function BeerArtGallery({ items }: BeerArtGalleryProps) {
  const t = useTranslations("beerArt");
  const tc = useTranslations("common");
  const [selectedItem, setSelectedItem] = useState<BeerArt | null>(null);

  // Client-side pagination over the server-provided payload (no refetch)
  const [page, setPage] = useState(1);
  const limit = 8; // Fits 4 columns on desktop, 2 columns on mobile
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  const visibleItems = items.slice((page - 1) * limit, page * limit);

  return (
    <>
      {items.length === 0 ? (
        <p className="text-center text-foreground-secondary py-12">{t("noItems")}</p>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {visibleItems.map((item) => (
              <BeerArtCard key={item.id} item={item} onClick={() => setSelectedItem(item)} />
            ))}
          </div>

          {totalPages > 1 && (
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
    </>
  );
}
