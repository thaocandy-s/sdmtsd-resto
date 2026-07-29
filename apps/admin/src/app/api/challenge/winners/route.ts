import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth";
import { createOrdered } from "@/lib/ordering";
import { positionValue } from "@/lib/validation";

export const POST = withAuth(
  async (request: NextRequest) => {
    try {
      const body = await request.json();
      const {
        participantName,
        imageUrl,
        challengeName,
        discountAwarded,
        completedAt,
        isPublished,
      } = body;
      if (!participantName)
        return NextResponse.json({ message: "Participant name is required" }, { status: 400 });

      const position = positionValue.parse(body.position);
      const winner = await createOrdered("katanuki-winner", undefined, position, (tx, sortOrder) =>
        tx.katanukiWinner.create({
          data: {
            participantName,
            imageUrl,
            challengeName,
            discountAwarded,
            completedAt: completedAt ? new Date(completedAt) : new Date(),
            isPublished: isPublished || false,
            sortOrder,
          },
        })
      );
      return NextResponse.json({ data: winner }, { status: 201 });
    } catch (error) {
      console.error("Create winner error:", error);
      return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
  },
  { module: "challenge", action: "create" }
);
