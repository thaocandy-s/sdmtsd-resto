"use client";

import { useTranslations } from "next-intl";

interface TaxRateSectionProps {
  taxRate: string;
  onChangeTaxRate: (value: string) => void;
  disabled: boolean;
}

export function TaxRateSection({ taxRate, onChangeTaxRate, disabled }: TaxRateSectionProps) {
  const t = useTranslations("restaurantInfo");

  return (
    <div className="space-y-4 pt-4 border-t border-border">
      <h3 className="text-lg font-semibold text-foreground">{t("pricingTitle")}</h3>
      <div>
        <label className="block text-sm text-foreground-secondary mb-1">{t("taxRateLabel")}</label>
        <input
          type="number"
          min={0}
          max={100}
          step={0.1}
          value={taxRate}
          onChange={(e) => onChangeTaxRate(e.target.value)}
          disabled={disabled}
          className="w-full md:w-48 bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500 disabled:opacity-50"
        />
        <p className="text-xs text-foreground-tertiary mt-1">{t("taxRateHint")}</p>
      </div>
    </div>
  );
}
