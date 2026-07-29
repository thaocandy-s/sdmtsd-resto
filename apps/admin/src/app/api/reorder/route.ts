import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withAuth, authorize } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  ORDERABLE_MODELS,
  OrderableModule,
  OrderingConflictError,
  reorderItems,
} from "@/lib/ordering";

// Shared drag & drop reorder endpoint used by every ordered admin module.
// GET returns the COMPLETE ordered dataset of one scope for Reorder Mode;
// POST receives the complete new order of one scope (whole list, or one
// category for category-scoped modules) and persists it atomically.

// Which fields represent each module's row in the Reorder Mode list.
const DISPLAY_FIELDS: Record<OrderableModule, { label: string; image?: string }> = {
  banner: { label: "title", image: "imageUrl" },
  event: { label: "title", image: "imageUrl" },
  food: { label: "name", image: "imageUrl" },
  "food-category": { label: "name" },
  drink: { label: "name", image: "imageUrl" },
  "drink-category": { label: "name" },
  buffet: { label: "name", image: "imageUrl" },
  "beer-art": { label: "title", image: "imageUrl" },
  "katanuki-rule": { label: "title" },
  "katanuki-winner": { label: "participantName", image: "imageUrl" },
  "tour-place": { label: "name", image: "imageUrl" },
  "tour-category": { label: "name" },
  faq: { label: "question" },
  "faq-category": { label: "name" },
};

const listQuerySchema = z.object({
  module: z.enum(Object.keys(ORDERABLE_MODELS) as [OrderableModule, ...OrderableModule[]]),
  scopeValue: z.string().min(1).nullish(),
});

export const GET = withAuth(async (request: NextRequest, { user }) => {
  try {
    const parsed = listQuerySchema.safeParse({
      module: request.nextUrl.searchParams.get("module"),
      scopeValue: request.nextUrl.searchParams.get("scopeValue"),
    });
    if (!parsed.success) {
      return NextResponse.json({ message: "Invalid reorder query" }, { status: 400 });
    }

    const { module, scopeValue } = parsed.data;
    const config = ORDERABLE_MODELS[module];

    if (!authorize(user, config.permissionModule, "update")) {
      return NextResponse.json({ message: "Forbidden: insufficient permissions" }, { status: 403 });
    }

    if (config.scopeField && !scopeValue) {
      return NextResponse.json(
        { message: `scopeValue (${config.scopeField}) is required for module ${module}` },
        { status: 400 }
      );
    }

    const display = DISPLAY_FIELDS[module];
    const where: Record<string, unknown> = {};
    if (config.scopeField && scopeValue) where[config.scopeField] = scopeValue;
    if (config.softDelete) where.deletedAt = null;

    const select: Record<string, boolean> = { id: true, sortOrder: true, [display.label]: true };
    if (display.image) select[display.image] = true;

    const delegate = (
      prisma as unknown as Record<
        string,
        { findMany(args: unknown): Promise<Array<Record<string, unknown>>> }
      >
    )[config.delegate];
    const rows = await delegate.findMany({
      where,
      select,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }, { id: "asc" }],
      take: 500,
    });

    const items = rows.map((row) => ({
      id: row.id as string,
      label: (row[display.label] as string) ?? "",
      imageUrl: display.image ? ((row[display.image] as string | null) ?? null) : null,
      sortOrder: row.sortOrder as number,
    }));

    return NextResponse.json({ data: { items } });
  } catch (error) {
    console.error("Reorder list error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
});

const reorderSchema = z.object({
  module: z.enum(Object.keys(ORDERABLE_MODELS) as [OrderableModule, ...OrderableModule[]]),
  orderedIds: z.array(z.string().min(1)).min(1).max(500),
  // Scope (categoryId) for category-scoped modules; omit for flat lists.
  scopeValue: z.string().min(1).nullish(),
});

export const POST = withAuth(async (request: NextRequest, { user }) => {
  try {
    const parsed = reorderSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid reorder payload", errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { module, orderedIds, scopeValue } = parsed.data;
    const config = ORDERABLE_MODELS[module];

    if (!authorize(user, config.permissionModule, "update")) {
      return NextResponse.json({ message: "Forbidden: insufficient permissions" }, { status: 403 });
    }

    if (config.scopeField && !scopeValue) {
      return NextResponse.json(
        { message: `scopeValue (${config.scopeField}) is required for module ${module}` },
        { status: 400 }
      );
    }

    await reorderItems(module, orderedIds, config.scopeField ? scopeValue : undefined);
    return NextResponse.json({ data: { reordered: orderedIds.length } });
  } catch (error) {
    if (error instanceof OrderingConflictError) {
      return NextResponse.json({ message: error.message }, { status: 409 });
    }
    console.error("Reorder error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
});
