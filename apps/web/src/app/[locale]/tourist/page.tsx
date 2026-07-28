import { getTranslations, setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { TouristContent } from "./_components/TouristContent";

// ISR: serve cached HTML, regenerate at most every 5 minutes
export const revalidate = 300;

export default async function TouristPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("tourist");

  const [places, categories] = await Promise.all([
    prisma.tourPlace.findMany({
      where: { deletedAt: null, isPublished: true },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        imageUrl: true,
        category: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { sortOrder: "asc" },
      // Payload guardrail — revisit server pagination if content exceeds this
      take: 200,
    }),
    prisma.tourCategory.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        _count: {
          select: {
            places: { where: { deletedAt: null, isPublished: true } },
          },
        },
      },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  return (
    <main className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-jp font-bold text-gold-400 mb-4">{t("title")}</h1>
      <p className="text-foreground-secondary mb-8">{t("subtitle")}</p>

      <TouristContent places={places} categories={categories} />
    </main>
  );
}
