"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabasePublicConfig } from "@/lib/supabase/config";

let browserClient: SupabaseClient | null | undefined;

/**
 * Returns null until a Supabase project is configured. This lets the public
 * browsing experience remain available while deployments are being set up.
 */
export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (browserClient !== undefined) return browserClient;

  const config = getSupabasePublicConfig();
  browserClient = config
    ? createBrowserClient(config.url, config.publishableKey)
    : null;
  return browserClient;
}
