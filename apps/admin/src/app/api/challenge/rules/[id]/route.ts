import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuthParams } from "@/lib/auth";
import { normalizeScope, updateOrdered } from "@/lib/ordering";
import { positionValue } from "@/lib/validation";

export const PUT = withAuthParams(
  async (request, { params }) => {
    try {
      const body = await request.json();
      const position = positionValue.parse(body.position);
      delete body.position;
      delete body.sortOrder;

      const rule = await updateOrdered("katanuki-rule", params.id, { position }, (tx) =>
        tx.katanukiRule.update({ where: { id: params.id }, data: body })
      );
      return NextResponse.json({ data: rule });
    } catch (error) {
      console.error("Update rule error:", error);
      return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
  },
  { module: "challenge", action: "update" }
);

export const DELETE = withAuthParams(
  async (_request, { params }) => {
    try {
      await prisma.katanukiRule.delete({ where: { id: params.id } });
      await normalizeScope("katanuki-rule");
      return NextResponse.json({ message: "Rule deleted" });
    } catch (error) {
      console.error("Delete rule error:", error);
      return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
  },
  { module: "challenge", action: "delete" }
);
