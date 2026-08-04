"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { MediaCoverageArticle } from "./types";
import { MediaCategoryFilter } from "./MediaCategoryFilter";
import { FeaturedMediaArticle } from "./FeaturedMediaArticle";
import { MediaCoverageGrid } from "./MediaCoverageGrid";

interface MediaCoverageContentProps {
  articles: MediaCoverageArticle[];
}

export function MediaCoverageContent({ articles }: MediaCoverageContentProps) {
  const tc = useTranslations("common");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [page, setPage] = useState(1);
  const limit = 6;

  const featuredArticle = useMemo(() => articles.find((a) => a.isFeatured) ?? null, [articles]);

  const listArticles = useMemo(
    () => (featuredArticle ? articles.filter((a) => a.id !== featuredArticle.id) : articles),
    [articles, featuredArticle]
  );

  const filteredArticles = useMemo(
    () =>
      selectedCategory ? listArticles.filter((a) => a.category === selectedCategory) : listArticles,
    [listArticles, selectedCategory]
  );

  const totalArticles = filteredArticles.length;
  const totalPages = Math.max(1, Math.ceil(totalArticles / limit));
  const visibleArticles = filteredArticles.slice((page - 1) * limit, page * limit);

  const handleSelectCategory = (cat: string) => {
    setSelectedCategory(cat);
    setPage(1);
  };

  return (
    <>
      {featuredArticle && <FeaturedMediaArticle article={featuredArticle} />}

      <MediaCategoryFilter
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
      />

      <MediaCoverageGrid articles={visibleArticles} />

      {totalPages > 1 && (
        <div className="mt-12 bg-background-secondary border border-border rounded-xl px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md max-w-2xl mx-auto">
          <div className="text-sm text-foreground-secondary font-medium">
            {tc("showingPage", {
              page,
              totalPages,
              total: totalArticles,
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
