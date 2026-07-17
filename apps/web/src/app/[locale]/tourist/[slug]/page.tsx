"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface TourPlace {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  websiteUrl: string | null;
  phone: string | null;
  imageUrl: string | null;
  images: string[];
  openingHours: string | null;
  category: {
    id: string;
    name: string;
    slug: string;
  };
}

export default function TouristDetailPage() {
  const t = useTranslations("tourist");
  const params = useParams();
  const slug = params.slug as string;
  const [place, setPlace] = useState<TourPlace | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      fetch(`/api/tourist/${slug}`)
        .then((r) => r.json())
        .then((data) => setPlace(data.data))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [slug]);

  if (loading) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-background-secondary rounded w-1/3" />
          <div className="h-64 bg-background-secondary rounded-lg" />
          <div className="h-4 bg-background-secondary rounded w-2/3" />
          <div className="h-4 bg-background-secondary rounded" />
          <div className="h-4 bg-background-secondary rounded" />
        </div>
      </main>
    );
  }

  if (!place) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">Place not found</h1>
        <Link href="/tourist" className="text-gold-400 hover:text-gold-300">
          &larr; Back to Tourist Guide
        </Link>
      </main>
    );
  }

  const allImages = [place.imageUrl, ...place.images].filter(Boolean) as string[];

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-foreground-secondary mb-6">
        <Link href="/tourist" className="hover:text-gold-400 transition-colors">
          {t("title")}
        </Link>
        <span>/</span>
        <span className="text-foreground">{place.name}</span>
      </nav>

      {/* Header */}
      <div className="mb-6">
        <span className="inline-block px-3 py-1 bg-gold-500/10 text-gold-400 rounded-full text-sm mb-3">
          {place.category.name}
        </span>
        <h1 className="text-4xl font-jp font-bold text-gold-400 mb-2">{place.name}</h1>
      </div>

      {/* Main Image */}
      {place.imageUrl && (
        <div className="mb-6">
          <button
            onClick={() => setSelectedImage(place.imageUrl)}
            className="w-full h-64 md:h-96 rounded-lg overflow-hidden hover:opacity-90 transition-opacity"
          >
            <img src={place.imageUrl} alt={place.name} className="w-full h-full object-cover" />
          </button>
        </div>
      )}

      {/* Additional Images */}
      {place.images.length > 0 && (
        <div className="grid grid-cols-4 gap-2 mb-6">
          {place.images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedImage(img)}
              className="aspect-square rounded-lg overflow-hidden hover:opacity-80 transition-opacity"
            >
              <img
                src={img}
                alt={`${place.name} ${idx + 2}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Description */}
      {place.description && (
        <section className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-3">About</h2>
          <p className="text-foreground-secondary leading-relaxed">{place.description}</p>
        </section>
      )}

      {/* Info Card */}
      <section className="bg-background-secondary border border-border rounded-lg p-6 mb-8">
        <h2 className="text-xl font-bold text-foreground mb-4">Information</h2>
        <dl className="space-y-3">
          {place.address && (
            <div className="flex gap-3">
              <dt className="text-foreground-secondary w-24 flex-shrink-0">Address</dt>
              <dd className="text-foreground">{place.address}</dd>
            </div>
          )}
          {place.openingHours && (
            <div className="flex gap-3">
              <dt className="text-foreground-secondary w-24 flex-shrink-0">Hours</dt>
              <dd className="text-foreground">{place.openingHours}</dd>
            </div>
          )}
          {place.phone && (
            <div className="flex gap-3">
              <dt className="text-foreground-secondary w-24 flex-shrink-0">Phone</dt>
              <dd className="text-foreground">
                <a href={`tel:${place.phone}`} className="text-gold-400 hover:text-gold-300">
                  {place.phone}
                </a>
              </dd>
            </div>
          )}
          {place.websiteUrl && (
            <div className="flex gap-3">
              <dt className="text-foreground-secondary w-24 flex-shrink-0">Website</dt>
              <dd className="text-foreground">
                <a
                  href={place.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gold-400 hover:text-gold-300"
                >
                  Visit Website &rarr;
                </a>
              </dd>
            </div>
          )}
        </dl>
      </section>

      {/* Google Map */}
      {place.latitude && place.longitude && (
        <section className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-3">Location</h2>
          <div className="aspect-video rounded-lg overflow-hidden bg-background-tertiary">
            <iframe
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}&q=${place.latitude},${place.longitude}&zoom=15`}
            />
          </div>
        </section>
      )}

      {/* Back Link */}
      <div className="text-center">
        <Link
          href="/tourist"
          className="inline-block text-gold-400 hover:text-gold-300 font-medium"
        >
          &larr; Back to Tourist Guide
        </Link>
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="max-w-4xl max-h-[90vh] relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-gold-400 text-2xl"
            >
              &times;
            </button>
            <img
              src={selectedImage}
              alt={place.name}
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </main>
  );
}
