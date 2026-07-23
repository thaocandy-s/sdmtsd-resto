import { useTranslations } from "next-intl";
import Link from "next/link";
import { AnimatedSection } from "@/shared/components/animated-section";

interface BeerArt {
  id: string;
  title: string;
  imageUrl: string;
}

interface BeerArtSectionProps {
  beerArts: BeerArt[];
  loading: boolean;
}

export function BeerArtSection({ beerArts, loading }: BeerArtSectionProps) {
  const t = useTranslations("home");
  const tc = useTranslations("common");

  return (
    <AnimatedSection className="py-20 px-4 bg-background-secondary">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-jp font-bold text-gold-400 text-center mb-12">
          {t("beerArtPreview")}
        </h2>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="aspect-square bg-background-tertiary rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : beerArts.length === 0 ? (
          <p className="text-center text-foreground-secondary py-8">{t("noBeerArts")}</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {beerArts.map((art) => (
              <div
                key={art.id}
                className="aspect-square bg-background-tertiary rounded-lg overflow-hidden hover:scale-105 transition-transform"
              >
                <img src={art.imageUrl} alt={art.title} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}
        <div className="text-center mt-8">
          <Link href="/beer-art" className="text-gold-400 hover:text-gold-300 font-medium">
            {tc("viewAll")} &rarr;
          </Link>
        </div>
      </div>
    </AnimatedSection>
  );
}
