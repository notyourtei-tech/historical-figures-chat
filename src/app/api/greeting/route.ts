import { NextRequest, NextResponse } from "next/server";
import { runGreeting } from "@/lib/ancient-chat";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { GreetingRequestSchema } from "@/lib/validation";
import { logSecurityEvent } from "@/lib/security-logger";
import { ErrorCode } from "@/lib/errors";

export const runtime = "nodejs";
export const maxDuration = 60;

function isAllowedOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");

  if (origin && host) {
    try {
      const originHost = new URL(origin).host;
      return originHost === host;
    } catch {
      return false;
    }
  }

  if (!origin && host) {
    const referer = req.headers.get("referer");
    if (referer) {
      try {
        const refererHost = new URL(referer).host;
        return refererHost === host;
      } catch {
        return false;
      }
    }
  }

  if (!origin && !req.headers.get("referer") && process.env.NODE_ENV === "production") {
    return false;
  }

  return true;
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);

  try {
    if (!isAllowedOrigin(req)) {
      logSecurityEvent({ type: "INVALID_ORIGIN", ip, path: "/api/greeting", detail: req.headers.get("origin") || "none" });
      return NextResponse.json(
        { success: false, error: ErrorCode.INVALID_ORIGIN },
        { status: 403 }
      );
    }

    const { allowed, remaining } = await rateLimit(ip, 30, 60000);
    if (!allowed) {
      logSecurityEvent({ type: "RATE_LIMIT", ip, path: "/api/greeting" });
      return NextResponse.json(
        { success: false, error: ErrorCode.RATE_LIMIT },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      logSecurityEvent({ type: "INVALID_INPUT", ip, path: "/api/greeting", detail: "Invalid JSON" });
      return NextResponse.json(
        { success: false, error: ErrorCode.INVALID_REQUEST },
        { status: 400 }
      );
    }

    const parsed = GreetingRequestSchema.safeParse(body);
    if (!parsed.success) {
      logSecurityEvent({ type: "INVALID_INPUT", ip, path: "/api/greeting", detail: parsed.error.issues.map(i => i.message).join("; ") });
      return NextResponse.json(
        { success: false, error: ErrorCode.INVALID_REQUEST },
        { status: 400 }
      );
    }

    const { celebrity, language } = parsed.data;

    const result = await runGreeting(celebrity, language);
    return NextResponse.json(result, {
      headers: { "X-RateLimit-Remaining": String(remaining) },
    });
  } catch (error: unknown) {
    const detail = error instanceof Error ? error.message : String(error);
    console.error("[API /greeting]", detail);
    logSecurityEvent({ type: "SUSPICIOUS_ACTIVITY", ip, path: "/api/greeting", detail: detail.slice(0, 200) });
    return NextResponse.json(
      { success: false, error: ErrorCode.SERVER_ERROR, content: "Internal server error" },
      { status: 500 }
    );
  }
}
