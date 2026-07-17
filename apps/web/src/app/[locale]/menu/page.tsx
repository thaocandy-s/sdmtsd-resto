"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import Link from "next/link";

interface Food {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  isPopular: boolean;
  isRecommended: boolean;
  category: {
    id: string;
    name: string;
    slug: string;
  };
}

interface Category {
  id: string;
  name: string;
  slug: string;
  _count: { foods: number };
}

export default function MenuPage() {
  const t = useTranslations("menu");
  const [foods, setFoods] = useState<Food[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/menu?limit=50").then((r) => r.json()),
      fetch("/api/menu/categories").then((r) => r.json()),
    ])
      .then(([foodsData, categoriesData]) => {
        setFoods(foodsData.data || []);
        setCategories(categoriesData.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      fetch(`/api/menu?category=${selectedCategory}&limit=50`)
        .then((r) => r.json())
        .then((data) => setFoods(data.data || []))
        .catch(console.error);
    } else {
      fetch("/api/menu?limit=50")
        .then((r) => r.json())
        .then((data) => setFoods(data.data || []))
        .catch(console.error);
    }
  }, [selectedCategory]);

  const formatPrice = (price: number) => `¥${price.toLocaleString()}`;

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
            {cat.name} ({cat._count.foods})
          </button>
        ))}
      </div>

      {/* Food Grid */}
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
      ) : foods.length === 0 ? (
        <p className="text-center text-foreground-secondary py-12">No menu items found</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {foods.map((food) => (
            <Link
              key={food.id}
              href={`/menu/${food.slug}`}
              className="group bg-background-secondary border border-border rounded-lg overflow-hidden hover:border-gold-500/50 transition-all"
            >
              <div className="relative h-48 bg-background-tertiary">
                {food.imageUrl ? (
                  <img
                    src={food.imageUrl}
                    alt={food.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-foreground-tertiary">
                    No image
                  </div>
                )}
                {food.isPopular && (
                  <span className="absolute top-2 right-2 px-2 py-1 bg-gold-500 text-background text-xs rounded">
                    Popular
                  </span>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-foreground group-hover:text-gold-400 transition-colors">
                  {food.name}
                </h3>
                {food.description && (
                  <p className="text-sm text-foreground-secondary mt-1 line-clamp-2">
                    {food.description}
                  </p>
                )}
                <div className="flex items-center justify-between mt-3">
                  <span className="text-gold-400 font-semibold">{formatPrice(food.price)}</span>
                  <span className="text-xs text-foreground-tertiary">{food.category.name}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
