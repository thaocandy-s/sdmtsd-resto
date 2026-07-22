"use client";

import { useTranslations } from "next-intl";
import { toSlug } from "@resto-hub/utils";
import { RestaurantFormData } from "./types";

interface BasicInfoSectionProps {
  form: RestaurantFormData;
  setForm: React.Dispatch<React.SetStateAction<RestaurantFormData>>;
}

export function BasicInfoSection({ form, setForm }: BasicInfoSectionProps) {
  const t = useTranslations("restaurantInfo");

  const handleNameChange = (nameValue: string) => {
    setForm((prev) => ({
      ...prev,
      name: nameValue,
      slug: toSlug(nameValue) || prev.slug || "restaurant",
    }));
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm text-foreground-secondary mb-1">{t("name")}</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => handleNameChange(e.target.value)}
          className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
        />
      </div>

      <div>
        <label className="block text-sm text-foreground-secondary mb-1">{t("description")}</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={3}
          className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
        />
      </div>

      <div>
        <label className="block text-sm text-foreground-secondary mb-1">{t("address")}</label>
        <input
          type="text"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
          className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
          placeholder="e.g. 1-2-3 Ginza, Chuo-ku, Tokyo"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-foreground-secondary mb-1">{t("phone")}</label>
          <input
            type="text"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
          />
        </div>
        <div>
          <label className="block text-sm text-foreground-secondary mb-1">{t("email")}</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
          />
        </div>
      </div>
    </div>
  );
}
