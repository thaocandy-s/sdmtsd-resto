"use client";

import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { MediaCoverageArticle } from "./types";

interface MediaCoverageCardProps {
  article: MediaCoverageArticle;
}

function formatDate(dateStr: string, locale: string) {
  return new Date(dateStr).toLocaleDateString(locale === "ja" ? "ja-JP" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function MediaCoverageCard({ article }: MediaCoverageCardProps) {
  const t = useTranslations("mediaCoverage");
  const locale = useLocale();

  return (
    <article className="group bg-background-secondary border border-border rounded-lg overflow-hidden hover:border-gold-500/50 transition-all flex flex-col h-full">
      <div className="relative h-48 bg-background-tertiary">
        <Image
          src={article.imageUrl}
          alt={article.title}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="text-xs font-medium text-gold-400">{article.mediaName}</span>
          <time className="text-xs text-foreground-tertiary" dateTime={article.publishedAt}>
            {formatDate(article.publishedAt, locale)}
          </time>
        </div>
        <span className="inline-block w-fit text-xs px-2 py-1 bg-gold-500/10 text-gold-400 rounded mb-2">
          {t(`category.${article.category}`)}
        </span>
        <h3 className="font-semibold text-foreground group-hover:text-gold-400 transition-colors line-clamp-2">
          {article.title}
        </h3>
        {article.description && (
          <p className="text-sm text-foreground-secondary mt-2 line-clamp-2 flex-1">
            {article.description}
          </p>
        )}
        <a
          href={article.externalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 mt-4 text-sm text-gold-400 hover:text-gold-300 font-medium min-h-[44px] sm:min-h-0"
        >
          {t("readArticle")}
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </article>
  );
}
