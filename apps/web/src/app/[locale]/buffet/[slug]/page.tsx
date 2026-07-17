"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface BuffetCourse {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  duration: number;
  minPeople: number | null;
  maxPeople: number | null;
  includes: string[];
  imageUrl: string | null;
  images: string[];
  isPopular: boolean;
}

export default function BuffetDetailPage() {
  const t = useTranslations("buffet");
  const params = useParams();
  const slug = params.slug as string;
  const [course, setCourse] = useState<BuffetCourse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetch(`/api/buffet/${slug}`)
        .then((r) => r.json())
        .then((data) => setCourse(data.data))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [slug]);

  const formatPrice = (price: number) => `¥${price.toLocaleString()}`;

  if (loading) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="animate-pulse">
          <div className="h-96 bg-background-secondary rounded-lg mb-8" />
          <div className="h-8 bg-background-secondary rounded w-1/3 mb-4" />
          <div className="h-4 bg-background-secondary rounded w-2/3" />
        </div>
      </main>
    );
  }

  if (!course) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">Buffet course not found</h1>
        <Link href="/buffet" className="text-gold-400 hover:text-gold-300">
          Back to buffet
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <Link
        href="/buffet"
        className="inline-flex items-center text-gold-400 hover:text-gold-300 mb-6"
      >
        &larr; Back to buffet
      </Link>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="aspect-square bg-background-secondary rounded-lg overflow-hidden">
          {course.imageUrl ? (
            <img src={course.imageUrl} alt={course.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-foreground-tertiary">
              No image available
            </div>
          )}
        </div>

        <div>
          {course.isPopular && (
            <span className="inline-block px-2 py-1 bg-red-500/10 text-red-400 text-xs rounded mb-2">
              Popular
            </span>
          )}

          <h1 className="text-3xl font-jp font-bold text-foreground mb-4">{course.name}</h1>

          {course.description && (
            <p className="text-foreground-secondary mb-6">{course.description}</p>
          )}

          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-2xl font-bold text-gold-400">{formatPrice(course.price)}</span>
            <span className="text-foreground-secondary">/ person</span>
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-3 p-3 bg-background-tertiary rounded-lg">
              <span className="text-foreground-secondary">Duration:</span>
              <span className="font-medium">{course.duration} minutes</span>
            </div>
            {(course.minPeople || course.maxPeople) && (
              <div className="flex items-center gap-3 p-3 bg-background-tertiary rounded-lg">
                <span className="text-foreground-secondary">Group size:</span>
                <span className="font-medium">
                  {course.minPeople && course.maxPeople
                    ? `${course.minPeople}-${course.maxPeople} people`
                    : course.minPeople
                      ? `Min ${course.minPeople} people`
                      : `Max ${course.maxPeople} people`}
                </span>
              </div>
            )}
          </div>

          {course.includes.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">Includes</h3>
              <ul className="space-y-2">
                {course.includes.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-foreground-secondary">
                    <span className="w-1.5 h-1.5 bg-gold-400 rounded-full" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Link
            href="/reservation"
            className="inline-block mt-8 bg-gold-500 hover:bg-gold-600 text-background font-semibold px-6 py-3 rounded-md transition-colors"
          >
            Reserve Now
          </Link>
        </div>
      </div>
    </main>
  );
}
