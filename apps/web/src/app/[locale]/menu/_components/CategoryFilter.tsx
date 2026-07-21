"use client";

import { Category } from "./types";

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (slug: string) => void;
}

export function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-10">
      <button
        onClick={() => onSelectCategory("")}
        className={`px-4 py-2 rounded-full text-sm transition-colors ${
          !selectedCategory
            ? "bg-gold-500 text-background font-medium"
            : "bg-background-secondary text-foreground-secondary hover:bg-background-tertiary"
        }`}
      >
        All
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelectCategory(cat.slug)}
          className={`px-4 py-2 rounded-full text-sm transition-colors ${
            selectedCategory === cat.slug
              ? "bg-gold-500 text-background font-medium"
              : "bg-background-secondary text-foreground-secondary hover:bg-background-tertiary"
          }`}
        >
          {cat.name} ({cat._count?.foods ?? 0})
        </button>
      ))}
    </div>
  );
}
