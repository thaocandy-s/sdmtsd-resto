import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get("refreshToken")?.value;
    if (!refreshToken) {
      return NextResponse.json({ message: "No refresh token" }, { status: 401 });
    }

    const refreshSecret = process.env.JWT_REFRESH_SECRET || "dev-refresh-secret";

    let decoded: { userId: string };
    try {
      decoded = jwt.verify(refreshToken, refreshSecret) as { userId: string };
    } catch {
      return NextResponse.json({ message: "Invalid refresh token" }, { status: 401 });
    }

    // Check if refresh token exists and is not revoked
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!storedToken || storedToken.revokedAt) {
      return NextResponse.json({ message: "Refresh token revoked" }, { status: 401 });
    }

    if (storedToken.expiresAt < new Date()) {
      return NextResponse.json({ message: "Refresh token expired" }, { status: 401 });
    }

    // Get user with role and permissions
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId, isActive: true },
      include: { role: { include: { permissions: true } } },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 401 });
    }

    const jwtSecret = process.env.JWT_SECRET || "dev-secret";

    const newAccessToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role.name,
        permissions: user.role.permissions.map((p) => `${p.module}:${p.action}`),
      },
      jwtSecret,
      { expiresIn: 900 }
    );

    return NextResponse.json({
      data: { accessToken: newAccessToken },
    });
  } catch (error) {
    console.error("Refresh error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
