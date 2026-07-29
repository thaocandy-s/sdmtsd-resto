"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { formatPriceWithTax } from "@resto-hub/utils";
import { Category, Food, GroupedCategory } from "./types";
import { CategoryFilter } from "./CategoryFilter";
import { CategorySliceSection } from "./CategorySliceSection";

interface MenuContentProps {
  foods: Food[];
  categories: Category[];
  taxRate: number;
}

export function MenuContent({ foods, categories, taxRate }: MenuContentProps) {
  const t = useTranslations("menu");
  const [selectedCategory, setSelectedCategory] = useState("");

  const formatPrice = (price: number) => formatPriceWithTax(price, taxRate);

  // Filter client-side over the server-provided payload (no refetch)
  const visibleFoods = useMemo(
    () => (selectedCategory ? foods.filter((f) => f.category?.slug === selectedCategory) : foods),
    [foods, selectedCategory]
  );

  const groupedCategories = useMemo<GroupedCategory[]>(() => {
    // Group foods by category slice
    const baseGroupedCategories: GroupedCategory[] = (
      categories.length > 0
        ? categories.map((cat) => ({
            category: cat,
            foods: visibleFoods.filter((f) => f.category?.id === cat.id),
          }))
        : Array.from(new Set(visibleFoods.map((f) => f.category?.id))).map((catId) => {
            const firstFood = visibleFoods.find((f) => f.category?.id === catId);
            const categoryFoods = visibleFoods.filter((f) => f.category?.id === catId);
            return {
              category: firstFood?.category || {
                id: catId || "unknown",
                name: t("otherMenu"),
                slug: "other",
                description: null,
              },
              foods: categoryFoods,
            };
          })
    ).filter((group) => group.foods.length > 0);

    // Append any foods that do not belong to matched categories
    const matchedFoodIds = new Set(baseGroupedCategories.flatMap((g) => g.foods.map((f) => f.id)));
    const remainingFoods = visibleFoods.filter((f) => !matchedFoodIds.has(f.id));
    if (remainingFoods.length > 0) {
      baseGroupedCategories.push({
        category: {
          id: "others",
          name: t("others"),
          slug: "others",
          description: null,
          _count: { foods: remainingFoods.length },
        },
        foods: remainingFoods,
      });
    }

    // Prepend Recommended section at the top if recommended items exist
    const recommendedFoods = visibleFoods.filter((f) => f.isRecommended);
    const grouped: GroupedCategory[] = [];

    if (recommendedFoods.length > 0) {
      grouped.push({
        category: {
          id: "recommended-section",
          name: t("recommended"),
          slug: "recommended",
          description: t("recommendedDesc"),
          _count: { foods: recommendedFoods.length },
        },
        foods: recommendedFoods,
      });
    }

    grouped.push(...baseGroupedCategories);
    return grouped;
  }, [visibleFoods, categories, t]);

  return (
    <>
      {/* Category Filter Pills */}
      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* Category Slices / Food Menu Carousel */}
      {groupedCategories.length === 0 ? (
        <p className="text-center text-foreground-secondary py-12">{t("noItems")}</p>
      ) : (
        <div className="space-y-12">
          {groupedCategories.map((group) => (
            <CategorySliceSection key={group.category.id} group={group} formatPrice={formatPrice} />
          ))}
        </div>
      )}
    </>
  );
}
