import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import Link from "next/link";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { getRestaurant } from "@/lib/restaurant";
import { getTaxRate } from "@/lib/settings";
import { BuffetDetailContent } from "../components/buffet-detail-content";

// ISR: serve cached HTML, regenerate at most every 5 minutes
export const revalidate = 300;

export async function generateStaticParams() {
  const courses = await prisma.buffetCourse.findMany({
    where: { deletedAt: null, status: "PUBLISHED" },
    select: { slug: true },
  });
  return courses.map(({ slug }) => ({ slug }));
}

// Deduplicated between generateMetadata and the page — one query per render
const getCourse = cache((slug: string) =>
  prisma.buffetCourse.findFirst({
    where: { slug, deletedAt: null, status: "PUBLISHED" },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      price: true,
      duration: true,
      minPeople: true,
      maxPeople: true,
      includes: true,
      isAllMenu: true,
      notes: true,
      imageUrl: true,
      isPopular: true,
    },
  })
);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const course = await getCourse(slug);
  if (!course) return {};
  return {
    title: course.name,
    description: course.description || undefined,
    alternates: {
      canonical: `/${locale}/buffet/${slug}`,
      languages: { en: `/en/buffet/${slug}`, ja: `/ja/buffet/${slug}` },
    },
    openGraph: {
      title: course.name,
      description: course.description || undefined,
      images: course.imageUrl ? [course.imageUrl] : undefined,
    },
  };
}

export default async function BuffetDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("buffet");

  const [course, restaurant, taxRate] = await Promise.all([
    getCourse(slug),
    getRestaurant(),
    getTaxRate(),
  ]);

  if (!course) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">{t("notFound")}</h1>
        <Link href="/buffet" className="text-gold-400 hover:text-gold-300">
          {t("backToList")}
        </Link>
      </main>
    );
  }

  return (
    <BuffetDetailContent
      course={course}
      phone={restaurant?.phone || "+81-3-1234-5678"}
      taxRate={taxRate}
    />
  );
}
