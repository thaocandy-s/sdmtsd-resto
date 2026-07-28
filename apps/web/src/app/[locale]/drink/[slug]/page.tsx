import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { DrinkDetail } from "./_components/DrinkDetail";

// ISR: serve cached HTML, regenerate at most every 5 minutes
export const revalidate = 300;

export async function generateStaticParams() {
  const drinks = await prisma.drink.findMany({
    where: { deletedAt: null, status: "PUBLISHED" },
    select: { slug: true },
  });
  return drinks.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const drink = await prisma.drink.findFirst({
    where: { slug, deletedAt: null, status: "PUBLISHED" },
    select: { name: true, description: true, imageUrl: true },
  });
  if (!drink) return {};
  return {
    title: drink.name,
    description: drink.description || undefined,
    alternates: {
      canonical: `/${locale}/drink/${slug}`,
      languages: { en: `/en/drink/${slug}`, ja: `/ja/drink/${slug}` },
    },
    openGraph: {
      title: drink.name,
      description: drink.description || undefined,
      images: drink.imageUrl ? [drink.imageUrl] : undefined,
    },
  };
}

export default async function DrinkDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("drink");

  const drink = await prisma.drink.findFirst({
    where: { slug, deletedAt: null, status: "PUBLISHED" },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      price: true,
      originalPrice: true,
      imageUrl: true,
      images: true,
      isPopular: true,
      alcoholPercent: true,
      volume: true,
      category: { select: { id: true, name: true, slug: true } },
    },
  });

  if (!drink) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">{t("notFound")}</h1>
        <Link href="/drink" className="text-gold-400 hover:text-gold-300">
          {t("backToList")}
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <Link
        href="/drink"
        className="inline-flex items-center text-gold-400 hover:text-gold-300 mb-6"
      >
        &larr; {t("backToList")}
      </Link>

      <DrinkDetail drink={drink} />
    </main>
  );
}
