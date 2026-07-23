"use client";

import { useTranslations } from "next-intl";
import { Restaurant } from "./types";

interface SocialLinksSectionProps {
  restaurant: Restaurant | null;
}

export function SocialLinksSection({ restaurant }: SocialLinksSectionProps) {
  const t = useTranslations("info");
  const validLinks = Object.entries(restaurant?.socialLinks || {}).filter(
    ([_, url]) => typeof url === "string" && url.trim().length > 0
  );

  if (validLinks.length === 0) {
    return null;
  }

  return (
    <section className="bg-background-secondary border border-border rounded-lg p-6">
      <h2 className="text-lg font-semibold text-gold-400 mb-2">{t("followUs")}</h2>
      <div className="flex flex-wrap gap-4">
        {validLinks.map(([platform, url]) => (
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
  );
}
