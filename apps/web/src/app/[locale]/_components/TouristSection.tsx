import { useTranslations } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import { AnimatedSection } from "@/shared/components/animated-section";

interface TourPlace {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
}

interface TouristSectionProps {
  tourPlaces: TourPlace[];
  loading: boolean;
}

export function TouristSection({ tourPlaces, loading }: TouristSectionProps) {
  const t = useTranslations("home");
  const tc = useTranslations("common");

  return (
    <AnimatedSection className="py-20 px-4 bg-background-secondary">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-jp font-bold text-gold-400 text-center mb-12">
          {t("touristPreview")}
        </h2>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-background border border-border rounded-lg overflow-hidden"
              >
                <div className="h-40 bg-background-tertiary animate-pulse" />
                <div className="p-4">
                  <div className="h-4 bg-background-tertiary rounded mb-2 animate-pulse" />
                  <div className="h-3 bg-background-tertiary rounded w-2/3 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : tourPlaces.length === 0 ? (
          <p className="text-center text-foreground-secondary py-8">{t("noTourPlaces")}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tourPlaces.map((place) => (
              <Link
                key={place.id}
                href={`/tourist/${place.slug}`}
                className="group bg-background border border-border rounded-lg overflow-hidden hover:border-gold-500/30 transition-colors"
              >
                <div className="h-40 bg-background-tertiary">
                  {place.imageUrl ? (
                    <Image
                      src={place.imageUrl}
                      alt={place.name}
                      width={400}
                      height={160}
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-foreground-tertiary">
                      {t("noImage")}
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-foreground group-hover:text-gold-400 transition-colors">
                    {place.name}
                  </h3>
                  {place.description && (
                    <p className="text-sm text-foreground-secondary mt-1 line-clamp-2">
                      {place.description}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
        <div className="text-center mt-8">
          <Link href="/tourist" className="text-gold-400 hover:text-gold-300 font-medium">
            {tc("viewAll")} &rarr;
          </Link>
        </div>
      </div>
    </AnimatedSection>
  );
}
