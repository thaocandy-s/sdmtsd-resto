"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { MediaOutlet } from "./types";

interface FeaturedInLogosProps {
  outlets: MediaOutlet[];
}

export function FeaturedInLogos({ outlets }: FeaturedInLogosProps) {
  const t = useTranslations("mediaCoverage");

  if (outlets.length === 0) return null;

  return (
    <section className="mb-12" aria-labelledby="featured-in-heading">
      <h2
        id="featured-in-heading"
        className="text-sm font-semibold text-foreground-secondary tracking-wider uppercase text-center mb-6"
      >
        {t("featuredIn")}
      </h2>
      <div className="relative">
        <div className="flex items-center justify-start md:justify-center gap-8 md:gap-12 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
          {outlets.map((outlet) => {
            const content = (
              <div className="flex-shrink-0 snap-center flex items-center justify-center h-10 px-2 opacity-60 hover:opacity-100 transition-all duration-300 hover:scale-105">
                <Image
                  src={outlet.logoUrl}
                  alt={outlet.name}
                  width={120}
                  height={40}
                  className="max-h-10 w-auto object-contain brightness-0 invert"
                />
              </div>
            );

            if (outlet.websiteUrl) {
              return (
                <a
                  key={outlet.id}
                  href={outlet.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={outlet.name}
                >
                  {content}
                </a>
              );
            }

            return <div key={outlet.id}>{content}</div>;
          })}
        </div>
      </div>
    </section>
  );
}
