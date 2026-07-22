"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { formatPriceWithTax } from "@resto-hub/utils";
import { Category, Drink, GroupedCategory } from "./_components/types";
import { CategoryFilter } from "./_components/CategoryFilter";
import { CategorySliceSection } from "./_components/CategorySliceSection";
import { DrinkSkeleton } from "./_components/DrinkSkeleton";

export default function DrinkPage() {
  const t = useTranslations("drink");
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/drink/categories")
      .then((r) => r.json())
      .then((categoriesData) => {
        setCategories(categoriesData.data || []);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    const url = selectedCategory
      ? `/api/drink?category=${selectedCategory}&limit=100`
      : "/api/drink?limit=100";

    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        setDrinks(data.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedCategory]);

  const formatPrice = (price: number) => formatPriceWithTax(price);

  // Group drinks by category slice
  const groupedCategories: GroupedCategory[] = (
    categories.length > 0
      ? categories.map((cat) => ({
          category: cat,
          drinks: drinks.filter((d) => d.category?.id === cat.id),
        }))
      : Array.from(new Set(drinks.map((d) => d.category?.id))).map((catId) => {
          const firstDrink = drinks.find((d) => d.category?.id === catId);
          const categoryDrinks = drinks.filter((d) => d.category?.id === catId);
          return {
            category: firstDrink?.category || {
              id: catId || "unknown",
              name: "Other Drinks",
              slug: "other",
              description: null,
            },
            drinks: categoryDrinks,
          };
        })
  ).filter((group) => group.drinks.length > 0);

  // Append any drinks that do not belong to matched categories
  const matchedDrinkIds = new Set(groupedCategories.flatMap((g) => g.drinks.map((d) => d.id)));
  const remainingDrinks = drinks.filter((d) => !matchedDrinkIds.has(d.id));
  if (remainingDrinks.length > 0) {
    groupedCategories.push({
      category: {
        id: "others",
        name: "Others",
        slug: "others",
        description: null,
        _count: { drinks: remainingDrinks.length },
      },
      drinks: remainingDrinks,
    });
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-jp font-bold text-gold-400 mb-4">{t("title")}</h1>
      <p className="text-foreground-secondary mb-8">{t("subtitle")}</p>

      {/* Category Filter Pills */}
      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* Category Slices / Drink Menu Carousel */}
      {loading ? (
        <DrinkSkeleton />
      ) : groupedCategories.length === 0 ? (
        <p className="text-center text-foreground-secondary py-12">No drinks found</p>
      ) : (
        <div className="space-y-12">
          {groupedCategories.map((group) => (
            <CategorySliceSection key={group.category.id} group={group} formatPrice={formatPrice} />
          ))}
        </div>
      )}
    </main>
  );
}
