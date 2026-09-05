import { NextRequest, NextResponse } from "next/server";
import { runChat, streamChat } from "@/lib/ancient-chat";
import { rateLimit, getClientIp, sanitizeInput } from "@/lib/rate-limit";
import { ChatRequestSchema } from "@/lib/validation";
import { logSecurityEvent } from "@/lib/security-logger";
import { ErrorCode } from "@/lib/errors";
import { assessContentSafety } from "@/lib/content-safety";
import { recordModerationEvent } from "@/lib/moderation";
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
      logSecurityEvent({ type: "INVALID_ORIGIN", ip, path: "/api/chat", detail: "origin_mismatch" });
      return NextResponse.json(
        { success: false, error: ErrorCode.INVALID_ORIGIN },
        { status: 403 }
      );
    }

    const { allowed, remaining } = await rateLimit(ip, 20, 60000);
    if (!allowed) {
      logSecurityEvent({ type: "RATE_LIMIT", ip, path: "/api/chat" });
      return NextResponse.json(
        { success: false, error: ErrorCode.RATE_LIMIT },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      logSecurityEvent({ type: "INVALID_INPUT", ip, path: "/api/chat", detail: "Invalid JSON" });
      return NextResponse.json(
        { success: false, error: ErrorCode.INVALID_REQUEST },
        { status: 400 }
      );
    }

    const parsed = ChatRequestSchema.safeParse(body);
    if (!parsed.success) {
      logSecurityEvent({ type: "INVALID_INPUT", ip, path: "/api/chat", detail: "schema_validation_failed" });
      return NextResponse.json(
        { success: false, error: ErrorCode.INVALID_REQUEST },
        { status: 400 }
      );
    }

    const { messages, language } = parsed.data;
    const celebrity = celebrities.find((candidate) => candidate.id === parsed.data.celebrity.id);
    if (!celebrity) {
      logSecurityEvent({ type: "INVALID_INPUT", ip, path: "/api/chat", detail: "unknown_celebrity" });
      return NextResponse.json({ success: false, error: ErrorCode.INVALID_REQUEST }, { status: 400 });
    }

    const sanitizedMessages = messages.map((m) => ({
      ...m,
      content: sanitizeInput(m.content, 2000),
    }));
    if (sanitizedMessages.some((message) => !message.content)) {
      return NextResponse.json({ success: false, error: ErrorCode.INVALID_REQUEST }, { status: 400 });
    }

    const latestUserMessage = [...sanitizedMessages].reverse().find((message) => message.role === "user");
    if (latestUserMessage) {
      const safety = assessContentSafety(latestUserMessage.content, language);
      if (safety.action !== "allow") {
        logSecurityEvent({ type: "CONTENT_POLICY", ip, path: "/api/chat", detail: safety.category });
        void recordModerationEvent(safety.category, safety.action);
        if (safety.action === "block") {
          return NextResponse.json(
            { success: false, error: ErrorCode.CONTENT_POLICY, content: safety.message },
            { status: 422 }
          );
        }
      }
    }

    if (req.nextUrl.searchParams.get("stream") === "1") {
      const encoder = new TextEncoder();
      const stream = new ReadableStream<Uint8Array>({
        async start(controller) {
          const send = (payload: Record<string, unknown>) => {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
          };
          try {
            for await (const content of streamChat(celebrity, sanitizedMessages, language)) {
              send({ type: "delta", content });
            }
            send({ type: "complete" });
          } catch (error) {
            captureOperationalError(error, { route: "/api/chat", mode: "stream" });
            send({ type: "error", error: ErrorCode.SERVER_ERROR });
          } finally {
            controller.close();
          }
        },
      });
      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
          "X-Accel-Buffering": "no",
          "X-RateLimit-Remaining": String(remaining),
        },
      });
    }

    const result = await runChat(celebrity, sanitizedMessages, language);
    return NextResponse.json(result, {
      headers: { "X-RateLimit-Remaining": String(remaining) },
    });
  } catch (error: unknown) {
    console.error("[API /chat] Request failed");
    captureOperationalError(error, { route: "/api/chat" });
    logSecurityEvent({ type: "SUSPICIOUS_ACTIVITY", ip, path: "/api/chat", detail: "unhandled_request_error" });
    return NextResponse.json(
      { success: false, error: ErrorCode.SERVER_ERROR, content: "Internal server error" },
      { status: 500 }
    );
  }
}
