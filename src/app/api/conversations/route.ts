import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/server";
import { ErrorCode } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function GET() {
  const { supabase, user } = await getAuthenticatedUser();
  // Cloud sync is an opt-in enhancement. Guests and the zero-cost local mode
  // must not create a server error each time the chat page checks for history.
  if (!supabase || !user) {
    return NextResponse.json(
      { success: false, error: supabase ? ErrorCode.AUTH_REQUIRED : ErrorCode.CONFIGURATION_REQUIRED, storage: "local" },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  const { data, error } = await supabase
    .from("conversations")
    .select("celebrity_id, language, title, last_message, updated_at")
    .order("updated_at", { ascending: false })
    .limit(100);

  if (error) return NextResponse.json({ success: false, error: ErrorCode.SERVER_ERROR }, { status: 500 });
  return NextResponse.json({ success: true, conversations: data ?? [] }, { headers: { "Cache-Control": "no-store" } });
}
