export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}

export function restaurantJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: "Resto Hub",
    description: "A modern Japanese restaurant experience",
    url: process.env.NEXT_PUBLIC_WEB_URL || "https://restohub.com",
    servesCuisine: ["Japanese", "Asian Fusion"],
    priceRange: "$$",
    acceptsReservations: "True",
    image: `${process.env.NEXT_PUBLIC_WEB_URL || "https://restohub.com"}/og-image.jpg`,
  };
}

export function menuJsonLd(
  items: { name: string; description?: string; price: number; imageUrl?: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "Menu",
    name: "Resto Hub Menu",
    hasMenuSection: [
      {
        "@type": "MenuSection",
        name: "Menu Items",
        hasMenuItem: items.map((item) => ({
          "@type": "MenuItem",
          name: item.name,
          description: item.description || "",
          offers: { "@type": "Offer", price: item.price, priceCurrency: "JPY" },
          image: item.imageUrl || undefined,
        })),
      },
    ],
  };
}

export function faqJsonLd(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function touristPlaceJsonLd(place: {
  name: string;
  description?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  imageUrl?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    name: place.name,
    description: place.description || "",
    address: place.address ? { "@type": "PostalAddress", streetAddress: place.address } : undefined,
    geo:
      place.latitude && place.longitude
        ? { "@type": "GeoCoordinates", latitude: place.latitude, longitude: place.longitude }
        : undefined,
    image: place.imageUrl || undefined,
  };
}
