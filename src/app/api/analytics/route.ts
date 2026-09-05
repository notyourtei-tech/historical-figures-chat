import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ANALYTICS_EVENTS } from "@/lib/analytics-events";
import { getSupabaseAdminClient, getAuthenticatedUser } from "@/lib/supabase/server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { isSameOriginRequest } from "@/lib/request-security";

const primitive = z.union([z.string().max(80), z.number().finite(), z.boolean()]);
const eventSchema = z.object({
  eventName: z.enum(ANALYTICS_EVENTS),
  anonymousId: z.string().uuid(),
  properties: z.record(z.string().max(40), primitive).default({}),
});

export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request)) return new NextResponse(null, { status: 403 });
  const { allowed } = await rateLimit(getClientIp(request.headers), 60, 60_000);
  if (!allowed) return new NextResponse(null, { status: 429 });

  const parsed = eventSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return new NextResponse(null, { status: 204 });

  const admin = getSupabaseAdminClient();
  // Analytics is optional by design. Do not fail the user flow when it is off.
  if (!admin) return new NextResponse(null, { status: 204 });
  const { user } = await getAuthenticatedUser();
  await admin.from("analytics_events").insert({
    user_id: user?.id ?? null,
    anonymous_id: parsed.data.anonymousId,
    event_name: parsed.data.eventName,
    properties: parsed.data.properties,
  });
  return new NextResponse(null, { status: 204 });
}
