export function formatPrice(price: number, currency = "JPY"): string {
  if (currency === "JPY") {
    const formatted = new Intl.NumberFormat("ja-JP", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
    return `${formatted}円`;
  }

  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency,
  }).format(price);
}

// Centralized consumption-tax configuration. The live rate is stored as a
// percent value in the Setting table (key: TAX_RATE_SETTING_KEY); these
// defaults are the fallback whenever the setting row is missing or invalid.
export const TAX_RATE_SETTING_KEY = "taxRate";
export const DEFAULT_TAX_RATE_PERCENT = 10;
export const DEFAULT_TAX_RATE = DEFAULT_TAX_RATE_PERCENT / 100;

// Converts a stored percent value (e.g. 10) into a fraction (0.1) for price
// math. Accepts unknown input because the setting is persisted as Json.
export function taxRateFromPercent(percent: unknown): number {
  const value = typeof percent === "string" ? Number(percent) : percent;
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > 100) {
    return DEFAULT_TAX_RATE;
  }
  return value / 100;
}

export function formatPriceWithTax(
  price: number,
  taxRate = DEFAULT_TAX_RATE,
  currency = "JPY"
): string {
  const taxIncluded = Math.round(price * (1 + taxRate));

  if (currency === "JPY") {
    const formattedBase = new Intl.NumberFormat("ja-JP", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);

    const formattedTaxIncluded = new Intl.NumberFormat("ja-JP", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(taxIncluded);

    return `${formattedBase}円 (${formattedTaxIncluded}円)`;
  }

  const formattedBase = new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);

  const formattedTaxIncluded = new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(taxIncluded);

  return `${formattedBase} (税込 ${formattedTaxIncluded})`;
}

export function formatDate(date: string | Date, locale = "ja-JP"): string {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date, locale = "ja-JP"): string {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(date);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}
