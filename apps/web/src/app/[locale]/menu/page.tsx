"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { formatPriceWithTax } from "@resto-hub/utils";
import { Category, Food, GroupedCategory } from "./_components/types";
import { CategoryFilter } from "./_components/CategoryFilter";
import { CategorySliceSection } from "./_components/CategorySliceSection";
import { FoodSkeleton } from "./_components/FoodSkeleton";

export default function MenuPage() {
  const t = useTranslations("menu");
  const [foods, setFoods] = useState<Food[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/menu/categories")
      .then((r) => r.json())
      .then((categoriesData) => {
        setCategories(categoriesData.data || []);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    const url = selectedCategory
      ? `/api/menu?category=${selectedCategory}&limit=100`
      : "/api/menu?limit=100";

    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        setFoods(data.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedCategory]);

  const formatPrice = (price: number) => formatPriceWithTax(price);

  // Group foods by category slice
  const baseGroupedCategories: GroupedCategory[] = (
    categories.length > 0
      ? categories.map((cat) => ({
          category: cat,
          foods: foods.filter((f) => f.category?.id === cat.id),
        }))
      : Array.from(new Set(foods.map((f) => f.category?.id))).map((catId) => {
          const firstFood = foods.find((f) => f.category?.id === catId);
          const categoryFoods = foods.filter((f) => f.category?.id === catId);
          return {
            category: firstFood?.category || {
              id: catId || "unknown",
              name: "Other Menu Items",
              slug: "other",
              description: null,
            },
            foods: categoryFoods,
          };
        })
  ).filter((group) => group.foods.length > 0);

  // Append any foods that do not belong to matched categories
  const matchedFoodIds = new Set(baseGroupedCategories.flatMap((g) => g.foods.map((f) => f.id)));
  const remainingFoods = foods.filter((f) => !matchedFoodIds.has(f.id));
  if (remainingFoods.length > 0) {
    baseGroupedCategories.push({
      category: {
        id: "others",
        name: "Others",
        slug: "others",
        description: null,
        _count: { foods: remainingFoods.length },
      },
      foods: remainingFoods,
    });
  }

  // Prepend Recommended section at the top if recommended items exist
  const recommendedFoods = foods.filter((f) => f.isRecommended);
  const groupedCategories: GroupedCategory[] = [];

  if (recommendedFoods.length > 0) {
    groupedCategories.push({
      category: {
        id: "recommended-section",
        name: "Recommended",
        slug: "recommended",
        description: "Chef's special recommended dishes.",
        _count: { foods: recommendedFoods.length },
      },
      foods: recommendedFoods,
    });
  }

  groupedCategories.push(...baseGroupedCategories);

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

      {/* Category Slices / Food Menu Carousel */}
      {loading ? (
        <FoodSkeleton />
      ) : groupedCategories.length === 0 ? (
        <p className="text-center text-foreground-secondary py-12">No menu items found</p>
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
