import type { Metadata } from "next";
import { Noto_Sans, Noto_Sans_JP } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Header } from "@/shared/components/header";
import { Footer } from "@/shared/components/footer";
import { MobileBottomNav } from "@/shared/components/mobile-bottom-nav";
import { TrackPageView } from "@/shared/components/TrackPageView";

const notoSans = Noto_Sans({
  subsets: ["latin"],
  variable: "--font-noto-sans",
  display: "swap",
});

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-jp",
  display: "swap",
  preload: false,
});

import { getRestaurant } from "@/lib/restaurant";

const baseUrl = process.env.NEXT_PUBLIC_WEB_URL || "https://restohub.com";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const restaurant = await getRestaurant();
  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: restaurant?.name || "Resto Hub - Japanese Restaurant",
      template: `%s | ${restaurant?.name || "Resto Hub"}`,
    },
    description:
      restaurant?.description ||
      "Experience authentic Japanese cuisine in an elegant, traditional atmosphere.",
    alternates: {
      canonical: `/${locale}`,
      languages: {
        en: "/en",
        ja: "/ja",
        "x-default": "/en",
      },
    },
    openGraph: {
      type: "website",
      siteName: restaurant?.name || "Resto Hub",
      locale: locale === "ja" ? "ja_JP" : "en_US",
      images: restaurant?.logoUrl ? [restaurant.logoUrl] : undefined,
    },
    icons: {
      icon: restaurant?.faviconUrl || "/favicon.ico",
      shortcut: restaurant?.faviconUrl || "/favicon.ico",
    },
  };
}

type Locale = "en" | "ja";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const [messages, restaurant] = await Promise.all([getMessages(), getRestaurant()]);

  const headerInfo = restaurant
    ? {
        phone: restaurant.phone,
        logoUrl: restaurant.logoUrl,
        logoSubtitle: restaurant.logoSubtitle,
        name: restaurant.name,
      }
    : undefined;

  const footerInfo = restaurant
    ? {
        logoUrl: restaurant.logoUrl,
        socialLinks: restaurant.socialLinks,
      }
    : undefined;

  // Restaurant structured data for search engines
  const restaurantJsonLd = restaurant
    ? {
        "@context": "https://schema.org",
        "@type": "Restaurant",
        name: restaurant.name,
        description: restaurant.description || undefined,
        url: baseUrl,
        telephone: restaurant.phone || undefined,
        email: restaurant.email || undefined,
        address: restaurant.address || undefined,
        image: restaurant.logoUrl || undefined,
        servesCuisine: "Japanese",
        geo:
          restaurant.latitude != null && restaurant.longitude != null
            ? {
                "@type": "GeoCoordinates",
                latitude: restaurant.latitude,
                longitude: restaurant.longitude,
              }
            : undefined,
      }
    : null;

  return (
    <html lang={locale} className="dark" suppressHydrationWarning>
      <body className={`${notoSans.variable} ${notoSansJP.variable} font-sans`}>
        {restaurantJsonLd && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantJsonLd) }}
          />
        )}
        <NextIntlClientProvider locale={locale} messages={messages}>
          <div className="min-h-screen bg-background text-foreground pb-16 lg:pb-0">
            <Header initialInfo={headerInfo} />
            <div className="pt-16">{children}</div>
            <Footer initialInfo={footerInfo} />
            <MobileBottomNav />
            <TrackPageView />
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
