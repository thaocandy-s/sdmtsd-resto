"use client";

import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { MediaCoverageArticle } from "./types";

interface FeaturedMediaArticleProps {
  article: MediaCoverageArticle;
}

function formatDate(dateStr: string, locale: string) {
  return new Date(dateStr).toLocaleDateString(locale === "ja" ? "ja-JP" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function FeaturedMediaArticle({ article }: FeaturedMediaArticleProps) {
  const t = useTranslations("mediaCoverage");
  const locale = useLocale();

  return (
    <section className="mb-12" aria-labelledby="featured-article-heading">
      <h2 id="featured-article-heading" className="text-2xl font-bold text-foreground mb-6">
        {t("featuredArticle")}
      </h2>
      <article className="grid grid-cols-1 md:grid-cols-2 gap-0 rounded-2xl overflow-hidden border border-border bg-background-secondary shadow-lg group">
        <div className="relative min-h-[250px] md:min-h-[320px] bg-background-tertiary">
          <Image
            src={article.imageUrl}
            alt={article.title}
            fill
            priority
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent md:hidden" />
        </div>
        <div className="p-6 md:p-8 flex flex-col justify-center">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-xs font-semibold text-gold-400 uppercase tracking-wider">
              {article.mediaName}
            </span>
            <span className="text-xs text-foreground-tertiary">·</span>
            <time className="text-xs text-foreground-secondary" dateTime={article.publishedAt}>
              {t("publishedDate")}: {formatDate(article.publishedAt, locale)}
            </time>
          </div>
          <span className="inline-block w-fit text-xs px-2 py-1 bg-gold-500/10 text-gold-400 rounded mb-3">
            {t(`category.${article.category}`)}
          </span>
          <h3 className="text-xl md:text-2xl font-jp font-bold text-foreground mb-3">
            {article.title}
          </h3>
          {article.description && (
            <p className="text-sm text-foreground-secondary mb-6 line-clamp-4">
              {article.description}
            </p>
          )}
          <a
            href={article.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 w-fit bg-gold-500 hover:bg-gold-600 text-background text-sm font-semibold px-5 py-2.5 min-h-[44px] rounded-lg transition-colors"
          >
            {t("readArticle")}
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </article>
    </section>
  );
}
