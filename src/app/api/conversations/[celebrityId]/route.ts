import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedUser } from "@/lib/supabase/server";
import { ErrorCode } from "@/lib/errors";
import { isSameOriginRequest } from "@/lib/request-security";

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(2000),
  timestamp: z.number().finite().positive(),
});

const syncSchema = z.object({
  language: z.enum(["zh", "en", "ja", "vi", "my"]),
  title: z.string().trim().max(120).default(""),
  messages: z.array(messageSchema).max(100),
});

type RouteContext = { params: Promise<{ celebrityId: string }> };

async function authorize() {
  const { supabase, user } = await getAuthenticatedUser();
  if (!supabase) return { response: NextResponse.json({ success: false, error: ErrorCode.CONFIGURATION_REQUIRED }, { status: 503 }) };
  if (!user) return { response: NextResponse.json({ success: false, error: ErrorCode.AUTH_REQUIRED }, { status: 401 }) };
  return { supabase, user };
}

export const dynamic = "force-dynamic";

export async function GET(_: NextRequest, context: RouteContext) {
  const auth = await authorize();
  if ("response" in auth) return auth.response;
  const { celebrityId } = await context.params;
  if (!/^[a-z0-9_-]{1,64}$/i.test(celebrityId)) {
    return NextResponse.json({ success: false, error: ErrorCode.INVALID_REQUEST }, { status: 400 });
  }

  const { data: conversation, error } = await auth.supabase
    .from("conversations")
    .select("id, language, title, updated_at")
    .eq("celebrity_id", celebrityId)
    .maybeSingle();
  if (error) return NextResponse.json({ success: false, error: ErrorCode.SERVER_ERROR }, { status: 500 });
  if (!conversation) return NextResponse.json({ success: true, conversation: null, messages: [] }, { headers: { "Cache-Control": "no-store" } });

  const { data: messages, error: messageError } = await auth.supabase
    .from("conversation_messages")
    .select("id, role, content, created_at")
    .eq("conversation_id", conversation.id)
    .order("sequence", { ascending: true });
  if (messageError) return NextResponse.json({ success: false, error: ErrorCode.SERVER_ERROR }, { status: 500 });

  return NextResponse.json(
    {
      success: true,
      conversation,
      messages: (messages ?? []).map((message: { id: string; role: "user" | "assistant"; content: string; created_at: string }) => ({
        id: message.id,
        role: message.role,
        content: message.content,
        timestamp: new Date(message.created_at).getTime(),
      })),
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function PUT(req: NextRequest, context: RouteContext) {
  if (!isSameOriginRequest(req)) return NextResponse.json({ success: false, error: ErrorCode.INVALID_ORIGIN }, { status: 403 });
  const auth = await authorize();
  if ("response" in auth) return auth.response;
  const { celebrityId } = await context.params;
  if (!/^[a-z0-9_-]{1,64}$/i.test(celebrityId)) {
    return NextResponse.json({ success: false, error: ErrorCode.INVALID_REQUEST }, { status: 400 });
  }

  const parsed = syncSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ success: false, error: ErrorCode.INVALID_REQUEST }, { status: 400 });
  const { messages, language, title } = parsed.data;
  const lastMessage = messages.at(-1)?.content.slice(0, 240) ?? "";

  const { data: conversation, error: upsertError } = await auth.supabase
    .from("conversations")
    .upsert(
      { user_id: auth.user.id, celebrity_id: celebrityId, language, title, last_message: lastMessage },
      { onConflict: "user_id,celebrity_id" }
    )
    .select("id")
    .single();
  if (upsertError || !conversation) return NextResponse.json({ success: false, error: ErrorCode.SERVER_ERROR }, { status: 500 });

  const { error: deleteError } = await auth.supabase
    .from("conversation_messages")
    .delete()
    .eq("conversation_id", conversation.id);
  if (deleteError) return NextResponse.json({ success: false, error: ErrorCode.SERVER_ERROR }, { status: 500 });

  if (messages.length > 0) {
    const { error: insertError } = await auth.supabase.from("conversation_messages").insert(
      messages.map((message, sequence) => ({
        conversation_id: conversation.id,
        user_id: auth.user.id,
        sequence,
        role: message.role,
        content: message.content,
      }))
    );
    if (insertError) return NextResponse.json({ success: false, error: ErrorCode.SERVER_ERROR }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  if (!isSameOriginRequest(req)) return NextResponse.json({ success: false, error: ErrorCode.INVALID_ORIGIN }, { status: 403 });
  const auth = await authorize();
  if ("response" in auth) return auth.response;
  const { celebrityId } = await context.params;
  const { error } = await auth.supabase.from("conversations").delete().eq("celebrity_id", celebrityId);
  if (error) return NextResponse.json({ success: false, error: ErrorCode.SERVER_ERROR }, { status: 500 });
  return NextResponse.json({ success: true });
}
