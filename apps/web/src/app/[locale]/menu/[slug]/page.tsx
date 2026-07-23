"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { formatPriceWithTax } from "@resto-hub/utils";
import { Food, RelatedFood } from "./_components/types";
import { FoodDetailImage } from "./_components/FoodDetailImage";
import { FoodDetailInfo } from "./_components/FoodDetailInfo";
import { RelatedFoods } from "./_components/RelatedFoods";

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
        <h1 className="text-2xl font-bold text-foreground mb-4">{t("notFound")}</h1>
        <Link href="/menu" className="text-gold-400 hover:text-gold-300">
          {t("backToList")}
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
        &larr; {t("backToList")}
      </Link>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Image */}
        <FoodDetailImage imageUrl={food.imageUrl} name={food.name} />

        {/* Details */}
        <FoodDetailInfo food={food} formatPrice={formatPrice} />
      </div>

      {/* Related Items */}
      <RelatedFoods related={related} formatPrice={formatPrice} />
    </main>
  );
}
