"use client";

import { useEffect, useCallback, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/shared/hooks/use-auth-store";
import { apiClient } from "@/lib/api-client";

interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  roleLabel: string;
  permissions: { module: string; action: string }[];
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { setAuth, clearAuth, setLoading, isAuthenticated } = useAuthStore();

  const initAuth = useCallback(async () => {
    try {
      const response = await apiClient<{ data: AuthUser }>("/api/auth/me");
      setAuth(response.data, "");
    } catch {
      clearAuth();
    } finally {
      setLoading(false);
    }
  }, [setAuth, clearAuth, setLoading]);

  useEffect(() => {
    // Skip auth bootstrap on the login page to avoid refresh -> redirect loop
    const isLoginPage = pathname === "/login" || pathname.endsWith("/login");
    if (isLoginPage) {
      setLoading(false);
      return;
    }
    if (!isAuthenticated) {
      initAuth();
    }
  }, [initAuth, isAuthenticated, pathname, setLoading]);

  return <>{children}</>;
}
