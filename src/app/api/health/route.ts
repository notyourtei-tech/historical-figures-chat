import { NextResponse } from "next/server";
import { getSupabasePublicConfig } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

export function GET() {
  const authConfigured = Boolean(getSupabasePublicConfig());
  // The chat client deliberately supports OpenRouter only. Use the exact same
  // key here so the operational status cannot report a false positive.
  const aiConfigured = Boolean(process.env.OPENROUTER_API_KEY);
  const aiMode = process.env.HISTORICAL_CHAT_MODE === "online"
    ? (aiConfigured ? "online" : "misconfigured")
    : "offline";
  return NextResponse.json(
    {
      status: "ok",
      timestamp: new Date().toISOString(),
      checks: {
        web: "ok",
        auth: authConfigured ? "configured" : "not_configured",
        ai: aiMode,
      },
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
