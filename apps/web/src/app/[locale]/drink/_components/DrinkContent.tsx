"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { formatPriceWithTax } from "@resto-hub/utils";
import { Category, Drink, GroupedCategory } from "./types";
import { CategoryFilter } from "./CategoryFilter";
import { CategorySliceSection } from "./CategorySliceSection";

interface DrinkContentProps {
  drinks: Drink[];
  categories: Category[];
}

export function DrinkContent({ drinks, categories }: DrinkContentProps) {
  const t = useTranslations("drink");
  const [selectedCategory, setSelectedCategory] = useState("");

  const formatPrice = (price: number) => formatPriceWithTax(price);

  // Filter client-side over the server-provided payload (no refetch)
  const visibleDrinks = useMemo(
    () => (selectedCategory ? drinks.filter((d) => d.category?.slug === selectedCategory) : drinks),
    [drinks, selectedCategory]
  );

  const groupedCategories = useMemo<GroupedCategory[]>(() => {
    // Group drinks by category slice
    const grouped: GroupedCategory[] = (
      categories.length > 0
        ? categories.map((cat) => ({
            category: cat,
            drinks: visibleDrinks.filter((d) => d.category?.id === cat.id),
          }))
        : Array.from(new Set(visibleDrinks.map((d) => d.category?.id))).map((catId) => {
            const firstDrink = visibleDrinks.find((d) => d.category?.id === catId);
            const categoryDrinks = visibleDrinks.filter((d) => d.category?.id === catId);
            return {
              category: firstDrink?.category || {
                id: catId || "unknown",
                name: t("otherDrinks"),
                slug: "other",
                description: null,
              },
              drinks: categoryDrinks,
            };
          })
    ).filter((group) => group.drinks.length > 0);

    // Append any drinks that do not belong to matched categories
    const matchedDrinkIds = new Set(grouped.flatMap((g) => g.drinks.map((d) => d.id)));
    const remainingDrinks = visibleDrinks.filter((d) => !matchedDrinkIds.has(d.id));
    if (remainingDrinks.length > 0) {
      grouped.push({
        category: {
          id: "others",
          name: t("others"),
          slug: "others",
          description: null,
          _count: { drinks: remainingDrinks.length },
        },
        drinks: remainingDrinks,
      });
    }

    return grouped;
  }, [visibleDrinks, categories, t]);

  return (
    <>
      {/* Category Filter Pills */}
      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* Category Slices / Drink Menu Carousel */}
      {groupedCategories.length === 0 ? (
        <p className="text-center text-foreground-secondary py-12">{t("noDrinks")}</p>
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
