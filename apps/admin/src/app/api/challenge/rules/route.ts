import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth";

export const POST = withAuth(
  async (request: NextRequest) => {
    try {
      const body = await request.json();
      const { title, description, sortOrder, isActive } = body;
      if (!title || !description)
        return NextResponse.json(
          { message: "Title and description are required" },
          { status: 400 }
        );

      const rule = await prisma.katanukiRule.create({
        data: { title, description, sortOrder: sortOrder || 0, isActive: isActive !== false },
      });
      return NextResponse.json({ data: rule }, { status: 201 });
    } catch (error) {
      console.error("Create rule error:", error);
      return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
  },
  { module: "challenge", action: "create" }
);
