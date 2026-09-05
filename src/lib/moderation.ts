import { getSupabaseAdminClient } from "@/lib/supabase/server";
import type { ContentSafetyCategory } from "@/lib/content-safety";

/**
 * Stores category-level safety telemetry only. User text, IP addresses, and
 * content fingerprints are intentionally excluded.
 */
export async function recordModerationEvent(
  category: ContentSafetyCategory,
  action: "warn" | "block"
) {
  const admin = getSupabaseAdminClient();
  if (!admin) return;

  await admin.from("moderation_events").insert({ category, action, source: "chat" });
}
