"use client";

import { useTranslations } from "next-intl";
import { RestaurantFormData } from "./types";

interface SocialLinksSectionProps {
  form: RestaurantFormData;
  setForm: React.Dispatch<React.SetStateAction<RestaurantFormData>>;
}

const SOCIAL_PLATFORMS = [
  { key: "instagram", label: "Instagram URL", placeholder: "https://instagram.com/your-resto" },
  { key: "facebook", label: "Facebook URL", placeholder: "https://facebook.com/your-resto" },
  { key: "twitter", label: "Twitter / X URL", placeholder: "https://x.com/your-resto" },
  { key: "line", label: "LINE Official URL", placeholder: "https://line.me/R/ti/p/@your-resto" },
  { key: "tiktok", label: "TikTok URL", placeholder: "https://tiktok.com/@your-resto" },
];

export function SocialLinksSection({ form, setForm }: SocialLinksSectionProps) {
  const t = useTranslations("restaurantInfo");

  return (
    <div className="pt-4 border-t border-border space-y-4">
      <h3 className="text-md font-semibold text-foreground">🌐 {t("socialLinksTitle")}</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SOCIAL_PLATFORMS.map(({ key, label, placeholder }) => (
          <div key={key}>
            <label className="block text-xs text-foreground-secondary mb-1 capitalize">
              {label}
            </label>
            <input
              type="text"
              value={form.socialLinks[key] || ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  socialLinks: {
                    ...form.socialLinks,
                    [key]: e.target.value,
                  },
                })
              }
              placeholder={placeholder}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-gold-500 text-sm font-mono"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
