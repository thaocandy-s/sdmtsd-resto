"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { formatPriceWithTax } from "@resto-hub/utils";

interface Food {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  originalPrice: number | null;
  imageUrl: string | null;
  images: string[];
  isPopular: boolean;
  isRecommended: boolean;
  allergens: string[];
  ingredients: string | null;
  calories: number | null;
  category: {
    id: string;
    name: string;
    slug: string;
  };
}

interface RelatedFood {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  price: number;
}

export default function FoodDetailPage() {
  const t = useTranslations("menu");
  const params = useParams();
  const slug = params.slug as string;
  const [food, setFood] = useState<Food | null>(null);
  const [related, setRelated] = useState<RelatedFood[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetch(`/api/menu/${slug}`)
        .then((r) => r.json())
        .then((data) => {
          setFood(data.data);
          setRelated(data.related || []);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [slug]);

  const formatPrice = (price: number) => formatPriceWithTax(price);

  if (loading) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="animate-pulse">
          <div className="h-96 bg-background-secondary rounded-lg mb-8" />
          <div className="h-8 bg-background-secondary rounded w-1/3 mb-4" />
          <div className="h-4 bg-background-secondary rounded w-2/3" />
        </div>
      </main>
    );
  }

  if (!food) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">Food not found</h1>
        <Link href="/menu" className="text-gold-400 hover:text-gold-300">
          Back to menu
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <Link
        href="/menu"
        className="inline-flex items-center text-gold-400 hover:text-gold-300 mb-6"
      >
        &larr; Back to menu
      </Link>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Image */}
        <div className="aspect-square bg-background-secondary rounded-lg overflow-hidden">
          {food.imageUrl ? (
            <img src={food.imageUrl} alt={food.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-foreground-tertiary">
              No image available
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-1 bg-gold-500/10 text-gold-400 text-xs rounded">
              {food.category.name}
            </span>
            {food.isPopular && (
              <span className="px-2 py-1 bg-red-500/10 text-red-400 text-xs rounded">Popular</span>
            )}
          </div>

          <h1 className="text-3xl font-jp font-bold text-foreground mb-4">{food.name}</h1>

          {food.description && <p className="text-foreground-secondary mb-6">{food.description}</p>}

          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-2xl font-bold text-gold-400">{formatPrice(food.price)}</span>
            {food.originalPrice && (
              <span className="text-lg text-foreground-tertiary line-through">
                {formatPrice(food.originalPrice)}
              </span>
            )}
          </div>

          {food.calories && (
            <p className="text-sm text-foreground-secondary mb-4">{food.calories} kcal</p>
          )}

          {food.allergens.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-foreground-secondary mb-2">Allergens</h3>
              <div className="flex flex-wrap gap-2">
                {food.allergens.map((allergen) => (
                  <span
                    key={allergen}
                    className="px-2 py-1 bg-orange-500/10 text-orange-400 text-xs rounded"
                  >
                    {allergen}
                  </span>
                ))}
              </div>
            </div>
          )}

          {food.ingredients && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-foreground-secondary mb-2">Ingredients</h3>
              <p className="text-sm text-foreground-secondary">{food.ingredients}</p>
            </div>
          )}
        </div>
      </div>

      {/* Related Items */}
      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">You might also like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.map((item) => (
              <Link
                key={item.id}
                href={`/menu/${item.slug}`}
                className="group bg-background-secondary border border-border rounded-lg overflow-hidden hover:border-gold-500/50 transition-all"
              >
                <div className="aspect-square bg-background-tertiary">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-foreground-tertiary text-sm">
                      No image
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-medium truncate group-hover:text-gold-400">
                    {item.name}
                  </h3>
                  <p className="text-sm text-gold-400 mt-1">{formatPrice(item.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
