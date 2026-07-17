"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import Link from "next/link";
import { AnimatedSection } from "@/shared/components/animated-section";

interface Food {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  isPopular: boolean;
}

interface BeerArt {
  id: string;
  title: string;
  imageUrl: string;
}

interface TourPlace {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
}

interface Faq {
  id: string;
  question: string;
  answer: string;
}

export default function HomePage() {
  const t = useTranslations("home");
  const tc = useTranslations("common");

  const [popularFoods, setPopularFoods] = useState<Food[]>([]);
  const [beerArts, setBeerArts] = useState<BeerArt[]>([]);
  const [tourPlaces, setTourPlaces] = useState<TourPlace[]>([]);
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/menu?isPopular=true&limit=3&status=published").then((r) => r.json()),
      fetch("/api/beer-art?limit=4").then((r) => r.json()),
      fetch("/api/tourist?limit=3").then((r) => r.json()),
      fetch("/api/faq?limit=3").then((r) => r.json()),
    ])
      .then(([foodsData, beerArtData, touristData, faqData]) => {
        setPopularFoods(foodsData.data || []);
        setBeerArts(beerArtData.data || []);
        setTourPlaces(touristData.data || []);
        setFaqs(faqData.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const toggleFaq = (id: string) => {
    setExpandedFaqId(expandedFaqId === id ? null : id);
  };

  return (
    <main>
      {/* Hero Banner */}
      <section className="relative min-h-[80vh] flex items-center justify-center bg-wood-pattern">
        <div className="text-center px-4">
          <h1 className="text-5xl md:text-7xl font-jp font-bold text-gold-400 mb-6 animate-fade-in">
            {t("heroTitle")}
          </h1>
          <p className="text-xl md:text-2xl text-foreground-secondary max-w-2xl mx-auto mb-8 animate-slide-up">
            {t("heroSubtitle")}
          </p>
          <Link
            href="/reservation"
            className="inline-block bg-gold-500 hover:bg-gold-600 text-background font-semibold px-8 py-4 rounded-lg text-lg transition-colors"
          >
            {t("reserveNow")}
          </Link>
        </div>
      </section>

      {/* Popular Menu Ranking */}
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
          <p className="text-center text-foreground-secondary py-8">No popular items yet</p>
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
                      No image
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
                  <p className="text-gold-400 font-bold mt-2">¥{food.price.toLocaleString()}</p>
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

      {/* Beer Art Preview */}
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
            <p className="text-center text-foreground-secondary py-8">No beer art gallery yet</p>
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

      {/* Katanuki Challenge */}
      <AnimatedSection className="py-20 px-4 max-w-7xl mx-auto">
        <h2 className="text-3xl font-jp font-bold text-gold-400 text-center mb-12">
          {t("challengeSection")}
        </h2>
        <div className="text-center">
          <p className="text-foreground-secondary text-lg mb-6">
            Test your skills and win amazing discounts!
          </p>
          <Link href="/challenge" className="text-gold-400 hover:text-gold-300 font-medium">
            {tc("viewMore")} &rarr;
          </Link>
        </div>
      </AnimatedSection>

      {/* Tourist Guide Preview */}
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
            <p className="text-center text-foreground-secondary py-8">No tourist places yet</p>
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
                      <img
                        src={place.imageUrl}
                        alt={place.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-foreground-tertiary">
                        No image
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

      {/* FAQ Preview */}
      <AnimatedSection className="py-20 px-4 max-w-4xl mx-auto">
        <h2 className="text-3xl font-jp font-bold text-gold-400 text-center mb-12">
          {t("faqPreview")}
        </h2>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-background-secondary border border-border rounded-lg p-4">
                <div className="h-4 bg-background-tertiary rounded w-3/4 animate-pulse" />
              </div>
            ))}
          </div>
        ) : faqs.length === 0 ? (
          <p className="text-center text-foreground-secondary py-8">No FAQs yet</p>
        ) : (
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div
                key={faq.id}
                className="bg-background-secondary border border-border rounded-lg overflow-hidden hover:border-gold-500/30 transition-colors"
              >
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full flex items-center justify-between p-4 text-left"
                >
                  <span className="font-medium text-foreground pr-4">{faq.question}</span>
                  <span
                    className={`text-gold-400 text-xl transition-transform ${
                      expandedFaqId === faq.id ? "rotate-180" : ""
                    }`}
                  >
                    ▼
                  </span>
                </button>
                {expandedFaqId === faq.id && (
                  <div className="px-4 pb-4 text-foreground-secondary">{faq.answer}</div>
                )}
              </div>
            ))}
          </div>
        )}
        <div className="text-center mt-8">
          <Link href="/faq" className="text-gold-400 hover:text-gold-300 font-medium">
            {tc("viewAll")} &rarr;
          </Link>
        </div>
      </AnimatedSection>

      {/* Reservation CTA */}
      <section className="py-20 px-4 bg-gold-gradient text-center">
        <h2 className="text-3xl font-jp font-bold text-background mb-6">{t("reservationCta")}</h2>
        <Link
          href="/reservation"
          className="inline-block bg-background hover:bg-background-secondary text-gold-400 font-semibold px-8 py-4 rounded-lg text-lg transition-colors"
        >
          {t("reserveNow")}
        </Link>
      </section>
    </main>
  );
}
