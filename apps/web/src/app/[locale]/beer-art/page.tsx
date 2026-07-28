import { getTranslations, setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { BeerArtGallery } from "./components/beer-art-gallery";

// ISR: serve cached HTML, regenerate at most every 5 minutes
export const revalidate = 300;

export default async function BeerArtPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("beerArt");

  const items = await prisma.beerArt.findMany({
    where: { deletedAt: null, isPublished: true },
    select: {
      id: true,
      title: true,
      description: true,
      imageUrl: true,
      customerName: true,
      artistName: true,
      isPopular: true,
    },
    orderBy: [{ isPopular: "desc" }, { sortOrder: "asc" }],
    // Payload guardrail — revisit server pagination if content exceeds this
    take: 200,
  });

  return (
    <main className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-jp font-bold text-gold-400 mb-4">{t("title")}</h1>
      <p className="text-foreground-secondary mb-8">{t("subtitle")}</p>

      <BeerArtGallery items={items} />
    </main>
  );
}
