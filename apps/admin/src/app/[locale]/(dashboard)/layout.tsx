"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/shared/hooks/use-auth-store";
import { api } from "@/lib/api-client";
import { AdminSidebar } from "@/shared/components/admin-sidebar";
import { AdminTopbar } from "@/shared/components/admin-topbar";
import { useTranslations, useLocale } from "next-intl";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("common");
  const { clearAuth } = useAuthStore();

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await api.post("/api/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      clearAuth();
      setShowLogoutConfirm(false);
      router.push(`/${locale}/login`);
      setLoggingOut(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={() => setShowLogoutConfirm(true)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopbar
          onMenuClick={() => setSidebarOpen(true)}
          onLogout={() => setShowLogoutConfirm(true)}
        />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">{children}</main>
      </div>

      {/* Custom Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-background-secondary border border-border rounded-lg p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-bold text-foreground mb-2">{t("confirmLogout")}</h3>
            <p className="text-sm text-foreground-secondary mb-6">{t("logoutMessage")}</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                disabled={loggingOut}
                className="px-4 py-2 border border-border hover:bg-background-tertiary text-foreground rounded-lg font-medium transition-colors text-sm"
              >
                {t("cancel")}
              </button>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-500/50 text-white rounded-lg font-medium transition-colors text-sm"
              >
                {loggingOut ? t("loggingOut") : t("logout")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
