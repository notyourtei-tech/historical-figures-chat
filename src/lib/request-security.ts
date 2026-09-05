import type { NextRequest } from "next/server";

/**
 * CSRF defence for cookie-authenticated state changes. Public deployments
 * require a matching Origin (or a same-origin Referer fallback); local
 * development and IDE previews remain usable without extra configuration.
 */
export function isSameOriginRequest(request: NextRequest): boolean {
  if (process.env.NODE_ENV !== "production") return true;

  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  if (!host) return false;
  const expectedProtocol = (request.headers.get("x-forwarded-proto") || "https").split(",")[0].trim() + ":";
  const source = request.headers.get("origin") || request.headers.get("referer");
  if (!source) return false;

  try {
    const url = new URL(source);
    return url.host === host && url.protocol === expectedProtocol;
  } catch {
    return false;
  }
}
