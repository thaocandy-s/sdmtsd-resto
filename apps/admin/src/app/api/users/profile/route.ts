import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth";
import bcrypt from "bcryptjs";

// PUT /api/users/profile - Update current user's profile details & password
export const PUT = withAuth(async (request: NextRequest, { user }) => {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username) {
      return NextResponse.json({ message: "Username is required" }, { status: 400 });
    }

    const existing = await prisma.user.findFirst({
      where: {
        username,
        NOT: { id: user.userId },
      },
    });

    if (existing) {
      return NextResponse.json({ message: "Username is already taken" }, { status: 409 });
    }

    const updateData: Record<string, unknown> = {
      username,
    };

    if (password) {
      updateData.passwordHash = await bcrypt.hash(password, 10);
    }

    const updated = await prisma.user.update({
      where: { id: user.userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        isActive: true,
        createdAt: true,
        role: {
          select: {
            name: true,
            label: true,
          },
        },
      },
    });

    return NextResponse.json({
      data: {
        id: updated.id,
        email: updated.email,
        username: updated.username,
        firstName: updated.firstName,
        lastName: updated.lastName,
        role: updated.role.name,
        roleLabel: updated.role.label,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
});
