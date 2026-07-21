import type { Metadata } from "next";
import { Noto_Sans, Noto_Sans_JP } from "next/font/google";
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

export const metadata: Metadata = {
  title: "Admin | Resto Hub",
  description: "Restaurant Management System - Admin Dashboard",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${notoSans.variable} ${notoSansJP.variable} font-sans`}>
        <Providers>
          <div className="min-h-screen bg-background text-foreground">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
