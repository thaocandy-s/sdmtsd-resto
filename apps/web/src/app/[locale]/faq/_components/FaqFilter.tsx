"use client";

import { useTranslations } from "next-intl";

interface FaqCategory {
  id: string;
  name: string;
  slug: string;
  _count: { faqs: number };
}

interface FaqFilterProps {
  categories: FaqCategory[];
  selectedCategory: string;
  onSelectCategory: (slug: string) => void;
}

export function FaqFilter({ categories, selectedCategory, onSelectCategory }: FaqFilterProps) {
  const t = useTranslations("faq");
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
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelectCategory(cat.slug)}
          className={`px-4 py-2 rounded-full text-sm transition-colors ${
            selectedCategory === cat.slug
              ? "bg-gold-500 text-background"
              : "bg-background-secondary text-foreground-secondary hover:bg-background-tertiary"
          }`}
        >
          {cat.name} ({cat._count.faqs})
        </button>
      ))}
    </div>
  );
}
