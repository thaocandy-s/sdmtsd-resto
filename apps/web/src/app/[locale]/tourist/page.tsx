"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { TourPlace, TourCategory } from "./_components/types";
import { TourCategoryFilter } from "./_components/TourCategoryFilter";
import { TourPlacesGrid } from "./_components/TourPlacesGrid";

export default function TouristPage() {
  const t = useTranslations("tourist");
  const [places, setPlaces] = useState<TourPlace[]>([]);
  const [categories, setCategories] = useState<TourCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/tourist?limit=50").then((r) => r.json()),
      fetch("/api/tourist/categories").then((r) => r.json()),
    ])
      .then(([placesData, categoriesData]) => {
        setPlaces(placesData.data || []);
        setCategories(categoriesData.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      fetch(`/api/tourist?category=${selectedCategory}&limit=50`)
        .then((r) => r.json())
        .then((data) => setPlaces(data.data || []))
        .catch(console.error);
    } else {
      fetch("/api/tourist?limit=50")
        .then((r) => r.json())
        .then((data) => setPlaces(data.data || []))
        .catch(console.error);
    }
  }, [selectedCategory]);

  return (
    <main className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-jp font-bold text-gold-400 mb-4">{t("title")}</h1>
      <p className="text-foreground-secondary mb-8">{t("subtitle")}</p>

      {/* Category Filter */}
      <TourCategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* Places Grid */}
      <TourPlacesGrid places={places} loading={loading} />
    </main>
  );
}
