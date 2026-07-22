"use client";

import { create } from "zustand";

interface AuthUser {
  id: string;
  email: string;
  username?: string | null;
  firstName: string;
  lastName: string;
  role: string;
  roleLabel: string;
  permissions: { module: string; action: string }[];
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: AuthUser, accessToken: string) => void;
  setAccessToken: (token: string) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
  hasPermission: (module: string, action: string) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: (user, accessToken) =>
    set({
      user,
      accessToken,
      isAuthenticated: true,
      isLoading: false,
    }),

  setAccessToken: (token) =>
    set({
      accessToken: token,
    }),

  clearAuth: () =>
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
    }),

  setLoading: (loading) => set({ isLoading: loading }),

  hasPermission: (module, action) => {
    const { user } = get();
    if (!user) return false;
    if (user.role === "ADMIN") return true;
    return user.permissions.some((p) => p.module === module && p.action === action);
  },
}));
