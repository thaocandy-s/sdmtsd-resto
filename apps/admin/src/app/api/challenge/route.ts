import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth";

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const winnersPage = parseInt(searchParams.get("winnersPage") || "1");
    const winnersLimit = parseInt(searchParams.get("winnersLimit") || "10");
    const winnersSkip = (winnersPage - 1) * winnersLimit;

    const [rules, winners, totalWinners, imageSetting] = await Promise.all([
      prisma.katanukiRule.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.katanukiWinner.findMany({
        orderBy: { completedAt: "desc" },
        skip: winnersSkip,
        take: winnersLimit,
      }),
      prisma.katanukiWinner.count(),
      prisma.setting.findUnique({ where: { key: "katanuki_image" } }),
    ]);

    const challengeImage = (imageSetting?.value as string) || "/images/katanuki.png";
    return NextResponse.json({
      data: {
        rules,
        winners,
        challengeImage,
        meta: {
          winnersPage,
          winnersLimit,
          totalWinners,
          totalWinnersPages: Math.ceil(totalWinners / winnersLimit),
        },
      },
    });
  } catch (error) {
    console.error("Get challenge data error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
});
