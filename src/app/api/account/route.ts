import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, getSupabaseAdminClient } from "@/lib/supabase/server";
import { ErrorCode } from "@/lib/errors";
import { captureOperationalError } from "@/lib/observability";
import { isSameOriginRequest } from "@/lib/request-security";

/** Permanently deletes the authenticated account and its cascade-linked chat data. */
export async function DELETE(request: NextRequest) {
  if (!isSameOriginRequest(request)) return NextResponse.json({ success: false, error: ErrorCode.INVALID_ORIGIN }, { status: 403 });
  const { user } = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ success: false, error: ErrorCode.AUTH_REQUIRED }, { status: 401 });
  const admin = getSupabaseAdminClient();
  if (!admin) return NextResponse.json({ success: false, error: ErrorCode.CONFIGURATION_REQUIRED }, { status: 503 });

  const { error } = await admin.auth.admin.deleteUser(user.id, true);
  if (error) {
    captureOperationalError(error, { route: "/api/account", operation: "delete_account" });
    return NextResponse.json({ success: false, error: ErrorCode.SERVER_ERROR }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
