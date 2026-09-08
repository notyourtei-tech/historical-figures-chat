import { Celebrity, Message, Language } from "../types";
import { ErrorCode } from "../lib/errors";

type ChatApiResult = {
  success: boolean;
  content?: string;
  error?: string;
  retryAfterSeconds?: number;
};

export type ChatCapacity = {
  remaining: number;
  limit: number;
  isLow: boolean;
  resetAfterSeconds?: number;
};

// A warning leaves two requests in the current 20-request visitor window.
// This is not presented as an OpenRouter balance because that value is not
// available from the free router.
export const LOW_CHAT_CAPACITY_RATIO = 0.1;

function getChatCapacity(response: Response): ChatCapacity | null {
  const remaining = Number(response.headers.get("X-RateLimit-Remaining"));
  const limit = Number(response.headers.get("X-RateLimit-Limit"));
  const resetAfterSeconds = Number(response.headers.get("X-RateLimit-Reset-After"));
  if (!Number.isFinite(remaining) || !Number.isFinite(limit) || limit <= 0 || remaining < 0) return null;
  return {
    remaining,
    limit,
    isLow: remaining / limit <= LOW_CHAT_CAPACITY_RATIO,
    ...(Number.isFinite(resetAfterSeconds) && resetAfterSeconds > 0 ? { resetAfterSeconds } : {}),
  };
}

function getRetryAfterSeconds(response: Response): number | undefined {
  const value = Number(response.headers.get("Retry-After"));
  return Number.isFinite(value) && value > 0 ? value : undefined;
}

export class ChatApiError extends Error {
  constructor(
    public readonly code: string,
    public readonly detail?: string,
    public readonly retryAfterSeconds?: number
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
  const retryAfterSeconds = getRetryAfterSeconds(response);

  try {
    const data = JSON.parse(raw) as ChatApiResult;
    if (!response.ok && !data.error) {
      return { success: false, error: ErrorCode.SERVER_ERROR, content: `HTTP ${response.status}` };
    }
    return { ...data, ...(retryAfterSeconds ? { retryAfterSeconds } : {}) };
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

  throw new ChatApiError(result.error || ErrorCode.API_CALL_FAILED, result.content, result.retryAfterSeconds);
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
  onDelta: (content: string) => void,
  onCapacity?: (capacity: ChatCapacity) => void
): Promise<string> {
  const response = await fetch("/api/chat?stream=1", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
    body: JSON.stringify({ celebrity, messages, language }),
  });

  const capacity = getChatCapacity(response);
  if (capacity) onCapacity?.(capacity);

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/event-stream")) {
    const raw = await response.text();
    try {
      const data = JSON.parse(raw) as ChatApiResult;
      if (response.ok && data.success && data.content) {
        onDelta(data.content);
        return data.content;
      }
      throw new ChatApiError(data.error || ErrorCode.API_CALL_FAILED, data.content, getRetryAfterSeconds(response));
    } catch (error) {
      if (error instanceof ChatApiError) throw error;
      throw new ChatApiError(ErrorCode.INVALID_RESPONSE, raw);
    }
  }

  if (!response.ok || !response.body) {
    throw new ChatApiError(ErrorCode.SERVER_ERROR, `HTTP ${response.status}`, getRetryAfterSeconds(response));
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
        // A stream can remain HTTP 200 even when the provider rejects work
        // mid-stream. Preserve the route's real Retry-After header so the UI
        // never invents a recovery time.
        throw new ChatApiError(payload.error || ErrorCode.SERVER_ERROR, undefined, getRetryAfterSeconds(response));
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
