import type { Metadata } from "next";
import { Noto_Sans, Noto_Sans_JP } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import "@resto-hub/ui/styles/globals.css";
import { Providers } from "@/shared/providers";

const notoSans = Noto_Sans({
  subsets: ["latin"],
  variable: "--font-noto-sans",
  display: "swap",
});

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  variable: "--font-noto-jp",
  display: "swap",
});

import { prisma } from "@/lib/prisma";

export async function generateMetadata(): Promise<Metadata> {
  const restaurant = await prisma.restaurant.findFirst();
  const getAssetUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("/") && !url.startsWith("/admin")) {
      const isProd = process.env.NODE_ENV === "production";
      return isProd ? `/admin${url}` : url;
    }
    return url;
  };

  const favicon = getAssetUrl(restaurant?.faviconUrl || "/favicon.ico");

  return {
    title: "Admin | " + (restaurant?.name || "Resto Hub"),
    description: "Restaurant Management System - Admin Dashboard",
    icons: {
      icon: favicon,
      shortcut: favicon,
    },
  };
}

type Locale = "en" | "ja";

export default async function AdminLocaleLayout({
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

  const messages = await getMessages();

  return (
    <html lang={locale} className="dark" suppressHydrationWarning>
      <body className={`${notoSans.variable} ${notoSansJP.variable} font-sans`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>
            <div className="min-h-screen bg-background text-foreground">{children}</div>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
