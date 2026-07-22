"use client";

import { useAuthStore } from "@/shared/hooks/use-auth-store";
import { Bell, User, LogOut, Menu, Globe } from "lucide-react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

interface AdminTopbarProps {
  onMenuClick: () => void;
  onLogout: () => void;
}

export function AdminTopbar({ onMenuClick, onLogout }: AdminTopbarProps) {
  const { user } = useAuthStore();
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const toggleLanguage = () => {
    const nextLocale = locale === "ja" ? "en" : "ja";
    // Replace locale in current path
    const newPath = pathname.replace(`/${locale}`, `/${nextLocale}`);
    router.push(newPath);
  };

  return (
    <header className="h-16 border-b border-border bg-background-secondary flex items-center justify-between px-4 md:px-6">
      <button
        onClick={onMenuClick}
        className="p-2 -ml-2 rounded-md hover:bg-background-tertiary text-foreground-secondary lg:hidden"
        title="Open Sidebar"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="flex items-center gap-4 ml-auto">
        {/* Simple Language Toggle (JA / EN) */}
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold border border-border bg-background hover:bg-background-tertiary text-foreground transition-colors"
          title="Switch Language"
        >
          <Globe className="w-3.5 h-3.5 text-gold-400" />
          <span>{locale === "ja" ? "日本語 (JA)" : "English (EN)"}</span>
        </button>

        {/* <button className="relative p-2 rounded-md hover:bg-background-tertiary transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-gold-500 rounded-full" />
        </button> */}

        <Link
          href={`/${locale}/settings`}
          className="flex items-center gap-3 hover:bg-background-tertiary px-2 py-1.5 rounded-md transition-colors cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full bg-gold-500/20 flex items-center justify-center">
            <User className="w-4 h-4 text-gold-400" />
          </div>
          <div className="hidden md:block text-left">
            <p className="text-sm font-medium text-foreground">
              {user?.username || `${user?.firstName} ${user?.lastName}`}
            </p>
            <p className="text-xs text-foreground-secondary">{user?.roleLabel}</p>
          </div>
        </Link>

        <button
          onClick={onLogout}
          className="p-2 rounded-md hover:bg-background-tertiary transition-colors text-foreground-secondary hover:text-foreground"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
