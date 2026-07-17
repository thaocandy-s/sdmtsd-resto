import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth";
import bcrypt from "bcryptjs";

// GET /api/users - List users with pagination
export const GET = withAuth(
  async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url);
      const page = parseInt(searchParams.get("page") || "1");
      const limit = parseInt(searchParams.get("limit") || "20");
      const search = searchParams.get("search") || "";
      const roleId = searchParams.get("roleId") || "";
      const isActive = searchParams.get("isActive");

      const skip = (page - 1) * limit;

      const where: Record<string, unknown> = {
        deletedAt: null,
      };

      if (search) {
        where.OR = [
          { email: { contains: search, mode: "insensitive" } },
          { firstName: { contains: search, mode: "insensitive" } },
          { lastName: { contains: search, mode: "insensitive" } },
        ];
      }

      if (roleId) {
        where.roleId = roleId;
      }

      if (isActive !== null && isActive !== undefined) {
        where.isActive = isActive === "true";
      }

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take: limit,
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
              },
            },
          },
          orderBy: { createdAt: "desc" },
        }),
        prisma.user.count({ where }),
      ]);

      return NextResponse.json({
        data: users,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error("Get users error:", error);
      return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
  },
  { module: "users", action: "read" }
);

// POST /api/users - Create user
export const POST = withAuth(
  async (request: NextRequest) => {
    try {
      const body = await request.json();
      const { email, password, firstName, lastName, roleId } = body;

      if (!email || !password || !firstName || !lastName || !roleId) {
        return NextResponse.json({ message: "All fields are required" }, { status: 400 });
      }

      // Check if email already exists
      const existing = await prisma.user.findUnique({
        where: { email },
      });

      if (existing) {
        return NextResponse.json({ message: "Email already exists" }, { status: 409 });
      }

      // Check if role exists
      const role = await prisma.role.findUnique({
        where: { id: roleId },
      });

      if (!role) {
        return NextResponse.json({ message: "Role not found" }, { status: 404 });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          firstName,
          lastName,
          roleId,
        },
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

      return NextResponse.json({ data: user }, { status: 201 });
    } catch (error) {
      console.error("Create user error:", error);
      return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
  },
  { module: "users", action: "create" }
);
