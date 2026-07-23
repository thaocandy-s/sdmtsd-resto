import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/challenge - Get challenge rules and winners
export async function GET() {
  try {
    const [rules, winners, imageSetting] = await Promise.all([
      prisma.katanukiRule.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      }),
      prisma.katanukiWinner.findMany({
        where: { isPublished: true },
        orderBy: { completedAt: "desc" },
        take: 20,
      }),
      prisma.setting.findUnique({ where: { key: "katanuki_image" } }),
    ]);

    const challengeImage = (imageSetting?.value as string) || "/images/katanuki.png";

    return NextResponse.json({
      data: {
        rules,
        winners,
        challengeImage,
      },
    });
  } catch (error) {
    console.error("Get challenge error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
