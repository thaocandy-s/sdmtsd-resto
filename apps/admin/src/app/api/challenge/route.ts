import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth";

export const GET = withAuth(async () => {
  try {
    const [rules, winners, imageSetting] = await Promise.all([
      prisma.katanukiRule.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.katanukiWinner.findMany({ orderBy: { completedAt: "desc" } }),
      prisma.setting.findUnique({ where: { key: "katanuki_image" } }),
    ]);
    const challengeImage = (imageSetting?.value as string) || "/images/katanuki.png";
    return NextResponse.json({ data: { rules, winners, challengeImage } });
  } catch (error) {
    console.error("Get challenge data error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
});
