import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth";
import { taxRateSchema } from "@/lib/validation";
import { TAX_RATE_SETTING_KEY, DEFAULT_TAX_RATE_PERCENT } from "@resto-hub/utils";

// GET /api/settings/tax-rate - Read the configured tax rate (percent).
// Auth-only (no module gate): every admin role renders tax-included prices,
// while updates stay behind settings:update below.
export const GET = withAuth(async () => {
  try {
    const setting = await prisma.setting.findUnique({ where: { key: TAX_RATE_SETTING_KEY } });
    const taxRate = typeof setting?.value === "number" ? setting.value : DEFAULT_TAX_RATE_PERCENT;
    return NextResponse.json({ data: { taxRate } });
  } catch (error) {
    console.error("Get tax rate error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
});

// PUT /api/settings/tax-rate - Update the tax rate (percent)
export const PUT = withAuth(
  async (request: NextRequest) => {
    try {
      const body = await request.json();
      const parsed = taxRateSchema.safeParse(body);

      if (!parsed.success) {
        return NextResponse.json(
          { message: "Invalid input", errors: parsed.error.flatten().fieldErrors },
          { status: 400 }
        );
      }

      const setting = await prisma.setting.upsert({
        where: { key: TAX_RATE_SETTING_KEY },
        update: { value: parsed.data.taxRate },
        create: { key: TAX_RATE_SETTING_KEY, value: parsed.data.taxRate, group: "general" },
      });
      return NextResponse.json({ data: { taxRate: setting.value } });
    } catch (error) {
      console.error("Update tax rate error:", error);
      return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
  },
  { module: "settings", action: "update" }
);
