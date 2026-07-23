"use client";

import { useTranslations } from "next-intl";
import { Restaurant } from "./types";

interface RestaurantAddressSectionProps {
  restaurant: Restaurant | null;
}

export function RestaurantAddressSection({ restaurant }: RestaurantAddressSectionProps) {
  const t = useTranslations("info");

  return (
    <section className="bg-background-secondary border border-border rounded-lg p-6">
      <h2 className="text-lg font-semibold text-gold-400 mb-2">{t("address")}</h2>
      <p className="text-foreground-secondary">{restaurant?.address || "Tokyo, Japan"}</p>
      {restaurant?.phone && (
        <p className="text-foreground-secondary mt-2">
          {t("phone")}: {restaurant.phone}
        </p>
      )}
      {restaurant?.email && (
        <p className="text-foreground-secondary mt-2">
          {t("email")}: {restaurant.email}
        </p>
      )}
    </section>
  );
}
