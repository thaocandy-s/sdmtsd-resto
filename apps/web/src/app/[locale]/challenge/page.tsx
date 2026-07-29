import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { ChallengeRules } from "./components/challenge-rules";
import { WinnerSlider } from "./components/winner-slider";

// ISR: challenge content changes rarely, regenerate at most every hour
export const revalidate = 3600;

export default async function ChallengePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("challenge");

  const [rules, winnerRows, imageSetting] = await Promise.all([
    prisma.katanukiRule.findMany({
      where: { isActive: true },
      select: { id: true, title: true, description: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.katanukiWinner.findMany({
      where: { isPublished: true },
      select: {
        id: true,
        participantName: true,
        imageUrl: true,
        challengeName: true,
        discountAwarded: true,
        completedAt: true,
      },
      orderBy: { sortOrder: "asc" },
      take: 20,
    }),
    prisma.setting.findUnique({ where: { key: "katanuki_image" } }),
  ]);

  const winners = winnerRows.map((w) => ({
    ...w,
    completedAt: w.completedAt.toISOString(),
  }));
  const challengeImage = (imageSetting?.value as string) || "/images/katanuki.png";

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-jp font-bold text-gold-400 mb-4">{t("title")}</h1>
      <p className="text-foreground-secondary mb-8">{t("subtitle")}</p>

      {/* Main Challenge Info & Rules Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 items-stretch">
        <div className="relative min-h-[250px] md:min-h-full rounded-2xl overflow-hidden border border-border bg-background-secondary shadow-lg group">
          <Image
            src={challengeImage}
            alt="Katanuki Challenge Illustration"
            fill
            priority
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent flex items-end p-6">
            <div>
              <span className="text-gold-400 text-xs font-semibold tracking-wider uppercase block mb-1">
                {t("title")}
              </span>
              <span className="text-white text-lg font-bold font-jp">{t("title")}</span>
            </div>
          </div>
        </div>
        <ChallengeRules rules={rules} />
      </div>

      {/* Winners Gallery */}
      <section>
        <h2 className="text-2xl font-bold text-foreground mb-6">{t("recentWinners")}</h2>
        {winners.length === 0 ? (
          <p className="text-center text-foreground-secondary py-8">{t("noWinners")}</p>
        ) : (
          <WinnerSlider winners={winners} />
        )}
      </section>
    </main>
  );
}
