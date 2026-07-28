import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getJwtSecret, getJwtRefreshSecret } from "@/lib/auth";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

// Max 5 login attempts per IP per minute
const LOGIN_LIMIT = 5;
const LOGIN_WINDOW_MS = 60 * 1000;

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    if (!rateLimit(`login:${ip}`, LOGIN_LIMIT, LOGIN_WINDOW_MS)) {
      return NextResponse.json(
        { message: "Too many login attempts. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email/Username and password are required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username: email }],
        isActive: true,
      },
      include: { role: { include: { permissions: true } } },
    });

    if (!user) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    const jwtSecret = getJwtSecret();
    const refreshSecret = getJwtRefreshSecret();

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

    // Batch all login writes: purge expired rows, store the new refresh
    // token, and stamp last login in one transaction. Existing sessions on
    // other devices stay valid (multi-session policy).
    const now = new Date();
    await prisma.$transaction([
      prisma.refreshToken.deleteMany({
        where: { expiresAt: { lt: now } },
      }),
      prisma.refreshToken.create({
        data: {
          token: refreshToken,
          userId: user.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      }),
      prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: now },
      }),
    ]);

    // Set refresh token as HTTP-only cookie
    const response = NextResponse.json({
      data: {
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
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
