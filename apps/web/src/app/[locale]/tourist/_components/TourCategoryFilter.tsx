"use client";

import { useTranslations } from "next-intl";
import { TourCategory } from "./types";

interface TourCategoryFilterProps {
  categories: TourCategory[];
  selectedCategory: string;
  onSelectCategory: (slug: string) => void;
}

export function TourCategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
}: TourCategoryFilterProps) {
  const t = useTranslations("tourist");
  const activeCategories = categories.filter((cat) => cat._count.places > 0);

  if (activeCategories.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-8">
      <button
        onClick={() => onSelectCategory("")}
        className={`px-4 py-2 rounded-full text-sm transition-colors ${
          !selectedCategory
            ? "bg-gold-500 text-background"
            : "bg-background-secondary text-foreground-secondary hover:bg-background-tertiary"
        }`}
      >
        {t("all")}
      </button>
      {activeCategories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelectCategory(cat.slug)}
          className={`px-4 py-2 rounded-full text-sm transition-colors ${
            selectedCategory === cat.slug
              ? "bg-gold-500 text-background"
              : "bg-background-secondary text-foreground-secondary hover:bg-background-tertiary"
          }`}
        >
          {cat.name} ({cat._count.places})
        </button>
      ))}
    </div>
  );
}
