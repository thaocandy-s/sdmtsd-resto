"use client";

import { type ReactNode } from "react";
import { Toaster } from "sonner";
import { QueryProvider } from "./query-provider";
import { AuthProvider } from "./auth-provider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>{children}</AuthProvider>
      {/* Single global toast outlet — all feedback goes through lib/toast.ts helpers */}
      <Toaster
        position="top-right"
        theme="dark"
        richColors
        closeButton
        duration={4000}
        toastOptions={{
          style: {
            background: "var(--color-background-secondary, #1a1a1a)",
            border: "1px solid var(--color-border, #333)",
          },
          classNames: {
            toast:
              "max-md:w-[min(72vw,280px)] max-md:min-w-0 max-md:px-2.5 max-md:py-2 max-md:text-xs",
            title: "max-md:text-xs",
            description: "max-md:text-[11px]",
            success: "max-md:!text-emerald-300",
            error: "max-md:!text-red-300",
            warning: "max-md:!text-amber-300",
            info: "max-md:!text-sky-300",
          },
        }}
      />
    </QueryProvider>
  );
}
