"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";

interface Restaurant {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  latitude: number | null;
  longitude: number | null;
  openingHours: Record<string, string> | null;
  holidays: string[] | null;
  socialLinks: Record<string, string> | null;
}

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
        {restaurant?.description && (
          <section className="bg-background-secondary border border-border rounded-lg p-6">
            <p className="text-foreground-secondary">{restaurant.description}</p>
          </section>
        )}

        <section className="bg-background-secondary border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gold-400 mb-2">{t("address")}</h2>
          <p className="text-foreground-secondary">{restaurant?.address || "Tokyo, Japan"}</p>
          {restaurant?.phone && (
            <p className="text-foreground-secondary mt-2">Tel: {restaurant.phone}</p>
          )}
          {restaurant?.email && (
            <p className="text-foreground-secondary mt-2">Email: {restaurant.email}</p>
          )}
        </section>

        <section className="bg-background-secondary border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gold-400 mb-2">{t("hours")}</h2>
          {restaurant?.openingHours ? (
            <div className="space-y-1">
              {Object.entries(restaurant.openingHours).map(([day, hours]) => (
                <div key={day} className="flex justify-between text-foreground-secondary">
                  <span className="capitalize">{day}</span>
                  <span>{hours as string}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-foreground-secondary">Please contact us for opening hours</p>
          )}
          {restaurant?.holidays && restaurant.holidays.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border">
              <h3 className="text-sm font-medium text-foreground-secondary mb-2">Holidays</h3>
              <p className="text-foreground-secondary text-sm">{restaurant.holidays.join(", ")}</p>
            </div>
          )}
        </section>

        <section className="bg-background-secondary border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gold-400 mb-2">{t("map")}</h2>
          {restaurant?.latitude && restaurant?.longitude ? (
            <div className="aspect-video bg-background-tertiary rounded-lg overflow-hidden">
              <iframe
                src={`https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d3000!2d${restaurant.longitude}!3d${restaurant.latitude}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sjp!4v1`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Restaurant location"
              />
            </div>
          ) : (
            <div className="h-64 bg-background-tertiary rounded-lg flex items-center justify-center text-foreground-tertiary">
              Map not available
            </div>
          )}
        </section>

        {restaurant?.socialLinks && Object.keys(restaurant.socialLinks).length > 0 && (
          <section className="bg-background-secondary border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gold-400 mb-2">Follow Us</h2>
            <div className="flex gap-4">
              {Object.entries(restaurant.socialLinks).map(([platform, url]) => (
                <a
                  key={platform}
                  href={url as string}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground-secondary hover:text-gold-400 capitalize"
                >
                  {platform}
                </a>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
