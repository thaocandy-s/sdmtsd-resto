"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { RelatedFood } from "./types";

interface RelatedFoodsProps {
  related: RelatedFood[];
  formatPrice: (price: number) => string;
}

export function RelatedFoods({ related, formatPrice }: RelatedFoodsProps) {
  const t = useTranslations("menu");

  if (related.length === 0) {
    return null;
  }

  return (
    <section className="mt-12">
      <h2 className="text-2xl font-bold text-foreground mb-6">{t("relatedItems")}</h2>
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
                  {t("noImage")}
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
  );
}
