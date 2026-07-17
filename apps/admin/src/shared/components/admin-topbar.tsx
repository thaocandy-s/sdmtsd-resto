"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/shared/hooks/use-auth-store";
import { api } from "@/lib/api-client";
import { Bell, User, LogOut } from "lucide-react";

export function AdminTopbar() {
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();

  const handleLogout = async () => {
    try {
      await api.post("/api/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      clearAuth();
      router.push("/login");
    }
  };

  return (
    <header className="h-16 border-b border-border bg-background-secondary flex items-center justify-between px-6">
      <div />
      <div className="flex items-center gap-4">
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
          onClick={handleLogout}
          className="p-2 rounded-md hover:bg-background-tertiary transition-colors text-foreground-secondary hover:text-foreground"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
