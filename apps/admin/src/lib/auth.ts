import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { getClientIp } from "@/lib/rate-limit";

export interface AuthUser {
  userId: string;
  email: string;
  role: string;
  permissions: string[];
}

// Fail fast when JWT secrets are not configured instead of silently
// falling back to a well-known development value.
export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET environment variable is not set");
  return secret;
}

export function getJwtRefreshSecret(): string {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) throw new Error("JWT_REFRESH_SECRET environment variable is not set");
  return secret;
}

export async function authenticate(request: NextRequest): Promise<AuthUser | null> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.slice(7);
  const secret = getJwtSecret();
  try {
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

const MUTATION_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

// Fire-and-forget audit trail for successful mutations that declare a module.
// Failures are logged but never block or fail the actual request.
function recordAudit(
  request: NextRequest,
  user: AuthUser,
  options: WithAuthOptions | undefined,
  response: NextResponse,
  entityId?: string
) {
  if (!options?.module || !MUTATION_METHODS.has(request.method) || !response.ok) return;

  prisma.auditLog
    .create({
      data: {
        userId: user.userId,
        module: options.module,
        action: options.action ?? request.method.toLowerCase(),
        entityId: entityId ?? null,
        details: { path: request.nextUrl.pathname, method: request.method },
        ipAddress: getClientIp(request),
        userAgent: request.headers.get("user-agent"),
      },
    })
    .catch((err) => {
      console.error("Failed to write audit log:", err);
    });
}

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

    const response = await handler(request, { user });
    recordAudit(request, user, options, response);
    return response;
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
    const response = await handler(request, { user, params });
    recordAudit(request, user, options, response, params.id);
    return response;
  };
}
