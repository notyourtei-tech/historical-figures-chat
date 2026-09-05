import { NextRequest, NextResponse } from "next/server";
import { runGreeting } from "@/lib/ancient-chat";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { GreetingRequestSchema } from "@/lib/validation";
import { logSecurityEvent } from "@/lib/security-logger";
import { ErrorCode } from "@/lib/errors";
import { captureOperationalError } from "@/lib/observability";
import { celebrities } from "@/data/celebrities";

export const runtime = "nodejs";
export const maxDuration = 60;

function isAllowedOrigin(req: NextRequest): boolean {
  const host = req.headers.get("host") || "";

  // 开发环境 / IDE 预览代理：放宽来源校验，避免误拦截本地访问
  if (process.env.NODE_ENV !== "production") return true;
  if (host.startsWith("localhost") || host.startsWith("127.0.0.1") || host.startsWith("::1")) {
    return true;
  }

  const origin = req.headers.get("origin");

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
      logSecurityEvent({ type: "INVALID_ORIGIN", ip, path: "/api/greeting", detail: "origin_mismatch" });
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
      logSecurityEvent({ type: "INVALID_INPUT", ip, path: "/api/greeting", detail: "schema_validation_failed" });
      return NextResponse.json(
        { success: false, error: ErrorCode.INVALID_REQUEST },
        { status: 400 }
      );
    }

    const { language } = parsed.data;
    const celebrity = celebrities.find((candidate) => candidate.id === parsed.data.celebrity.id);
    if (!celebrity) {
      logSecurityEvent({ type: "INVALID_INPUT", ip, path: "/api/greeting", detail: "unknown_celebrity" });
      return NextResponse.json({ success: false, error: ErrorCode.INVALID_REQUEST }, { status: 400 });
    }

    const result = await runGreeting(celebrity, language);
    return NextResponse.json(result, {
      headers: { "X-RateLimit-Remaining": String(remaining) },
    });
  } catch (error: unknown) {
    console.error("[API /greeting] Request failed");
    captureOperationalError(error, { route: "/api/greeting" });
    logSecurityEvent({ type: "SUSPICIOUS_ACTIVITY", ip, path: "/api/greeting", detail: "unhandled_request_error" });
    return NextResponse.json(
      { success: false, error: ErrorCode.SERVER_ERROR, content: "Internal server error" },
      { status: 500 }
    );
  }
}
