import { MetadataRoute } from "next";

const baseUrl = process.env.NEXT_PUBLIC_WEB_URL || "https://restohub.com";
const locales = ["en", "ja"];

const staticPages = [
  "",
  "/menu",
  "/drink",
  "/buffet",
  "/beer-art",
  "/challenge",
  "/tourist",
  "/faq",
  "/info",
  "/reservation",
  "/contact",
  "/privacy",
  "/terms",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const page of staticPages) {
      entries.push({
        url: `${baseUrl}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: page === "" ? "daily" : "weekly",
        priority: page === "" ? 1.0 : 0.8,
        alternates: {
          languages: Object.fromEntries(locales.map((l) => [l, `${baseUrl}/${l}${page}`])),
        },
      });
    }
  }

  // Fetch dynamic pages
  try {
    const apiBase = process.env.NEXT_PUBLIC_WEB_URL || "http://localhost:3000";

    const [foods, drinks, buffets, places] = await Promise.all([
      fetch(`${apiBase}/api/menu`)
        .then((r) => r.json())
        .then((d) => d.data || [])
        .catch(() => []),
      fetch(`${apiBase}/api/drink`)
        .then((r) => r.json())
        .then((d) => d.data || [])
        .catch(() => []),
      fetch(`${apiBase}/api/buffet`)
        .then((r) => r.json())
        .then((d) => d.data || [])
        .catch(() => []),
      fetch(`${apiBase}/api/tourist`)
        .then((r) => r.json())
        .then((d) => d.data || [])
        .catch(() => []),
    ]);

    for (const locale of locales) {
      for (const food of foods) {
        entries.push({
          url: `${baseUrl}/${locale}/menu/${food.slug}`,
          lastModified: new Date(food.updatedAt || Date.now()),
          changeFrequency: "weekly",
          priority: 0.7,
        });
      }
      for (const drink of drinks) {
        entries.push({
          url: `${baseUrl}/${locale}/drink/${drink.slug}`,
          lastModified: new Date(drink.updatedAt || Date.now()),
          changeFrequency: "weekly",
          priority: 0.7,
        });
      }
      for (const buffet of buffets) {
        entries.push({
          url: `${baseUrl}/${locale}/buffet/${buffet.slug}`,
          lastModified: new Date(buffet.updatedAt || Date.now()),
          changeFrequency: "weekly",
          priority: 0.7,
        });
      }
      for (const place of places) {
        entries.push({
          url: `${baseUrl}/${locale}/tourist/${place.slug}`,
          lastModified: new Date(place.updatedAt || Date.now()),
          changeFrequency: "monthly",
          priority: 0.6,
        });
      }
    }
  } catch (error) {
    console.error("Sitemap fetch error:", error);
  }

  return entries;
}
