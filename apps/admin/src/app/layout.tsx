import type { Metadata } from "next";
import { Noto_Sans, Noto_Sans_JP } from "next/font/google";
import "@resto-hub/ui/styles/globals.css";
import { Providers } from "@/shared/providers";
import { Analytics } from "@vercel/analytics/next";

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

export default async function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className="dark" suppressHydrationWarning>
      <body className={`${notoSans.variable} ${notoSansJP.variable} font-sans`}>
        <Providers>
          <div className="min-h-screen bg-background text-foreground">{children}</div>
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
