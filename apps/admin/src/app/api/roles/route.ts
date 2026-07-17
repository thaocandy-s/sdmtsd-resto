import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth";

// GET /api/roles - List all roles with permissions
export const GET = withAuth(
  async () => {
    try {
      const roles = await prisma.role.findMany({
        include: {
          permissions: {
            select: {
              id: true,
              module: true,
              action: true,
            },
          },
          _count: {
            select: {
              users: {
                where: { deletedAt: null },
              },
            },
          },
        },
        orderBy: { createdAt: "asc" },
      });

      return NextResponse.json({ data: roles });
    } catch (error) {
      console.error("Get roles error:", error);
      return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
  },
  { module: "roles", action: "read" }
);

// POST /api/roles - Create role
export const POST = withAuth(
  async (request: NextRequest) => {
    try {
      const body = await request.json();
      const { name, label, description, permissions } = body;

      if (!name || !label) {
        return NextResponse.json({ message: "Name and label are required" }, { status: 400 });
      }

      // Check if role name already exists
      const existing = await prisma.role.findUnique({
        where: { name: name.toUpperCase() },
      });

      if (existing) {
        return NextResponse.json({ message: "Role name already exists" }, { status: 409 });
      }

      const role = await prisma.role.create({
        data: {
          name: name.toUpperCase(),
          label,
          description,
          permissions: permissions?.length
            ? {
                create: permissions.map((p: { module: string; action: string }) => ({
                  module: p.module,
                  action: p.action,
                })),
              }
            : undefined,
        },
        include: {
          permissions: true,
        },
      });

      return NextResponse.json({ data: role }, { status: 201 });
    } catch (error) {
      console.error("Create role error:", error);
      return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
  },
  { module: "roles", action: "create" }
);
