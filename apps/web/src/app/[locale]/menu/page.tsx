import { getTranslations, setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { MenuContent } from "./_components/MenuContent";

// ISR: serve cached HTML, regenerate at most every 5 minutes
export const revalidate = 300;

export default async function MenuPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("menu");

  const [foods, categories] = await Promise.all([
    prisma.food.findMany({
      where: { deletedAt: null, status: "PUBLISHED" },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        price: true,
        imageUrl: true,
        isPopular: true,
        isRecommended: true,
        category: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { sortOrder: "asc" },
      // Payload guardrail — revisit server pagination if content exceeds this
      take: 200,
    }),
    prisma.foodCategory.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        _count: {
          select: { foods: { where: { deletedAt: null, status: "PUBLISHED" } } },
        },
      },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  const activeCategories = categories.filter((cat) => cat._count.foods > 0);

  // schema.org Menu structured data built from the already-fetched foods
  const menuJsonLd = {
    "@context": "https://schema.org",
    "@type": "Menu",
    name: t("title"),
    hasMenuSection: activeCategories.map((cat) => ({
      "@type": "MenuSection",
      name: cat.name,
      hasMenuItem: foods
        .filter((food) => food.category.id === cat.id)
        .map((food) => ({
          "@type": "MenuItem",
          name: food.name,
          ...(food.description ? { description: food.description } : {}),
          ...(food.imageUrl ? { image: food.imageUrl } : {}),
          offers: {
            "@type": "Offer",
            price: food.price,
            priceCurrency: "JPY",
          },
        })),
    })),
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(menuJsonLd) }}
      />
      <h1 className="text-4xl font-jp font-bold text-gold-400 mb-4">{t("title")}</h1>
      <p className="text-foreground-secondary mb-8">{t("subtitle")}</p>

      <MenuContent foods={foods} categories={activeCategories} />
    </main>
  );
}
