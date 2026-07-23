"use client";

import { useTranslations } from "next-intl";

interface FoodDetailImageProps {
  imageUrl: string | null;
  name: string;
}

export function FoodDetailImage({ imageUrl, name }: FoodDetailImageProps) {
  const t = useTranslations("menu");
  return (
    <div className="aspect-square bg-background-secondary rounded-lg overflow-hidden">
      {imageUrl ? (
        <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-foreground-tertiary">
          {t("noImageAvailable")}
        </div>
      )}
    </div>
  );
}
