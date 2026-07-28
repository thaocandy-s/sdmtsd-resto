"use client";

import { type ReactNode } from "react";
import { Toaster } from "sonner";
import { QueryProvider } from "./query-provider";
import { AuthProvider } from "./auth-provider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>{children}</AuthProvider>
      <Toaster
        position="bottom-right"
        theme="dark"
        richColors
        closeButton
        toastOptions={{
          style: {
            background: "var(--color-background-secondary, #1a1a1a)",
            border: "1px solid var(--color-border, #333)",
            color: "var(--color-foreground, #fff)",
          },
        }}
      />
    </QueryProvider>
  );
}
