"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UtensilsCrossed, Wine, Flame, Beer, Home } from "lucide-react";

export function MobileBottomNav() {
  const t = useTranslations("common");
  const locale = useLocale();
  const pathname = usePathname();

  const navItems = [
    { href: "/menu", label: t("menu"), icon: UtensilsCrossed },
    { href: "/drink", label: t("drink"), icon: Wine },
    { href: "/", label: t("home"), icon: Home, isCenter: true },
    { href: "/buffet", label: t("buffet"), icon: Flame },
    { href: "/beer-art", label: t("beerArt"), icon: Beer },
  ];

  return (
    <div className="lg:hidden fixed bottom-4 left-4 right-4 z-50">
      <nav className="bg-background-secondary/95 backdrop-blur-lg border border-border/80 rounded-full px-3 py-2 shadow-2xl shadow-black/50 flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/"
              ? pathname === `/${locale}` || pathname === `/${locale}/` || pathname === "/"
              : pathname.endsWith(item.href) || pathname.includes(`${item.href}/`);

          if (item.isCenter) {
            return (
              <Link
                key={item.href}
                href={item.href === "/" ? `/${locale}` : `/${locale}${item.href}`}
                className={`relative -translate-y-5 flex flex-col items-center justify-center w-14 h-14 rounded-full border shadow-lg transition-all duration-300 ${
                  isActive
                    ? "bg-gold-500 text-background border-gold-500 shadow-gold-500/30 scale-110"
                    : "bg-background-secondary text-foreground border-border hover:border-gold-500 hover:text-gold-400"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[9px] font-bold mt-0.5 whitespace-nowrap">{item.label}</span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={`/${locale}${item.href}`}
              className={`flex flex-col items-center justify-center py-1.5 px-2 sm:px-3.5 rounded-full text-xs font-medium transition-all duration-300 ${
                isActive
                  ? "text-gold-400 bg-gold-500/15 border border-gold-500/30 shadow-inner"
                  : "text-foreground-secondary hover:text-gold-400 hover:bg-background-tertiary/50"
              }`}
            >
              <Icon
                className={`w-4 h-4 mb-0.5 ${isActive ? "text-gold-400" : "text-foreground-tertiary"}`}
              />
              <span className="text-[10px] sm:text-[11px] leading-tight whitespace-nowrap">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
