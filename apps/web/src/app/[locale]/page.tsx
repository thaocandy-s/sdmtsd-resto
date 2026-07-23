"use client";

import { useState, useEffect } from "react";
import { HeroSection } from "./_components/HeroSection";
import { PopularMenuSection } from "./_components/PopularMenuSection";
import { BeerArtSection } from "./_components/BeerArtSection";
import { ChallengeSection } from "./_components/ChallengeSection";
import { TouristSection } from "./_components/TouristSection";
import { FaqSection } from "./_components/FaqSection";

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
      <HeroSection />

      <PopularMenuSection popularFoods={popularFoods} loading={loading} />

      <BeerArtSection beerArts={beerArts} loading={loading} />

      <ChallengeSection />

      <TouristSection tourPlaces={tourPlaces} loading={loading} />

      <FaqSection
        faqs={faqs}
        expandedFaqId={expandedFaqId}
        toggleFaq={toggleFaq}
        loading={loading}
      />
    </main>
  );
}
