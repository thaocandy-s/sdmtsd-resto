import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@resto-hub/ui/styles/globals.css";
import { Providers } from "@/shared/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Admin | Resto Hub",
  description: "Restaurant Management System - Admin Dashboard",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>
        <Providers>
          <div className="min-h-screen bg-background text-foreground">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
