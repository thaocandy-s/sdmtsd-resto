"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import {
  Home,
  UtensilsCrossed,
  GlassWater,
  ChefHat,
  Palette,
  MapPin,
  Trophy,
  HelpCircle,
  Info,
  CalendarCheck,
  FolderOpen,
  LogOut,
  Mail,
  X,
  Settings,
} from "lucide-react";
import { cn } from "@resto-hub/ui";
import { getApiUrl } from "@/lib/api-client";

const navItems = [
  { href: "/home-management", key: "homeManagement", icon: Home },
  { href: "/food-menu", key: "foodMenu", icon: UtensilsCrossed },
  { href: "/drink-menu", key: "drinkMenu", icon: GlassWater },
  { href: "/buffet-menu", key: "buffetMenu", icon: ChefHat },
  { href: "/beer-art", key: "beerArt", icon: Palette },
  { href: "/tourist-guide", key: "touristGuide", icon: MapPin },
  { href: "/challenge", key: "challenge", icon: Trophy },
  { href: "/faq", key: "faq", icon: HelpCircle },
  { href: "/restaurant-info", key: "restaurantInfo", icon: Info },
  // { href: "/reservations", key: "reservations", icon: CalendarCheck },
  { href: "/contact", key: "contactMessages", icon: Mail },
  // { href: "/media-library", key: "mediaLibrary", icon: FolderOpen },
  { href: "/settings", key: "settings", icon: Settings },
];

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export function AdminSidebar({ isOpen, onClose, onLogout }: AdminSidebarProps) {
  const pathname = usePathname();
  const locale = useLocale();
  const tSidebar = useTranslations("sidebar");
  const tCommon = useTranslations("common");
  const [logoUrl, setLogoUrl] = useState<string>("/images/logo.png");

  useEffect(() => {
    fetch(getApiUrl("/api/info"))
      .then((res) => res.json())
      .then((data) => {
        if (data?.data?.logoUrl) {
          setLogoUrl(data.data.logoUrl);
        }
      })
      .catch(console.error);
  }, []);

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose} />}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-background-secondary border-r border-border flex flex-col min-h-screen transition-transform duration-200 lg:static lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo and close button */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <Link href={`/${locale}`} onClick={onClose} className="flex items-center gap-2">
            <img src={logoUrl} alt="Logo" className="h-9 w-auto object-contain" />
            <div className="flex flex-col">
              <h1 className="text-sm font-bold text-gold-400 leading-tight">Admin CMS</h1>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-background-tertiary text-foreground-secondary lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 overflow-y-auto space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const fullHref = `/${locale}${item.href}`;
            const isActive = pathname.startsWith(fullHref);

            return (
              <Link
                key={item.href}
                href={fullHref}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                  isActive
                    ? "bg-gold-500/10 text-gold-400 font-medium"
                    : "text-foreground-secondary hover:bg-background-tertiary hover:text-gold-400"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{tSidebar(item.key)}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-border">
          <button
            onClick={onLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-foreground-secondary hover:bg-background-tertiary hover:text-red-400 transition-colors w-full"
          >
            <LogOut className="h-4 w-4" />
            <span>{tCommon("logout")}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
