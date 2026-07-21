"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
} from "lucide-react";
import { cn } from "@resto-hub/ui";

const navItems = [
  { href: "/home-management", label: "Home Management", icon: Home },
  { href: "/food-menu", label: "Food Menu", icon: UtensilsCrossed },
  { href: "/drink-menu", label: "Drink Menu", icon: GlassWater },
  { href: "/buffet-menu", label: "Buffet Menu", icon: ChefHat },
  { href: "/beer-art", label: "Beer Art", icon: Palette },
  { href: "/tourist-guide", label: "Tourist Guide", icon: MapPin },
  { href: "/challenge", label: "Challenge", icon: Trophy },
  { href: "/faq", label: "FAQ", icon: HelpCircle },
  { href: "/restaurant-info", label: "Restaurant Info", icon: Info },
  { href: "/reservations", label: "Reservations", icon: CalendarCheck },
  { href: "/contact", label: "Contact Messages", icon: Mail },
  { href: "/media-library", label: "Media Library", icon: FolderOpen },
];

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export function AdminSidebar({ isOpen, onClose, onLogout }: AdminSidebarProps) {
  const pathname = usePathname();

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
          <Link href="/" onClick={onClose}>
            <h1 className="text-xl font-bold text-gold-400">Admin CMS</h1>
            <p className="text-xs text-foreground-tertiary">Resto Hub</p>
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
            const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                  isActive
                    ? "bg-gold-500/10 text-gold-400 font-medium"
                    : "text-foreground-secondary hover:bg-background-tertiary hover:text-gold-400"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{item.label}</span>
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
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
