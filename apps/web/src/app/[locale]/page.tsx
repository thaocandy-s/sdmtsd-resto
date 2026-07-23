import { HeroSection } from "./_components/HeroSection";
import { PopularMenuSection } from "./_components/PopularMenuSection";
import { BeerArtSection } from "./_components/BeerArtSection";
import { ChallengeSection } from "./_components/ChallengeSection";
import { TouristSection } from "./_components/TouristSection";
import { FaqSection } from "./_components/FaqSection";
import { prisma } from "@/lib/prisma";

export const revalidate = 3600; // Cache page static response for 1 hour (ISR)

export default async function HomePage() {
  const [banners, popularFoods, beerArts, tourPlaces, faqs] = await Promise.all([
    prisma.heroBanner.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.food.findMany({
      where: { isPopular: true, status: "PUBLISHED" },
      take: 3,
      orderBy: { sortOrder: "asc" },
    }),
    prisma.beerArt.findMany({
      where: { isPublished: true },
      take: 4,
      orderBy: { sortOrder: "asc" },
    }),
    prisma.tourPlace.findMany({
      where: { isPublished: true },
      take: 3,
      orderBy: { sortOrder: "asc" },
    }),
    prisma.faq.findMany({
      where: { isPublished: true },
      take: 3,
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  const serializedBanners = banners.map((b) => ({
    id: b.id,
    title: b.title,
    subtitle: b.subtitle,
    imageUrl: b.imageUrl,
  }));

  const serializedPopularFoods = popularFoods.map((f) => ({
    id: f.id,
    name: f.name,
    slug: f.slug,
    description: f.description,
    price: f.price,
    imageUrl: f.imageUrl,
    isPopular: f.isPopular,
  }));

  const serializedBeerArts = beerArts.map((b) => ({
    id: b.id,
    title: b.title,
    imageUrl: b.imageUrl,
  }));

  const serializedTourPlaces = tourPlaces.map((t) => ({
    id: t.id,
    name: t.name,
    slug: t.slug,
    description: t.description,
    imageUrl: t.imageUrl,
  }));

  const serializedFaqs = faqs.map((f) => ({
    id: f.id,
    question: f.question,
    answer: f.answer,
  }));

  return (
    <main>
      <HeroSection initialBanners={serializedBanners} />

      <PopularMenuSection popularFoods={serializedPopularFoods} loading={false} />

      <BeerArtSection beerArts={serializedBeerArts} loading={false} />

      <ChallengeSection />

      <TouristSection tourPlaces={serializedTourPlaces} loading={false} />

      <FaqSection faqs={serializedFaqs} loading={false} />
    </main>
  );
}
