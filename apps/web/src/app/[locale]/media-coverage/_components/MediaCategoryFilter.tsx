"use client";

import { useTranslations } from "next-intl";
import { CATEGORY_VALUES } from "./types";

interface MediaCategoryFilterProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export function MediaCategoryFilter({
  selectedCategory,
  onSelectCategory,
}: MediaCategoryFilterProps) {
  const t = useTranslations("mediaCoverage");

  return (
    <div className="flex flex-wrap gap-2 mb-8" role="group" aria-label={t("all")}>
      <button
        onClick={() => onSelectCategory("")}
        aria-pressed={!selectedCategory}
        className={`px-4 py-2 min-h-[44px] sm:min-h-0 rounded-full text-sm transition-colors ${
          !selectedCategory
            ? "bg-gold-500 text-background font-medium"
            : "bg-background-secondary text-foreground-secondary hover:bg-background-tertiary"
        }`}
      >
        {t("all")}
      </button>
      {CATEGORY_VALUES.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelectCategory(cat)}
          aria-pressed={selectedCategory === cat}
          className={`px-4 py-2 min-h-[44px] sm:min-h-0 rounded-full text-sm transition-colors ${
            selectedCategory === cat
              ? "bg-gold-500 text-background font-medium"
              : "bg-background-secondary text-foreground-secondary hover:bg-background-tertiary"
          }`}
        >
          {t(`category.${cat}`)}
        </button>
      ))}
    </div>
  );
}
