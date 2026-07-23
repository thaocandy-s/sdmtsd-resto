import { useAuthStore } from "@/shared/hooks/use-auth-store";

export function getApiUrl(endpoint: string): string {
  if (!endpoint.startsWith("/")) {
    return endpoint;
  }
  const isProd = process.env.NODE_ENV === "production";
  if (isProd && !endpoint.startsWith("/admin")) {
    return `/admin${endpoint}`;
  }
  return endpoint;
}

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const response = await fetch(getApiUrl("/api/auth/refresh"), {
        method: "POST",
        credentials: "include",
      });

      const isLoginPage =
        typeof window !== "undefined" &&
        (window.location.pathname === "/login" || window.location.pathname.endsWith("/login"));

      if (!response.ok) {
        useAuthStore.getState().clearAuth();
        if (typeof window !== "undefined" && !isLoginPage) {
          const localeMatch = window.location.pathname.match(/^\/(ja|en)/);
          const locale = localeMatch ? localeMatch[1] : "en";
          window.location.href = `/${locale}/login`;
        }
        return null;
      }

      const data = await response.json();
      const newToken = data.data.accessToken;
      useAuthStore.getState().setAccessToken(newToken);
      return newToken;
    } catch {
      useAuthStore.getState().clearAuth();
      const isLoginPage =
        typeof window !== "undefined" &&
        (window.location.pathname === "/login" || window.location.pathname.endsWith("/login"));
      if (typeof window !== "undefined" && !isLoginPage) {
        const localeMatch = window.location.pathname.match(/^\/(ja|en)/);
        const locale = localeMatch ? localeMatch[1] : "en";
        window.location.href = `/${locale}/login`;
      }
      return null;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

interface ApiClientOptions extends RequestInit {
  skipAuth?: boolean;
}

export async function apiClient<T = unknown>(
  endpoint: string,
  options: ApiClientOptions = {}
): Promise<T> {
  const { skipAuth = false, ...fetchOptions } = options;
  const headers = new Headers(fetchOptions.headers || {});

  if (!skipAuth) {
    let token = useAuthStore.getState().accessToken;

    if (!token) {
      token = await refreshAccessToken();
      if (!token) {
        throw new Error("Unauthorized");
      }
    }

    headers.set("Authorization", `Bearer ${token}`);
  }

  if (fetchOptions.body && typeof fetchOptions.body === "string" && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(getApiUrl(endpoint), {
    ...fetchOptions,
    headers,
    credentials: "include",
  });

  if (response.status === 401 && !skipAuth) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers.set("Authorization", `Bearer ${newToken}`);
      const retryResponse = await fetch(getApiUrl(endpoint), {
        ...fetchOptions,
        headers,
        credentials: "include",
      });

      if (!retryResponse.ok) {
        const error = await retryResponse.json().catch(() => ({}));
        throw new Error(error.message || `HTTP ${retryResponse.status}`);
      }

      return retryResponse.json();
    }
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

export const api = {
  get: <T = unknown>(endpoint: string, options?: ApiClientOptions) =>
    apiClient<T>(endpoint, { ...options, method: "GET" }),

  post: <T = unknown>(endpoint: string, body?: unknown, options?: ApiClientOptions) =>
    apiClient<T>(endpoint, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T = unknown>(endpoint: string, body?: unknown, options?: ApiClientOptions) =>
    apiClient<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T = unknown>(endpoint: string, options?: ApiClientOptions) =>
    apiClient<T>(endpoint, { ...options, method: "DELETE" }),

  patch: <T = unknown>(endpoint: string, body?: unknown, options?: ApiClientOptions) =>
    apiClient<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    }),
};
