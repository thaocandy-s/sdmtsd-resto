import { getTranslations, setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { getTaxRate } from "@/lib/settings";
import { BuffetList } from "./components/buffet-list";

// ISR: serve cached HTML, regenerate at most every 5 minutes
export const revalidate = 300;

export default async function BuffetPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("buffet");

  const courses = await prisma.buffetCourse.findMany({
    where: { deletedAt: null, status: "PUBLISHED" },
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
    orderBy: { sortOrder: "asc" },
    // Payload guardrail — revisit server pagination if content exceeds this
    take: 200,
  });

  const taxRate = await getTaxRate();

  return (
    <main className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-jp font-bold text-gold-400 mb-4">{t("title")}</h1>
      <p className="text-foreground-secondary mb-8">{t("subtitle")}</p>

      <BuffetList courses={courses} taxRate={taxRate} />
    </main>
  );
}
