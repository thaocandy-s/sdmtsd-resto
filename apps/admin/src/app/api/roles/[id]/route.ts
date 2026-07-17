import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuthParams } from "@/lib/auth";

// GET /api/roles/[id] - Get role by ID
export const GET = withAuthParams(
  async (_request: NextRequest, { user: _user, params }) => {
    try {
      const { id } = params;

      const role = await prisma.role.findUnique({
        where: { id },
        include: {
          permissions: {
            select: {
              id: true,
              module: true,
              action: true,
            },
          },
          users: {
            where: { deletedAt: null },
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      if (!role) {
        return NextResponse.json({ message: "Role not found" }, { status: 404 });
      }

      return NextResponse.json({ data: role });
    } catch (error) {
      console.error("Get role error:", error);
      return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
  },
  { module: "roles", action: "read" }
);

// PUT /api/roles/[id] - Update role
export const PUT = withAuthParams(
  async (request: NextRequest, { user: _user, params }) => {
    try {
      const { id } = params;
      const body = await request.json();
      const { label, description, permissions } = body;

      const existing = await prisma.role.findUnique({
        where: { id },
      });

      if (!existing) {
        return NextResponse.json({ message: "Role not found" }, { status: 404 });
      }

      // Prevent editing ADMIN role
      if (existing.name === "ADMIN") {
        return NextResponse.json({ message: "Cannot modify ADMIN role" }, { status: 403 });
      }

      const updateData: Record<string, unknown> = {};
      if (label) updateData.label = label;
      if (description !== undefined) updateData.description = description;

      // Update role and permissions in transaction
      const role = await prisma.$transaction(async (tx) => {
        // Update role
        const updated = await tx.role.update({
          where: { id },
          data: updateData,
        });

        // Update permissions if provided
        if (permissions) {
          // Delete existing permissions
          await tx.permission.deleteMany({
            where: { roleId: id },
          });

          // Create new permissions
          if (permissions.length > 0) {
            await tx.permission.createMany({
              data: permissions.map((p: { module: string; action: string }) => ({
                roleId: id,
                module: p.module,
                action: p.action,
              })),
            });
          }
        }

        // Return updated role with permissions
        return tx.role.findUnique({
          where: { id },
          include: { permissions: true },
        });
      });

      return NextResponse.json({ data: role });
    } catch (error) {
      console.error("Update role error:", error);
      return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
  },
  { module: "roles", action: "update" }
);

// DELETE /api/roles/[id] - Delete role
export const DELETE = withAuthParams(
  async (_request: NextRequest, { user: _user, params }) => {
    try {
      const { id } = params;

      const existing = await prisma.role.findUnique({
        where: { id },
        include: { _count: { select: { users: true } } },
      });

      if (!existing) {
        return NextResponse.json({ message: "Role not found" }, { status: 404 });
      }

      // Prevent deleting ADMIN role
      if (existing.name === "ADMIN") {
        return NextResponse.json({ message: "Cannot delete ADMIN role" }, { status: 403 });
      }

      // Prevent deleting roles with users
      if (existing._count.users > 0) {
        return NextResponse.json(
          { message: "Cannot delete role with assigned users" },
          { status: 400 }
        );
      }

      await prisma.$transaction([
        prisma.permission.deleteMany({ where: { roleId: id } }),
        prisma.role.delete({ where: { id } }),
      ]);

      return NextResponse.json({ data: { message: "Role deleted" } });
    } catch (error) {
      console.error("Delete role error:", error);
      return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
  },
  { module: "roles", action: "delete" }
);
