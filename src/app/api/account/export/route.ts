import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/server";
import { ErrorCode } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function GET() {
  const { supabase, user } = await getAuthenticatedUser();
  if (!supabase || !user) return NextResponse.json({ success: false, error: ErrorCode.AUTH_REQUIRED }, { status: 401 });

  const [{ data: conversations, error: conversationError }, { data: consent, error: consentError }] = await Promise.all([
    supabase
      .from("conversations")
      .select("celebrity_id, language, title, last_message, created_at, updated_at, conversation_messages(role, content, sequence, created_at)")
      .order("updated_at", { ascending: false }),
    supabase.from("privacy_consents").select("version, ai_processing, analytics, updated_at").maybeSingle(),
  ]);
  if (conversationError || consentError) return NextResponse.json({ success: false, error: ErrorCode.SERVER_ERROR }, { status: 500 });

  const document = {
    exportedAt: new Date().toISOString(),
    format: "wan-gu-ling-xi-user-export/v1",
    account: { id: user.id, createdAt: user.created_at },
    privacyConsent: consent,
    conversations: conversations ?? [],
  };
  return new NextResponse(JSON.stringify(document, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": 'attachment; filename="wan-gu-ling-xi-export.json"',
      "Cache-Control": "no-store",
    },
  });
}
