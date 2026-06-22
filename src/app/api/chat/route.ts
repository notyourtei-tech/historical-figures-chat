import { NextRequest, NextResponse } from "next/server";
import { runChat } from "@/lib/ancient-chat";
import { rateLimit, getClientIp, sanitizeInput } from "@/lib/rate-limit";
import { ChatRequestSchema } from "@/lib/validation";
import { logSecurityEvent } from "@/lib/security-logger";

export const runtime = "nodejs";
export const maxDuration = 60;

function isAllowedOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (!origin || !host) return true;
  try {
    const originHost = new URL(origin).host;
    return originHost === host;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);

  try {
    if (!isAllowedOrigin(req)) {
      logSecurityEvent({ type: "INVALID_ORIGIN", ip, path: "/api/chat", detail: req.headers.get("origin") || "none" });
      return NextResponse.json(
        { success: false, error: "INVALID_ORIGIN" },
        { status: 403 }
      );
    }

    const { allowed, remaining } = await rateLimit(ip, 20, 60000);
    if (!allowed) {
      logSecurityEvent({ type: "RATE_LIMIT", ip, path: "/api/chat" });
      return NextResponse.json(
        { success: false, error: "RATE_LIMIT_EXCEEDED" },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      logSecurityEvent({ type: "INVALID_INPUT", ip, path: "/api/chat", detail: "Invalid JSON" });
      return NextResponse.json(
        { success: false, error: "INVALID_REQUEST" },
        { status: 400 }
      );
    }

    const parsed = ChatRequestSchema.safeParse(body);
    if (!parsed.success) {
      logSecurityEvent({ type: "INVALID_INPUT", ip, path: "/api/chat", detail: parsed.error.issues.map(i => i.message).join("; ") });
      return NextResponse.json(
        { success: false, error: "INVALID_REQUEST" },
        { status: 400 }
      );
    }

    const { celebrity, messages, language } = parsed.data;

    const sanitizedMessages = messages.map((m) => ({
      ...m,
      content: sanitizeInput(m.content, 2000),
    }));

    const result = await runChat(celebrity, sanitizedMessages, language);
    return NextResponse.json(result, {
      headers: { "X-RateLimit-Remaining": String(remaining) },
    });
  } catch (error: unknown) {
    const detail = error instanceof Error ? error.message : String(error);
    console.error("[API /chat]", detail);
    logSecurityEvent({ type: "SUSPICIOUS_ACTIVITY", ip, path: "/api/chat", detail: detail.slice(0, 200) });
    return NextResponse.json(
      { success: false, error: "SERVER_ERROR", content: "Internal server error" },
      { status: 500 }
    );
  }
}
