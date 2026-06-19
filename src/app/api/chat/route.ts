import { NextRequest, NextResponse } from "next/server";
import { runChat } from "@/lib/ancient-chat";
import { Celebrity, Language, Message } from "@/types";
import { rateLimit, isValidCelebrityId, sanitizeInput } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const { allowed, remaining } = rateLimit(ip, 20, 60000);
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: "RATE_LIMIT_EXCEEDED" },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }

    const body = await req.json();
    const celebrity = body.celebrity as Celebrity;
    const messages = body.messages as Message[];
    const language = (body.language as Language) || "zh";

    if (!celebrity?.id || !isValidCelebrityId(celebrity.id) || !Array.isArray(messages)) {
      return NextResponse.json(
        { success: false, error: "INVALID_REQUEST" },
        { status: 400 }
      );
    }

    if (messages.length > 50) {
      return NextResponse.json(
        { success: false, error: "TOO_MANY_MESSAGES" },
        { status: 400 }
      );
    }

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
    return NextResponse.json(
      { success: false, error: "SERVER_ERROR", content: detail },
      { status: 500 }
    );
  }
}
