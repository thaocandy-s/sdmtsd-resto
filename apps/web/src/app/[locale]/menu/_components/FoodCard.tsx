"use client";

import Link from "next/link";
import { Food } from "./types";

interface FoodCardProps {
  food: Food;
  formatPrice: (price: number) => string;
}

export function FoodCard({ food, formatPrice }: FoodCardProps) {
  return (
    <Link
      href={`/menu/${food.slug}`}
      className="group bg-background-secondary border border-border rounded-lg overflow-hidden hover:border-gold-500/50 transition-all flex flex-col justify-between h-full"
    >
      <div>
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
          <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
            {food.isPopular && (
              <span className="px-2 py-1 bg-gold-500 text-background text-xs rounded font-medium">
                Popular
              </span>
            )}
            {food.isRecommended && (
              <span className="px-2 py-1 bg-amber-600 text-white text-xs rounded font-medium">
                Recommended
              </span>
            )}
          </div>
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
        </div>
      </div>
      <div className="px-4 pb-4 flex items-center justify-between mt-auto">
        <span className="text-gold-400 font-semibold">{formatPrice(food.price)}</span>
        <span className="text-xs text-foreground-tertiary">{food.category?.name}</span>
      </div>
    </Link>
  );
}
