// Client-safe ordering types shared between the server ordering service
// (lib/ordering.ts) and client code (reorder hook, forms). This file must
// not import the Prisma client so it can be bundled for the browser.

export type OrderableModule =
  | "banner"
  | "event"
  | "food"
  | "food-category"
  | "drink"
  | "drink-category"
  | "buffet"
  | "beer-art"
  | "media-coverage"
  | "media-outlet"
  | "katanuki-rule"
  | "katanuki-winner"
  | "tour-place"
  | "tour-category"
  | "faq"
  | "faq-category";
