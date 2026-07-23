import { useTranslations } from "next-intl";
import Link from "next/link";
import { AnimatedSection } from "@/shared/components/animated-section";
import { formatPriceWithTax } from "@resto-hub/utils";

interface Food {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  isPopular: boolean;
}

interface PopularMenuSectionProps {
  popularFoods: Food[];
  loading: boolean;
}

export function PopularMenuSection({ popularFoods, loading }: PopularMenuSectionProps) {
  const t = useTranslations("home");
  const tc = useTranslations("common");

  return (
    <AnimatedSection className="py-20 px-4 max-w-7xl mx-auto">
      <h2 className="text-3xl font-jp font-bold text-gold-400 text-center mb-12">
        {t("popularMenu")}
      </h2>
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-background-secondary border border-border rounded-lg p-6 text-center"
            >
              <div className="h-48 bg-background-tertiary rounded-lg mb-4 animate-pulse" />
              <div className="h-5 bg-background-tertiary rounded animate-pulse mb-2" />
              <div className="h-4 bg-background-tertiary rounded animate-pulse w-1/2 mx-auto" />
            </div>
          ))}
        </div>
      ) : popularFoods.length === 0 ? (
        <p className="text-center text-foreground-secondary py-8">{t("noPopularFoods")}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {popularFoods.map((food, index) => (
            <Link
              key={food.id}
              href={`/menu/${food.slug}`}
              className="group bg-background-secondary border border-border rounded-lg overflow-hidden hover:border-gold-500/50 transition-all"
            >
              <div className="relative h-48 bg-background-tertiary">
                {food.imageUrl ? (
                  <img
                    src={food.imageUrl}
                    alt={food.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-foreground-tertiary">
                    {t("noImage")}
                  </div>
                )}
                <div className="absolute top-2 left-2 w-8 h-8 rounded-full bg-gold-500 flex items-center justify-center text-background font-bold">
                  {index + 1}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-foreground group-hover:text-gold-400 transition-colors">
                  {food.name}
                </h3>
                {food.description && (
                  <p className="text-sm text-foreground-secondary mt-1 line-clamp-2">
                    {food.description}
                  </p>
                )}
                <p className="text-gold-400 font-bold mt-2 text-sm">
                  {formatPriceWithTax(food.price)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
      <div className="text-center mt-8">
        <Link href="/menu" className="text-gold-400 hover:text-gold-300 font-medium">
          {tc("viewAll")} &rarr;
        </Link>
      </div>
    </AnimatedSection>
  );
}
