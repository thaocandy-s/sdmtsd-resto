"use client";

import { useAuthStore } from "@/shared/hooks/use-auth-store";
import { Bell, User, LogOut, Menu } from "lucide-react";

interface AdminTopbarProps {
  onMenuClick: () => void;
  onLogout: () => void;
}

export function AdminTopbar({ onMenuClick, onLogout }: AdminTopbarProps) {
  const { user } = useAuthStore();

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
        <button className="relative p-2 rounded-md hover:bg-background-tertiary transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-gold-500 rounded-full" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gold-500/20 flex items-center justify-center">
            <User className="w-4 h-4 text-gold-400" />
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-foreground-secondary">{user?.roleLabel}</p>
          </div>
        </div>

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
