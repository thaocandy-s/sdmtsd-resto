"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { formatPriceWithTax } from "@resto-hub/utils";

interface Drink {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  originalPrice: number | null;
  imageUrl: string | null;
  images: string[];
  isPopular: boolean;
  alcoholPercent: number | null;
  volume: string | null;
  category: {
    id: string;
    name: string;
    slug: string;
  };
}

export default function DrinkDetailPage() {
  const t = useTranslations("drink");
  const params = useParams();
  const slug = params.slug as string;
  const [drink, setDrink] = useState<Drink | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetch(`/api/drink/${slug}`)
        .then((r) => r.json())
        .then((data) => setDrink(data.data))
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

  if (!drink) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">{t("notFound")}</h1>
        <Link href="/drink" className="text-gold-400 hover:text-gold-300">
          {t("backToList")}
        </Link>
      </main>
    );
  }

  const tCommon = useTranslations("common");

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <Link
        href="/drink"
        className="inline-flex items-center text-gold-400 hover:text-gold-300 mb-6"
      >
        &larr; {t("backToList")}
      </Link>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="aspect-square bg-background-secondary rounded-lg overflow-hidden">
          {drink.imageUrl ? (
            <img src={drink.imageUrl} alt={drink.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-foreground-tertiary">
              {t("noImageAvailable")}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-1 bg-gold-500/10 text-gold-400 text-xs rounded">
              {drink.category.name}
            </span>
            {drink.isPopular && (
              <span className="px-2 py-1 bg-red-500/10 text-red-400 text-xs rounded font-medium">
                {tCommon("popular")}
              </span>
            )}
          </div>

          <h1 className="text-3xl font-jp font-bold text-foreground mb-4">{drink.name}</h1>

          {drink.description && (
            <p className="text-foreground-secondary mb-6">{drink.description}</p>
          )}

          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-2xl font-bold text-gold-400">{formatPrice(drink.price)}</span>
            {drink.originalPrice && (
              <span className="text-lg text-foreground-tertiary line-through">
                {formatPrice(drink.originalPrice)}
              </span>
            )}
          </div>

          <div className="space-y-2">
            {drink.alcoholPercent && (
              <p className="text-foreground-secondary">
                <span className="text-foreground">{t("alcoholLabel")}:</span> {drink.alcoholPercent}
                %
              </p>
            )}
            {drink.volume && (
              <p className="text-foreground-secondary">
                <span className="text-foreground">{t("volumeLabel")}:</span> {drink.volume}
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
