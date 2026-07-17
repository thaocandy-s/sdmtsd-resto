import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuthParams } from "@/lib/auth";
import bcrypt from "bcryptjs";

// GET /api/users/[id] - Get user by ID
export const GET = withAuthParams(
  async (_request: NextRequest, { user: _user, params }) => {
    try {
      const { id } = params;

      const user = await prisma.user.findUnique({
        where: { id, deletedAt: null },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
          role: {
            select: {
              id: true,
              name: true,
              label: true,
              permissions: {
                select: {
                  id: true,
                  module: true,
                  action: true,
                },
              },
            },
          },
        },
      });

      if (!user) {
        return NextResponse.json({ message: "User not found" }, { status: 404 });
      }

      return NextResponse.json({ data: user });
    } catch (error) {
      console.error("Get user error:", error);
      return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
  },
  { module: "users", action: "read" }
);

// PUT /api/users/[id] - Update user
export const PUT = withAuthParams(
  async (request: NextRequest, { user: _user, params }) => {
    try {
      const { id } = params;
      const body = await request.json();
      const { email, password, firstName, lastName, roleId, isActive } = body;

      const existing = await prisma.user.findUnique({
        where: { id, deletedAt: null },
      });

      if (!existing) {
        return NextResponse.json({ message: "User not found" }, { status: 404 });
      }

      // Check if email already exists (if changing email)
      if (email && email !== existing.email) {
        const emailExists = await prisma.user.findUnique({
          where: { email },
        });

        if (emailExists) {
          return NextResponse.json({ message: "Email already exists" }, { status: 409 });
        }
      }

      const updateData: Record<string, unknown> = {};

      if (email) updateData.email = email;
      if (firstName) updateData.firstName = firstName;
      if (lastName) updateData.lastName = lastName;
      if (roleId) updateData.roleId = roleId;
      if (typeof isActive === "boolean") updateData.isActive = isActive;

      if (password) {
        updateData.passwordHash = await bcrypt.hash(password, 10);
      }

      const user = await prisma.user.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          isActive: true,
          createdAt: true,
          role: {
            select: {
              id: true,
              name: true,
              label: true,
            },
          },
        },
      });

      return NextResponse.json({ data: user });
    } catch (error) {
      console.error("Update user error:", error);
      return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
  },
  { module: "users", action: "update" }
);

// DELETE /api/users/[id] - Soft delete user
export const DELETE = withAuthParams(
  async (_request: NextRequest, { user: authUser, params }) => {
    try {
      const { id } = params;

      // Prevent self-deletion
      if (id === authUser.userId) {
        return NextResponse.json({ message: "Cannot delete yourself" }, { status: 400 });
      }

      const existing = await prisma.user.findUnique({
        where: { id, deletedAt: null },
      });

      if (!existing) {
        return NextResponse.json({ message: "User not found" }, { status: 404 });
      }

      await prisma.user.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          isActive: false,
        },
      });

      return NextResponse.json({ data: { message: "User deleted" } });
    } catch (error) {
      console.error("Delete user error:", error);
      return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
  },
  { module: "users", action: "delete" }
);
