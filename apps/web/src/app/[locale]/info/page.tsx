"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { Restaurant } from "./_components/types";
import { RestaurantAddressSection } from "./_components/RestaurantAddressSection";
import { OpeningHoursSection } from "./_components/OpeningHoursSection";
import { MapLocationSection } from "./_components/MapLocationSection";
import { SocialLinksSection } from "./_components/SocialLinksSection";

export default function InfoPage() {
  const t = useTranslations("info");
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/info")
      .then((r) => r.json())
      .then((data) => setRestaurant(data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-8">
          <div className="h-10 bg-background-secondary rounded w-1/3" />
          <div className="h-32 bg-background-secondary rounded-lg" />
          <div className="h-32 bg-background-secondary rounded-lg" />
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-jp font-bold text-gold-400 mb-8">{t("title")}</h1>

      <div className="space-y-8">
        {/* Description Section */}
        {restaurant?.description && (
          <section className="bg-background-secondary border border-border rounded-lg p-6">
            <p className="text-foreground-secondary">{restaurant.description}</p>
          </section>
        )}

        {/* Address & Contact Section */}
        <RestaurantAddressSection restaurant={restaurant} />

        {/* Opening Hours Section */}
        <OpeningHoursSection restaurant={restaurant} />

        {/* Google Maps Location Section */}
        <MapLocationSection restaurant={restaurant} />

        {/* Follow Us / Social Links Section */}
        <SocialLinksSection restaurant={restaurant} />
      </div>
    </main>
  );
}
