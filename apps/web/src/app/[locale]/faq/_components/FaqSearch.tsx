"use client";

import { useTranslations } from "next-intl";

interface FaqSearchProps {
  value: string;
  onChange: (val: string) => void;
}

export function FaqSearch({ value, onChange }: FaqSearchProps) {
  const t = useTranslations("faq");
  return (
    <div className="mb-8">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t("searchPlaceholder")}
        className="w-full h-12 rounded-md border border-border bg-background-secondary px-4 text-foreground placeholder:text-foreground-tertiary focus:outline-none focus:ring-2 focus:ring-gold-500"
      />
    </div>
  );
}
