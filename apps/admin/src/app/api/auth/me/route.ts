import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth";

export const GET = withAuth(async (_request, { user }) => {
  const dbUser = await prisma.user.findUnique({
    where: { id: user.userId },
    select: {
      id: true,
      email: true,
      username: true,
      firstName: true,
      lastName: true,
      role: {
        select: {
          name: true,
          label: true,
          permissions: {
            select: { module: true, action: true },
          },
        },
      },
    },
  });

  if (!dbUser) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    data: {
      id: dbUser.id,
      email: dbUser.email,
      username: dbUser.username,
      firstName: dbUser.firstName,
      lastName: dbUser.lastName,
      role: dbUser.role.name,
      roleLabel: dbUser.role.label,
      permissions: dbUser.role.permissions,
    },
  });
});
