import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email, isActive: true },
      include: { role: { include: { permissions: true } } },
    });

    if (!user) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    const jwtSecret = process.env.JWT_SECRET || "dev-secret";
    const refreshSecret = process.env.JWT_REFRESH_SECRET || "dev-refresh-secret";

    const accessToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role.name,
        permissions: user.role.permissions.map((p) => `${p.module}:${p.action}`),
      },
      jwtSecret,
      { expiresIn: 900 } // 15 minutes in seconds
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      refreshSecret,
      { expiresIn: 604800 } // 7 days in seconds
    );

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Set refresh token as HTTP-only cookie
    const response = NextResponse.json({
      data: {
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role.name,
          roleLabel: user.role.label,
          permissions: user.role.permissions.map((p) => ({
            module: p.module,
            action: p.action,
          })),
        },
      },
    });

    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
