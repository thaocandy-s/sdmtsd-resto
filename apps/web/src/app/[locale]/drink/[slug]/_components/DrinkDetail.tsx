"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { formatPriceWithTax } from "@resto-hub/utils";

export interface Drink {
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

interface DrinkDetailProps {
  drink: Drink;
}

export function DrinkDetail({ drink }: DrinkDetailProps) {
  const t = useTranslations("drink");
  const tCommon = useTranslations("common");

  const formatPrice = (price: number) => formatPriceWithTax(price);

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="relative aspect-square bg-background-secondary rounded-lg overflow-hidden">
        {drink.imageUrl ? (
          <Image
            src={drink.imageUrl}
            alt={drink.name}
            fill
            priority
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
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

        {drink.description && <p className="text-foreground-secondary mb-6">{drink.description}</p>}

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
              <span className="text-foreground">{t("alcoholLabel")}:</span> {drink.alcoholPercent}%
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
  );
}
