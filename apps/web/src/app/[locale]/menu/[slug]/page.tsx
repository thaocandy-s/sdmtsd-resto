import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { FoodDetail } from "./_components/FoodDetail";

// ISR: serve cached HTML, regenerate at most every 5 minutes
export const revalidate = 300;

export async function generateStaticParams() {
  const foods = await prisma.food.findMany({
    where: { deletedAt: null, status: "PUBLISHED" },
    select: { slug: true },
  });
  return foods.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const food = await prisma.food.findFirst({
    where: { slug, deletedAt: null, status: "PUBLISHED" },
    select: { name: true, description: true, imageUrl: true },
  });
  if (!food) return {};
  return {
    title: food.name,
    description: food.description || undefined,
    alternates: {
      canonical: `/${locale}/menu/${slug}`,
      languages: { en: `/en/menu/${slug}`, ja: `/ja/menu/${slug}` },
    },
    openGraph: {
      title: food.name,
      description: food.description || undefined,
      images: food.imageUrl ? [food.imageUrl] : undefined,
    },
  };
}

export default async function FoodDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("menu");

  const food = await prisma.food.findFirst({
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
      isRecommended: true,
      ingredients: true,
      calories: true,
      categoryId: true,
      category: { select: { id: true, name: true, slug: true } },
    },
  });

  if (!food) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">{t("notFound")}</h1>
        <Link href="/menu" className="text-gold-400 hover:text-gold-300">
          {t("backToList")}
        </Link>
      </main>
    );
  }

  // Related foods from the same category
  const related = await prisma.food.findMany({
    where: {
      categoryId: food.categoryId,
      id: { not: food.id },
      deletedAt: null,
      status: "PUBLISHED",
    },
    select: { id: true, name: true, slug: true, imageUrl: true, price: true },
    take: 4,
    orderBy: { isPopular: "desc" },
  });

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <Link
        href="/menu"
        className="inline-flex items-center text-gold-400 hover:text-gold-300 mb-6"
      >
        &larr; {t("backToList")}
      </Link>

      <FoodDetail food={food} related={related} />
    </main>
  );
}
