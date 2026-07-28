"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { TourPlace, TourCategory } from "./types";
import { TourCategoryFilter } from "./TourCategoryFilter";
import { TourPlacesGrid } from "./TourPlacesGrid";

interface TouristContentProps {
  places: TourPlace[];
  categories: TourCategory[];
}

export function TouristContent({ places, categories }: TouristContentProps) {
  const tc = useTranslations("common");
  const [selectedCategory, setSelectedCategory] = useState("");

  // Pagination states (client-side over the server-provided payload, no refetch)
  const [page, setPage] = useState(1);
  const limit = 6; // Grid-friendly size limit (divisible by 1, 2, 3 columns)

  // Filter client-side over the server-provided payload (no refetch)
  const filteredPlaces = useMemo(
    () => (selectedCategory ? places.filter((p) => p.category?.slug === selectedCategory) : places),
    [places, selectedCategory]
  );

  const totalPlaces = filteredPlaces.length;
  const totalPages = Math.max(1, Math.ceil(totalPlaces / limit));
  const visiblePlaces = filteredPlaces.slice((page - 1) * limit, page * limit);

  const handleSelectCategory = (cat: string) => {
    setSelectedCategory(cat);
    setPage(1); // Reset page to 1 on category change
  };

  return (
    <>
      {/* Category Filter - Only display if there is at least one category */}
      {categories.length > 0 && (
        <TourCategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
        />
      )}

      {/* Places Grid */}
      <TourPlacesGrid places={visiblePlaces} loading={false} />

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-12 bg-background-secondary border border-border rounded-xl px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md max-w-2xl mx-auto">
          <div className="text-sm text-foreground-secondary font-medium">
            {tc("showingPage", {
              page,
              totalPages,
              total: totalPlaces,
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
  );
}
