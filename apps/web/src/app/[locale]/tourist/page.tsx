"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import Link from "next/link";

interface TourPlace {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  category: {
    id: string;
    name: string;
    slug: string;
  };
}

interface TourCategory {
  id: string;
  name: string;
  slug: string;
  _count: { places: number };
}

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
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setSelectedCategory("")}
          className={`px-4 py-2 rounded-full text-sm transition-colors ${
            !selectedCategory
              ? "bg-gold-500 text-background"
              : "bg-background-secondary text-foreground-secondary hover:bg-background-tertiary"
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.slug)}
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

      {/* Places Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-background-secondary border border-border rounded-lg overflow-hidden"
            >
              <div className="h-48 bg-background-tertiary animate-pulse" />
              <div className="p-4">
                <div className="h-4 bg-background-tertiary rounded animate-pulse mb-2" />
                <div className="h-3 bg-background-tertiary rounded animate-pulse w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : places.length === 0 ? (
        <p className="text-center text-foreground-secondary py-12">No tourist places found</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {places.map((place) => (
            <Link
              key={place.id}
              href={`/tourist/${place.slug}`}
              className="group bg-background-secondary border border-border rounded-lg overflow-hidden hover:border-gold-500/50 transition-all"
            >
              <div className="h-48 bg-background-tertiary">
                {place.imageUrl ? (
                  <img
                    src={place.imageUrl}
                    alt={place.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-foreground-tertiary">
                    No image
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-foreground group-hover:text-gold-400 transition-colors">
                  {place.name}
                </h3>
                {place.description && (
                  <p className="text-sm text-foreground-secondary mt-1 line-clamp-2">
                    {place.description}
                  </p>
                )}
                <span className="inline-block mt-2 text-xs px-2 py-1 bg-gold-500/10 text-gold-400 rounded">
                  {place.category.name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
