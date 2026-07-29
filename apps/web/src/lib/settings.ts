import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { TAX_RATE_SETTING_KEY, taxRateFromPercent } from "@resto-hub/utils";

// Deduped per-render lookup of the configured consumption tax rate.
// Returns a fraction (e.g. 0.1 for 10%) ready for formatPriceWithTax.
export const getTaxRate = cache(async () => {
  const setting = await prisma.setting.findUnique({
    where: { key: TAX_RATE_SETTING_KEY },
  });
  return taxRateFromPercent(setting?.value);
});
