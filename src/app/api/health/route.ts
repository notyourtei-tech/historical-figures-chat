import { NextResponse } from "next/server";
import { getSupabasePublicConfig } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

export function GET() {
  const authConfigured = Boolean(getSupabasePublicConfig());
  const aiConfigured = Boolean(process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY || process.env.DEEPSEEK_API_KEY);
  return NextResponse.json(
    {
      status: "ok",
      timestamp: new Date().toISOString(),
      checks: {
        web: "ok",
        auth: authConfigured ? "configured" : "not_configured",
        ai: aiConfigured ? "configured" : "not_configured",
      },
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
