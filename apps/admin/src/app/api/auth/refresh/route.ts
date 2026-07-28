import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { getJwtSecret, getJwtRefreshSecret } from "@/lib/auth";

// Multi-tab grace: the browser shares the refresh cookie across tabs, so two
// concurrent refreshes race — the loser presents an already-rotated token.
// Tokens revoked within this window are still accepted for an access token
// (without rotating again) instead of force-logging the user out.
const ROTATION_GRACE_MS = 10_000;

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get("refreshToken")?.value;
    if (!refreshToken) {
      return NextResponse.json({ message: "No refresh token" }, { status: 401 });
    }

    const refreshSecret = getJwtRefreshSecret();

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

    if (!storedToken) {
      return NextResponse.json({ message: "Refresh token revoked" }, { status: 401 });
    }

    if (storedToken.expiresAt < new Date()) {
      return NextResponse.json({ message: "Refresh token expired" }, { status: 401 });
    }

    const withinGrace =
      storedToken.revokedAt !== null &&
      Date.now() - storedToken.revokedAt.getTime() < ROTATION_GRACE_MS;

    if (storedToken.revokedAt && !withinGrace) {
      return NextResponse.json({ message: "Refresh token revoked" }, { status: 401 });
    }

    // Get user with role and permissions
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId, isActive: true },
      include: { role: { include: { permissions: true } } },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 401 });
    }

    const jwtSecret = getJwtSecret();

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

    // Token already rotated by a concurrent tab — hand out an access token
    // and keep the cookie jar's newer refresh token untouched.
    if (withinGrace) {
      return NextResponse.json({ data: { accessToken: newAccessToken } });
    }

    // Rotate the refresh token: revoke the used one and issue a fresh one
    const newRefreshToken = jwt.sign(
      { userId: user.id },
      refreshSecret,
      { expiresIn: 604800 } // 7 days in seconds
    );

    const now = new Date();
    // updateMany (not update) so a concurrent rotation yields count 0
    // instead of a P2025 throw surfacing as a 500.
    const rotated = await prisma.$transaction(async (tx) => {
      const { count } = await tx.refreshToken.updateMany({
        where: { token: refreshToken, revokedAt: null },
        data: { revokedAt: now },
      });
      if (count === 0) return false;

      await tx.refreshToken.deleteMany({
        where: { expiresAt: { lt: now } },
      });
      await tx.refreshToken.create({
        data: {
          token: newRefreshToken,
          userId: user.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });
      return true;
    });

    // Lost the race after the initial lookup — same grace treatment.
    if (!rotated) {
      return NextResponse.json({ data: { accessToken: newAccessToken } });
    }

    const response = NextResponse.json({
      data: { accessToken: newAccessToken },
    });

    response.cookies.set("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Refresh error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
