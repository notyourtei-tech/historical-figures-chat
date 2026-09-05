import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/server";
import { ErrorCode } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function GET() {
  const { supabase, user } = await getAuthenticatedUser();
  if (!supabase) {
    return NextResponse.json({ success: false, error: ErrorCode.CONFIGURATION_REQUIRED }, { status: 503 });
  }
  if (!user) return NextResponse.json({ success: false, error: ErrorCode.AUTH_REQUIRED }, { status: 401 });

  const { data, error } = await supabase
    .from("conversations")
    .select("celebrity_id, language, title, last_message, updated_at")
    .order("updated_at", { ascending: false })
    .limit(100);

  if (error) return NextResponse.json({ success: false, error: ErrorCode.SERVER_ERROR }, { status: 500 });
  return NextResponse.json({ success: true, conversations: data ?? [] }, { headers: { "Cache-Control": "no-store" } });
}
