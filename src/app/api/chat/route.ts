import { NextRequest, NextResponse } from "next/server";
import { runChat } from "@/lib/ancient-chat";
import { Celebrity, Language, Message } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const celebrity = body.celebrity as Celebrity;
    const messages = body.messages as Message[];
    const language = (body.language as Language) || "zh";

    if (!celebrity?.id || !Array.isArray(messages)) {
      return NextResponse.json(
        { success: false, error: "INVALID_REQUEST" },
        { status: 400 }
      );
    }

    const result = await runChat(celebrity, messages, language);
    return NextResponse.json(result);
  } catch (error: unknown) {
    const detail = error instanceof Error ? error.message : String(error);
    console.error("[API /chat]", detail);
    return NextResponse.json(
      { success: false, error: "SERVER_ERROR", content: detail },
      { status: 500 }
    );
  }
}
