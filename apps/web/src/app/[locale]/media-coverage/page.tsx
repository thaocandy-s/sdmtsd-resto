import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { FeaturedInLogos } from "./_components/FeaturedInLogos";
import { MediaCoverageContent } from "./_components/MediaCoverageContent";

export const revalidate = 300;

const baseUrl = process.env.NEXT_PUBLIC_WEB_URL || "https://restohub.com";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "mediaCoverage" });

  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: `/${locale}/media-coverage`,
      languages: {
        en: "/en/media-coverage",
        ja: "/ja/media-coverage",
        "x-default": "/ja/media-coverage",
      },
    },
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: `${baseUrl}/${locale}/media-coverage`,
    },
  };
}

export default async function MediaCoveragePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("mediaCoverage");

  const [articles, outlets] = await Promise.all([
    prisma.mediaCoverage.findMany({
      where: { deletedAt: null, isPublished: true },
      select: {
        id: true,
        publishedAt: true,
        mediaName: true,
        title: true,
        description: true,
        imageUrl: true,
        externalUrl: true,
        category: true,
        isFeatured: true,
      },
      orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }, { publishedAt: "desc" }],
      take: 200,
    }),
    prisma.mediaOutlet.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        logoUrl: true,
        websiteUrl: true,
      },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  const serializedArticles = articles.map((a) => ({
    ...a,
    publishedAt: a.publishedAt.toISOString(),
  }));

  return (
    <main className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-jp font-bold text-gold-400 mb-2">{t("title")}</h1>
      <p className="text-gold-400/80 text-xs font-semibold tracking-[0.2em] uppercase mb-4">
        {t("eyebrow")}
      </p>
      <p className="text-foreground-secondary mb-10 max-w-2xl">{t("description")}</p>

      <FeaturedInLogos outlets={outlets} />
      <MediaCoverageContent articles={serializedArticles} />
    </main>
  );
}
