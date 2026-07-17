import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get("refreshToken")?.value;

    if (refreshToken) {
      // Revoke the refresh token
      await prisma.refreshToken.updateMany({
        where: { token: refreshToken, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }

    const response = NextResponse.json({ data: { message: "Logged out" } });
    response.cookies.delete("refreshToken");
    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
