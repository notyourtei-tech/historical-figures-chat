import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedUser } from "@/lib/supabase/server";
import { ErrorCode } from "@/lib/errors";
import { isSameOriginRequest } from "@/lib/request-security";

const consentSchema = z.object({
  version: z.string().regex(/^20\d{2}-\d{2}-\d{2}$/),
  aiProcessing: z.boolean(),
  analytics: z.boolean(),
});

export async function PUT(request: NextRequest) {
  if (!isSameOriginRequest(request)) return NextResponse.json({ success: false, error: ErrorCode.INVALID_ORIGIN }, { status: 403 });
  const parsed = consentSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ success: false, error: ErrorCode.INVALID_REQUEST }, { status: 400 });

  const { supabase, user } = await getAuthenticatedUser();
  // Signed-out visitors keep consent locally; this endpoint intentionally does
  // not create a shadow identity or collect a device fingerprint.
  if (!supabase || !user) return NextResponse.json({ success: true, stored: "local" });

  const { error } = await supabase.from("privacy_consents").upsert({
    user_id: user.id,
    version: parsed.data.version,
    ai_processing: parsed.data.aiProcessing,
    analytics: parsed.data.analytics,
  });
  if (error) return NextResponse.json({ success: false, error: ErrorCode.SERVER_ERROR }, { status: 500 });
  return NextResponse.json({ success: true, stored: "cloud" });
}
