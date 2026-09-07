import { Celebrity, Message, Language } from "../types";
import { ErrorCode } from "../lib/errors";

type ChatApiResult = {
  success: boolean;
  content?: string;
  error?: string;
};

export class ChatApiError extends Error {
  constructor(
    public readonly code: string,
    public readonly detail?: string
  ) {
    super(detail ? `${code}: ${detail}` : code);
    this.name = "ChatApiError";
  }
}

async function callChatApi(
  endpoint: "/api/chat" | "/api/greeting",
  body: Record<string, unknown>
): Promise<ChatApiResult> {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const raw = await response.text();

  try {
    const data = JSON.parse(raw) as ChatApiResult;
    if (!response.ok && !data.error) {
      return { success: false, error: ErrorCode.SERVER_ERROR, content: `HTTP ${response.status}` };
    }
    return data;
  } catch {
    return { success: false, error: ErrorCode.INVALID_RESPONSE, content: raw };
  }
}

export async function chatWithCelebrity(
  celebrity: Celebrity,
  messages: Message[],
  language: Language = "zh"
): Promise<string> {
  const result = await callChatApi("/api/chat", { celebrity, messages, language });

  if (result.success && result.content) {
    return result.content;
  }

  throw new ChatApiError(result.error || ErrorCode.API_CALL_FAILED, result.content);
}

type StreamPayload = {
  type?: "delta" | "complete" | "error";
  content?: string;
  error?: string;
};

/**
 * Reads the chat endpoint as Server-Sent Events. JSON is retained as a
 * compatibility fallback for older deployments and test doubles.
 */
export async function streamChatWithCelebrity(
  celebrity: Celebrity,
  messages: Message[],
  language: Language = "zh",
  onDelta: (content: string) => void
): Promise<string> {
  const response = await fetch("/api/chat?stream=1", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
    body: JSON.stringify({ celebrity, messages, language }),
  });

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/event-stream")) {
    const raw = await response.text();
    try {
      const data = JSON.parse(raw) as ChatApiResult;
      if (response.ok && data.success && data.content) {
        onDelta(data.content);
        return data.content;
      }
      throw new ChatApiError(data.error || ErrorCode.API_CALL_FAILED, data.content);
    } catch (error) {
      if (error instanceof ChatApiError) throw error;
      throw new ChatApiError(ErrorCode.INVALID_RESPONSE, raw);
    }
  }

  if (!response.ok || !response.body) {
    throw new ChatApiError(ErrorCode.SERVER_ERROR, `HTTP ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let content = "";

  const consumeEvent = (event: string) => {
    const dataLine = event.split(/\r?\n/).find((line) => line.startsWith("data:"));
    if (!dataLine) return;
    try {
      const payload = JSON.parse(dataLine.slice(5).trim()) as StreamPayload;
      if (payload.type === "delta" && payload.content) {
        content += payload.content;
        onDelta(payload.content);
      }
      if (payload.type === "error") {
        throw new ChatApiError(payload.error || ErrorCode.SERVER_ERROR);
      }
    } catch (error) {
      if (error instanceof ChatApiError) throw error;
      throw new ChatApiError(ErrorCode.INVALID_RESPONSE, "Malformed streaming response");
    }
  };

  while (true) {
    const { value, done } = await reader.read();
    buffer += decoder.decode(value || new Uint8Array(), { stream: !done });
    const events = buffer.split(/\r?\n\r?\n/);
    buffer = done ? "" : (events.pop() || "");
    for (const event of events) consumeEvent(event);
    if (done) break;
  }

  if (!content) throw new ChatApiError(ErrorCode.INVALID_RESPONSE, "Empty streaming response");
  return content;
}

export async function getInitialGreeting(
  celebrity: Celebrity,
  language: Language = "zh"
): Promise<string> {
  const result = await callChatApi("/api/greeting", { celebrity, language });
  if (result.success && result.content) {
    return result.content;
  }
  const fallbacks: Record<Language, string> = {
    zh: `${celebrity.name.zh}向你致意。`,
    en: `${celebrity.name.en} greets you.`,
    ja: `${celebrity.name.ja}があなたに挨拶します。`,
    vi: `${celebrity.name.vi} gửi lời chào.`,
    my: `${celebrity.name.my} က သင့်အား နှုတ်ဆက်ပါတယ်။`,
  };
  return fallbacks[language] || fallbacks.en;
}
