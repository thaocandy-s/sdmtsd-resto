"use client";

import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      className="toaster group"
      theme="dark"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background-secondary group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-foreground-secondary",
          actionButton:
            "group-[.toast]:bg-gold-500 group-[.toast]:text-background",
          cancelButton:
            "group-[.toast]:bg-background-tertiary group-[.toast]:text-foreground-secondary",
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
