import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";
import { createOrdered } from "@/lib/ordering";
import { positionValue } from "@/lib/validation";

export const POST = withAuth(
  async (request: NextRequest) => {
    try {
      const body = await request.json();
      const { title, description, isActive } = body;
      if (!title || !description)
        return NextResponse.json(
          { message: "Title and description are required" },
          { status: 400 }
        );

      const position = positionValue.parse(body.position);
      const rule = await createOrdered("katanuki-rule", undefined, position, (tx, sortOrder) =>
        tx.katanukiRule.create({
          data: { title, description, sortOrder, isActive: isActive !== false },
        })
      );
      return NextResponse.json({ data: rule }, { status: 201 });
    } catch (error) {
      console.error("Create rule error:", error);
      return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
  },
  { module: "challenge", action: "create" }
);
