import { NextRequest } from "next/server";
import { getClientIpFromHeaders, rateLimit } from "@resto-hub/utils/rate-limit";

// Thin adapter over the shared limiter so call sites keep the
// NextRequest-based signature.
export function getClientIp(request: NextRequest): string {
  return getClientIpFromHeaders(request.headers);
}

export { rateLimit };
