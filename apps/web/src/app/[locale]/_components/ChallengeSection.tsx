import { useTranslations } from "next-intl";
import Link from "next/link";
import { AnimatedSection } from "@/shared/components/animated-section";

export function ChallengeSection() {
  const t = useTranslations("home");
  const tc = useTranslations("common");

  return (
    <AnimatedSection className="py-20 px-4 max-w-7xl mx-auto">
      <h2 className="text-3xl font-jp font-bold text-gold-400 text-center mb-12">
        {t("challengeSection")}
      </h2>
      <div className="text-center">
        <p className="text-foreground-secondary text-lg mb-6">{t("challengeSubtitle")}</p>
        <Link href="/challenge" className="text-gold-400 hover:text-gold-300 font-medium">
          {tc("viewMore")} &rarr;
        </Link>
      </div>
    </AnimatedSection>
  );
}
