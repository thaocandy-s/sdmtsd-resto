import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export interface AuthUser {
  userId: string;
  email: string;
  role: string;
  permissions: string[];
}

export async function authenticate(request: NextRequest): Promise<AuthUser | null> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.slice(7);
  try {
    const secret = process.env.JWT_SECRET || "dev-secret";
    const decoded = jwt.verify(token, secret) as AuthUser;
    return decoded;
  } catch {
    return null;
  }
}

export function authorize(user: AuthUser, module: string, action: string): boolean {
  if (user.role === "ADMIN") return true;
  return user.permissions.includes(`${module}:${action}`);
}

type WithAuthOptions = {
  module?: string;
  action?: string;
};

// For routes without params
export function withAuth(
  handler: (
    request: NextRequest,
    context: { user: AuthUser }
  ) => Promise<NextResponse> | NextResponse,
  options?: WithAuthOptions
) {
  return async (request: NextRequest) => {
    const user = await authenticate(request);

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (options?.module && options?.action) {
      if (!authorize(user, options.module, options.action)) {
        return NextResponse.json(
          { message: "Forbidden: insufficient permissions" },
          { status: 403 }
        );
      }
    }

    return handler(request, { user });
  };
}

// For routes with params
export function withAuthParams(
  handler: (
    request: NextRequest,
    context: { user: AuthUser; params: Record<string, string> }
  ) => Promise<NextResponse> | NextResponse,
  options?: WithAuthOptions
) {
  return async (request: NextRequest, ctx: { params: Promise<Record<string, string>> }) => {
    const user = await authenticate(request);

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (options?.module && options?.action) {
      if (!authorize(user, options.module, options.action)) {
        return NextResponse.json(
          { message: "Forbidden: insufficient permissions" },
          { status: 403 }
        );
      }
    }

    const params = await ctx.params;
    return handler(request, { user, params });
  };
}
