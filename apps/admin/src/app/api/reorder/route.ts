import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withAuth, authorize } from "@/lib/auth";
import {
  ORDERABLE_MODELS,
  OrderableModule,
  OrderingConflictError,
  reorderItems,
} from "@/lib/ordering";

// Shared drag & drop reorder endpoint used by every ordered admin module.
// Receives the complete new order of one scope (whole list, or one category
// for category-scoped modules) and persists it atomically.

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
