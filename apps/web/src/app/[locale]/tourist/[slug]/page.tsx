import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import Link from "next/link";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { TourPlaceDetail } from "./_components/TourPlaceDetail";

// ISR: serve cached HTML, regenerate at most every 5 minutes
export const revalidate = 300;

export async function generateStaticParams() {
  const places = await prisma.tourPlace.findMany({
    where: { deletedAt: null, isPublished: true },
    select: { slug: true },
  });
  return places.map(({ slug }) => ({ slug }));
}

// Deduplicated between generateMetadata and the page — one query per render
const getPlace = cache((slug: string) =>
  prisma.tourPlace.findFirst({
    where: { slug, deletedAt: null, isPublished: true },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      address: true,
      latitude: true,
      longitude: true,
      websiteUrl: true,
      googleMapUrl: true,
      phone: true,
      imageUrl: true,
      images: true,
      openingHours: true,
      category: { select: { id: true, name: true, slug: true } },
    },
  })
);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const place = await getPlace(slug);
  if (!place) return {};
  return {
    title: place.name,
    description: place.description || undefined,
    alternates: {
      canonical: `/${locale}/tourist/${slug}`,
      languages: { en: `/en/tourist/${slug}`, ja: `/ja/tourist/${slug}` },
    },
    openGraph: {
      title: place.name,
      description: place.description || undefined,
      images: place.imageUrl ? [place.imageUrl] : undefined,
    },
  };
}

export default async function TouristDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("tourist");

  const place = await getPlace(slug);

  if (!place) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">{t("notFound")}</h1>
        <Link href="/tourist" className="text-gold-400 hover:text-gold-300">
          &larr; {t("backToList")}
        </Link>
      </main>
    );
  }

  return <TourPlaceDetail place={place} />;
}
