// Shared country rendering helpers for analytics (top-countries list + report export)

// Localized country name from an ISO code, falling back to the code itself
export function countryName(code: string): string {
  try {
    return new Intl.DisplayNames(["ja"], { type: "region" }).of(code) || code;
  } catch {
    return code;
  }
}

// Flag emoji from a 2-letter ISO country code (regional indicator symbols)
export function countryFlag(code: string): string {
  if (!/^[A-Z]{2}$/.test(code)) return "";
  return String.fromCodePoint(...[...code].map((c) => 0x1f1a5 + c.charCodeAt(0)));
}
