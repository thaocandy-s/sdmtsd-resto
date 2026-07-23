"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Drink } from "./types";

interface DrinkCardProps {
  drink: Drink;
  formatPrice: (price: number) => string;
}

export function DrinkCard({ drink, formatPrice }: DrinkCardProps) {
  const t = useTranslations("drink");
  const tCommon = useTranslations("common");

  return (
    <Link
      href={`/drink/${drink.slug}`}
      className="group bg-background-secondary border border-border rounded-lg overflow-hidden hover:border-gold-500/50 transition-all flex flex-col justify-between h-full"
    >
      <div>
        <div className="relative h-48 bg-background-tertiary">
          {drink.imageUrl ? (
            <img
              src={drink.imageUrl}
              alt={drink.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-foreground-tertiary">
              {t("noImage")}
            </div>
          )}
          {drink.isPopular && (
            <span className="absolute top-2 right-2 px-2 py-1 bg-gold-500 text-background text-xs rounded font-medium">
              {tCommon("popular")}
            </span>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-foreground group-hover:text-gold-400 transition-colors">
            {drink.name}
          </h3>
          {drink.description && (
            <p className="text-sm text-foreground-secondary mt-1 line-clamp-2">
              {drink.description}
            </p>
          )}
        </div>
      </div>
      <div className="px-4 pb-4 flex items-center justify-between mt-auto">
        <span className="text-gold-400 font-semibold">{formatPrice(drink.price)}</span>
        <div className="flex items-center gap-2 text-xs text-foreground-tertiary">
          {drink.alcoholPercent && <span>{drink.alcoholPercent}%</span>}
          {drink.volume && <span>{drink.volume}</span>}
        </div>
      </div>
    </Link>
  );
}
