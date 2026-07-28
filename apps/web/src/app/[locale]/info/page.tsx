import { getTranslations, setRequestLocale } from "next-intl/server";
import { getRestaurant } from "@/lib/restaurant";
import { Restaurant } from "./_components/types";
import { RestaurantAddressSection } from "./_components/RestaurantAddressSection";
import { OpeningHoursSection } from "./_components/OpeningHoursSection";
import { MapLocationSection } from "./_components/MapLocationSection";
import { SocialLinksSection } from "./_components/SocialLinksSection";

// ISR: restaurant info changes rarely, regenerate at most every hour
export const revalidate = 3600;

export default async function InfoPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("info");

  const record = await getRestaurant();
  const restaurant = record ? (JSON.parse(JSON.stringify(record)) as Restaurant) : null;

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
