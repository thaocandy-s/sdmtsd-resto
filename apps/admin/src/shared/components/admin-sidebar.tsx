"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Calendar,
  UtensilsCrossed,
  GlassWater,
  ChefHat,
  Palette,
  MapPin,
  Trophy,
  HelpCircle,
  Info,
  CalendarCheck,
  Image,
  FolderOpen,
  Search,
  BarChart3,
  Settings,
  Users,
  Shield,
  LogOut,
  ScrollText,
  Layers,
} from "lucide-react";
import { cn } from "@resto-hub/ui";

const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/home-management", label: "Home Management", icon: Home },
  { href: "/events", label: "Events", icon: Calendar },
  { href: "/food-menu", label: "Food Menu", icon: UtensilsCrossed },
  { href: "/drink-menu", label: "Drink Menu", icon: GlassWater },
  { href: "/buffet-menu", label: "Buffet Menu", icon: ChefHat },
  { href: "/beer-art", label: "Beer Art", icon: Palette },
  { href: "/tourist-guide", label: "Tourist Guide", icon: MapPin },
  { href: "/challenge", label: "Challenge", icon: Trophy },
  { href: "/faq", label: "FAQ", icon: HelpCircle },
  { href: "/restaurant-info", label: "Restaurant Info", icon: Info },
  { href: "/reservations", label: "Reservations", icon: CalendarCheck },
  { href: "/banners", label: "Banners", icon: Image },
  { href: "/media-library", label: "Media Library", icon: FolderOpen },
  { href: "/seo", label: "SEO", icon: Search },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/audit-log", label: "Audit Log", icon: ScrollText },
  { href: "/bulk-actions", label: "Bulk Actions", icon: Layers },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/users", label: "Users", icon: Users },
  { href: "/roles", label: "Roles", icon: Shield },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-background-secondary border-r border-border flex flex-col min-h-screen">
      {/* Logo */}
      <div className="p-4 border-b border-border">
        <Link href="/">
          <h1 className="text-xl font-bold text-gold-400">Admin CMS</h1>
          <p className="text-xs text-foreground-tertiary">Resto Hub</p>
        </Link>
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
        <button className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-foreground-secondary hover:bg-background-tertiary hover:text-red-400 transition-colors w-full">
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
