import { getTranslations, setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { DrinkContent } from "./_components/DrinkContent";

// ISR: serve cached HTML, regenerate at most every 5 minutes
export const revalidate = 300;

export default async function DrinkPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("drink");

  const [drinks, categories] = await Promise.all([
    prisma.drink.findMany({
      where: { deletedAt: null, status: "PUBLISHED" },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        price: true,
        imageUrl: true,
        isPopular: true,
        alcoholPercent: true,
        volume: true,
        category: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { sortOrder: "asc" },
      // Payload guardrail — revisit server pagination if content exceeds this
      take: 200,
    }),
    prisma.drinkCategory.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        _count: {
          select: { drinks: { where: { deletedAt: null, status: "PUBLISHED" } } },
        },
      },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  const activeCategories = categories.filter((cat) => cat._count.drinks > 0);

  return (
    <main className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-jp font-bold text-gold-400 mb-4">{t("title")}</h1>
      <p className="text-foreground-secondary mb-8">{t("subtitle")}</p>

      <DrinkContent drinks={drinks} categories={activeCategories} />
    </main>
  );
}
