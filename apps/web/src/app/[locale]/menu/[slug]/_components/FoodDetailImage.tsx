"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

interface FoodDetailImageProps {
  imageUrl: string | null;
  name: string;
}

export function FoodDetailImage({ imageUrl, name }: FoodDetailImageProps) {
  const t = useTranslations("menu");
  return (
    <div className="relative aspect-square bg-background-secondary rounded-lg overflow-hidden">
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={name}
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
  );
}
