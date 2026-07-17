import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth";

const MODELS: Record<
  string,
  { model: unknown; hasDeletedAt: boolean; hasStatus: boolean; hasPublished: boolean }
> = {
  food: { model: prisma.food, hasDeletedAt: true, hasStatus: true, hasPublished: false },
  drink: { model: prisma.drink, hasDeletedAt: true, hasStatus: true, hasPublished: false },
  buffet: { model: prisma.buffetCourse, hasDeletedAt: true, hasStatus: true, hasPublished: false },
  "beer-art": { model: prisma.beerArt, hasDeletedAt: true, hasStatus: false, hasPublished: true },
  tourist: { model: prisma.tourPlace, hasDeletedAt: true, hasStatus: false, hasPublished: true },
  faq: { model: prisma.faq, hasDeletedAt: true, hasStatus: false, hasPublished: true },
};

export const POST = withAuth(
  async (request: NextRequest) => {
    try {
      const body = await request.json();
      const { module, action, ids } = body;

      if (!module || !action || !ids || !Array.isArray(ids) || ids.length === 0) {
        return NextResponse.json(
          { message: "module, action, and ids are required" },
          { status: 400 }
        );
      }

      const config = MODELS[module];
      if (!config)
        return NextResponse.json({ message: `Unknown module: ${module}` }, { status: 400 });

      const model = config.model as { updateMany: (args: unknown) => Promise<{ count: number }> };
      let data: Record<string, unknown> = {};

      switch (action) {
        case "publish":
          if (config.hasStatus) data = { status: "PUBLISHED" };
          else if (config.hasPublished) data = { isPublished: true };
          else
            return NextResponse.json(
              { message: "Publish not supported for this module" },
              { status: 400 }
            );
          break;
        case "unpublish":
          if (config.hasStatus) data = { status: "DRAFT" };
          else if (config.hasPublished) data = { isPublished: false };
          else
            return NextResponse.json(
              { message: "Unpublish not supported for this module" },
              { status: 400 }
            );
          break;
        case "archive":
          if (config.hasStatus) data = { status: "ARCHIVED" };
          else
            return NextResponse.json(
              { message: "Archive not supported for this module" },
              { status: 400 }
            );
          break;
        case "delete":
          if (config.hasDeletedAt) data = { deletedAt: new Date() };
          else
            return NextResponse.json(
              { message: "Soft delete not supported for this module" },
              { status: 400 }
            );
          break;
        default:
          return NextResponse.json({ message: `Unknown action: ${action}` }, { status: 400 });
      }

      const result = await model.updateMany({ where: { id: { in: ids } }, data });
      return NextResponse.json({ data: { affected: result.count } });
    } catch (error) {
      console.error("Bulk action error:", error);
      return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
  },
  { module: "bulkActions", action: "update" }
);
