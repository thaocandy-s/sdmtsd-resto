import type { Metadata } from "next";
import { Noto_Sans, Noto_Sans_JP } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Header } from "@/shared/components/header";
import { Footer } from "@/shared/components/footer";

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

export const metadata: Metadata = {
  title: {
    default: "Resto Hub - Japanese Restaurant",
    template: "%s | Resto Hub",
  },
  description: "Experience authentic Japanese cuisine in an elegant, traditional atmosphere.",
};

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

  const messages = await getMessages();

  return (
    <html lang={locale} className="dark" suppressHydrationWarning>
      <body className={`${notoSans.variable} ${notoSansJP.variable} font-sans`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <div className="min-h-screen bg-background text-foreground">
            <Header />
            <div className="pt-16">{children}</div>
            <Footer />
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
