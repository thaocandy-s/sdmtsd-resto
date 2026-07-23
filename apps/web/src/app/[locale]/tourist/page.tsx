"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { TourPlace, TourCategory } from "./_components/types";
import { TourCategoryFilter } from "./_components/TourCategoryFilter";
import { TourPlacesGrid } from "./_components/TourPlacesGrid";

export default function TouristPage() {
  const t = useTranslations("tourist");
  const tc = useTranslations("common");
  const [places, setPlaces] = useState<TourPlace[]>([]);
  const [categories, setCategories] = useState<TourCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(true);

  // Pagination states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPlaces, setTotalPlaces] = useState(0);
  const limit = 6; // Grid-friendly size limit (divisible by 1, 2, 3 columns)

  // Fetch categories once on mount
  useEffect(() => {
    fetch("/api/tourist/categories")
      .then((r) => r.json())
      .then((data) => setCategories(data.data || []))
      .catch(console.error);
  }, []);

  // Fetch places when page or category changes
  useEffect(() => {
    setLoading(true);
    const categoryQuery = selectedCategory ? `&category=${selectedCategory}` : "";
    fetch(`/api/tourist?page=${page}&limit=${limit}${categoryQuery}`)
      .then((r) => r.json())
      .then((res) => {
        setPlaces(res.data || []);
        if (res.meta) {
          setTotalPages(res.meta.totalPages || 1);
          setTotalPlaces(res.meta.total || 0);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, selectedCategory]);

  const handleSelectCategory = (cat: string) => {
    setSelectedCategory(cat);
    setPage(1); // Reset page to 1 on category change
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-jp font-bold text-gold-400 mb-4">{t("title")}</h1>
      <p className="text-foreground-secondary mb-8">{t("subtitle")}</p>

      {/* Category Filter - Only display if there is at least one category */}
      {categories.length > 0 && (
        <TourCategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
        />
      )}

      {/* Places Grid */}
      <TourPlacesGrid places={places} loading={loading} />

      {/* Pagination Controls */}
      {!loading && totalPages > 1 && (
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
    </main>
  );
}
