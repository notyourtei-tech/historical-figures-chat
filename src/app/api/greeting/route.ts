import { NextRequest, NextResponse } from "next/server";
import { runGreeting } from "@/lib/ancient-chat";
import { Celebrity, Language } from "@/types";
import { rateLimit, isValidCelebrityId } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const { allowed, remaining } = rateLimit(ip, 30, 60000);
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: "RATE_LIMIT_EXCEEDED" },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }

    const body = await req.json();
    const celebrity = body.celebrity as Celebrity;
    const language = (body.language as Language) || "zh";

    if (!celebrity?.id || !isValidCelebrityId(celebrity.id)) {
      return NextResponse.json(
        { success: false, error: "INVALID_REQUEST" },
        { status: 400 }
      );
    }

    const result = await runGreeting(celebrity, language);
    return NextResponse.json(result, {
      headers: { "X-RateLimit-Remaining": String(remaining) },
    });
  } catch (error: unknown) {
    const detail = error instanceof Error ? error.message : String(error);
    console.error("[API /greeting]", detail);
    return NextResponse.json(
      { success: false, error: "SERVER_ERROR", content: detail },
      { status: 500 }
    );
  }
}
