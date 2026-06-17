import { NextRequest, NextResponse } from "next/server";
import { runGreeting } from "@/lib/ancient-chat";
import { Celebrity, Language } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const celebrity = body.celebrity as Celebrity;
    const language = (body.language as Language) || "zh";

    if (!celebrity?.id) {
      return NextResponse.json(
        { success: false, error: "INVALID_REQUEST" },
        { status: 400 }
      );
    }

    const result = await runGreeting(celebrity, language);
    return NextResponse.json(result);
  } catch (error: unknown) {
    const detail = error instanceof Error ? error.message : String(error);
    console.error("[API /greeting]", detail);
    return NextResponse.json(
      { success: false, error: "SERVER_ERROR", content: detail },
      { status: 500 }
    );
  }
}
