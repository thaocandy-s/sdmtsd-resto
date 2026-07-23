import type { Metadata } from "next";
import { Noto_Sans, Noto_Sans_JP } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
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

import { prisma } from "@/lib/prisma";

export async function generateMetadata(): Promise<Metadata> {
  const restaurant = await prisma.restaurant.findFirst({
    where: { isActive: true },
  });
  return {
    title: {
      default: restaurant?.name || "Resto Hub - Japanese Restaurant",
      template: `%s | ${restaurant?.name || "Resto Hub"}`,
    },
    description:
      restaurant?.description ||
      "Experience authentic Japanese cuisine in an elegant, traditional atmosphere.",
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

  const [messages, restaurant] = await Promise.all([
    getMessages(),
    prisma.restaurant.findFirst({ where: { isActive: true } }),
  ]);

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

  return (
    <html lang={locale} className="dark" suppressHydrationWarning>
      <body className={`${notoSans.variable} ${notoSansJP.variable} font-sans`}>
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
