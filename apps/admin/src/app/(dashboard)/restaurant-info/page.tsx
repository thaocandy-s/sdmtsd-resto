"use client";

import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toSlug } from "@resto-hub/utils";
import { api } from "@/lib/api-client";
import { Restaurant, RestaurantFormData } from "./_components/types";
import { BasicInfoSection } from "./_components/BasicInfoSection";
import { MapLocationSection } from "./_components/MapLocationSection";
import { OpeningHoursSection } from "./_components/OpeningHoursSection";
import { SocialLinksSection } from "./_components/SocialLinksSection";

export default function RestaurantInfoPage() {
  const t = useTranslations("restaurantInfo");
  const tCommon = useTranslations("common");
  const queryClient = useQueryClient();

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [form, setForm] = useState<RestaurantFormData>({
    name: "",
    slug: "",
    description: "",
    address: "",
    phone: "",
    email: "",
    latitude: "",
    longitude: "",
    googlePlaceId: "",
    googleMapQuery: "",
    openingHours: {
      monday: "11:00 - 22:00",
      tuesday: "11:00 - 22:00",
      wednesday: "11:00 - 22:00",
      thursday: "11:00 - 22:00",
      friday: "11:00 - 23:00",
      saturday: "11:00 - 23:00",
      sunday: "11:00 - 22:00",
    },
    holidays: "",
    socialLinks: {
      instagram: "",
      facebook: "",
      twitter: "",
      line: "",
      tiktok: "",
    },
    isActive: true,
  });

  const infoQuery = useQuery({
    queryKey: ["restaurant-info"],
    queryFn: () => api.get<{ data: Restaurant | null }>("/api/info"),
  });

  const restaurant = infoQuery.data?.data ?? null;
  const loading = infoQuery.isPending;

  // Seed the form whenever fresh info arrives
  useEffect(() => {
    if (!restaurant) return;
    setForm({
      name: restaurant.name,
      slug: restaurant.slug,
      description: restaurant.description || "",
      address: restaurant.address || "",
      phone: restaurant.phone || "",
      email: restaurant.email || "",
      latitude: restaurant.latitude?.toString() || "",
      longitude: restaurant.longitude?.toString() || "",
      googlePlaceId: restaurant.googlePlaceId || "",
      googleMapQuery: restaurant.googleMapQuery || "",
      openingHours: {
        monday: restaurant.openingHours?.monday || "11:00 - 22:00",
        tuesday: restaurant.openingHours?.tuesday || "11:00 - 22:00",
        wednesday: restaurant.openingHours?.wednesday || "11:00 - 22:00",
        thursday: restaurant.openingHours?.thursday || "11:00 - 22:00",
        friday: restaurant.openingHours?.friday || "11:00 - 23:00",
        saturday: restaurant.openingHours?.saturday || "11:00 - 23:00",
        sunday: restaurant.openingHours?.sunday || "11:00 - 22:00",
        ...restaurant.openingHours,
      },
      holidays: Array.isArray(restaurant.holidays) ? restaurant.holidays.join(", ") : "",
      socialLinks: {
        instagram: restaurant.socialLinks?.instagram || "",
        facebook: restaurant.socialLinks?.facebook || "",
        twitter: restaurant.socialLinks?.twitter || "",
        line: restaurant.socialLinks?.line || "",
        tiktok: restaurant.socialLinks?.tiktok || "",
        ...restaurant.socialLinks,
      },
      isActive: restaurant.isActive,
    });
  }, [restaurant]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const payload = {
        ...form,
        slug: form.slug || toSlug(form.name) || "restaurant",
        holidays: form.holidays
          ? form.holidays
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
      };
      await api.put("/api/info", payload);
      setMessage({
        type: "success",
        text: t("successMessage"),
      });
      queryClient.invalidateQueries({ queryKey: ["restaurant-info"] });
    } catch (error) {
      console.error("Save info error:", error);
      setMessage({
        type: "error",
        text: t("errorMessage"),
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="animate-pulse">
        <div className="h-40 bg-background-secondary rounded-lg" />
      </div>
    );

  return (
    <>
      <header className="mb-8">
        <h2 className="text-2xl font-bold text-foreground">{t("title")}</h2>
        <p className="text-foreground-secondary mt-1">{t("subtitle")}</p>
      </header>

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg text-sm font-medium ${
            message.type === "success"
              ? "bg-green-500/10 border border-green-500/20 text-green-400"
              : "bg-red-500/10 border border-red-500/20 text-red-400"
          }`}
        >
          {message.text}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-background-secondary border border-border rounded-lg p-4 sm:p-6 space-y-6 max-w-4xl"
      >
        {/* Basic Info Section */}
        <BasicInfoSection form={form} setForm={setForm} />

        {/* Map Location Section */}
        <MapLocationSection form={form} setForm={setForm} />

        {/* Opening Hours Section */}
        <OpeningHoursSection form={form} setForm={setForm} />

        {/* Follow Us / Social Links Section */}
        <SocialLinksSection form={form} setForm={setForm} />

        {/* Footer */}
        <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <label className="flex items-center gap-2 cursor-pointer py-1">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="rounded border-border"
            />
            <span className="text-sm text-foreground">{t("active")}</span>
          </label>

          <button
            type="submit"
            disabled={saving}
            className="bg-gold-500 hover:bg-gold-600 disabled:opacity-50 text-background px-6 py-2.5 rounded-lg font-medium transition-colors w-full sm:w-auto text-center flex items-center justify-center h-[42px] sm:h-auto"
          >
            {saving ? t("saving") : t("saveChanges")}
          </button>
        </div>
      </form>
    </>
  );
}
