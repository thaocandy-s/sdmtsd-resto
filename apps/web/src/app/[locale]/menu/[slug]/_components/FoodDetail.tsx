"use client";

import { formatPriceWithTax } from "@resto-hub/utils";
import { Food, RelatedFood } from "./types";
import { FoodDetailImage } from "./FoodDetailImage";
import { FoodDetailInfo } from "./FoodDetailInfo";
import { RelatedFoods } from "./RelatedFoods";

interface FoodDetailProps {
  food: Food;
  related: RelatedFood[];
  taxRate: number;
}

export function FoodDetail({ food, related, taxRate }: FoodDetailProps) {
  const formatPrice = (price: number) => formatPriceWithTax(price, taxRate);

  return (
    <>
      <div className="grid md:grid-cols-2 gap-8">
        {/* Image */}
        <FoodDetailImage imageUrl={food.imageUrl} name={food.name} />

        {/* Details */}
        <FoodDetailInfo food={food} formatPrice={formatPrice} />
      </div>

      {/* Related Items */}
      <RelatedFoods related={related} formatPrice={formatPrice} />
    </>
  );
}
