"use client";

import { useTranslations } from "next-intl";
import { MediaCoverageArticle } from "./types";
import { MediaCoverageCard } from "./MediaCoverageCard";

interface MediaCoverageGridProps {
  articles: MediaCoverageArticle[];
}

export function MediaCoverageGrid({ articles }: MediaCoverageGridProps) {
  const t = useTranslations("mediaCoverage");

  if (articles.length === 0) {
    return <p className="text-center text-foreground-secondary py-12">{t("noArticles")}</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {articles.map((article) => (
        <MediaCoverageCard key={article.id} article={article} />
      ))}
    </div>
  );
}
