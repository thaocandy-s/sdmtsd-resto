"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UtensilsCrossed, Wine, Flame, Beer } from "lucide-react";

export function MobileBottomNav() {
  const t = useTranslations("common");
  const pathname = usePathname();

  const navItems = [
    { href: "/menu", label: t("menu"), icon: UtensilsCrossed },
    { href: "/drink", label: t("drink"), icon: Wine },
    { href: "/buffet", label: t("buffet"), icon: Flame },
    { href: "/beer-art", label: t("beerArt"), icon: Beer },
  ];

  return (
    <div className="lg:hidden fixed bottom-4 left-4 right-4 z-50">
      <nav className="bg-background-secondary/95 backdrop-blur-lg border border-border/80 rounded-full px-3 py-2 shadow-2xl shadow-black/50 flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.endsWith(item.href) || pathname.includes(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1.5 px-4 rounded-full text-xs font-medium transition-all duration-300 ${
                isActive
                  ? "text-gold-400 bg-gold-500/15 border border-gold-500/30 shadow-inner"
                  : "text-foreground-secondary hover:text-gold-400 hover:bg-background-tertiary/50"
              }`}
            >
              <Icon
                className={`w-4 h-4 mb-0.5 ${isActive ? "text-gold-400" : "text-foreground-tertiary"}`}
              />
              <span className="text-[11px] leading-tight">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
