export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatResult {
  content: string;
  provider: string;
  model: string;
}

export type ChatStreamEvent =
  | { type: "delta"; content: string; provider: string; model: string }
  | { type: "complete"; provider: string; model: string };

const PLACEHOLDER_KEYS = new Set([
  "",
  "your-api-key-here",
  "your_openai_api_key_here",
  "sk-your-key-here",
]);

const REQUEST_TIMEOUT_MS = 55_000;

function isValidKey(key?: string): key is string {
  return !!key && !PLACEHOLDER_KEYS.has(key.trim());
}

interface ProviderSpec {
  name: string;
  apiKey: string;
  baseURL: string;
  models: string[];
  headers?: Record<string, string>;
}

function getProviderSpecs(): ProviderSpec[] {
  const providers: ProviderSpec[] = [];

  // 只保留 OpenRouter
  const openrouterKey = process.env.OPENROUTER_API_KEY;
  if (isValidKey(openrouterKey)) {
    providers.push({
      name: "openrouter",
      apiKey: openrouterKey,
      baseURL: "https://openrouter.ai/api/v1",
      models: [
        "google/gemma-4-31b-it:free",
        "nvidia/nemotron-3-super-120b-a12b:free",
        "tencent/hy3:free",
        "qwen/qwen3-coder:free",
        "meta-llama/llama-3.3-70b-instruct:free",
        "openai/gpt-oss-120b:free",
      ],
      headers: {
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "X-Title": "Ancient-Wisdom-Chat",
      },
    });
  }

  return providers;
}

export function getAIProviders() {
  return getProviderSpecs().map((p) => ({
    name: p.name,
    models: p.models,
  }));
}

async function requestCompletion(
  provider: ProviderSpec,
  model: string,
  messages: ChatMessage[],
  options?: { temperature?: number; max_tokens?: number }
): Promise<ChatResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${provider.baseURL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${provider.apiKey}`,
        "Content-Type": "application/json",
        ...(provider.headers || {}),
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: options?.temperature ?? 0.85,
        max_tokens: options?.max_tokens ?? 800,
      }),
      signal: controller.signal,
      cache: "no-store",
    });

    const raw = await response.text();

    if (!response.ok) {
      // 特别处理 429 错误，让它更容易被识别
      if (response.status === 429) {
        throw new Error(`RATE_LIMIT_429: ${raw.slice(0, 300)}`);
      }
      throw new Error(`${response.status} ${raw.slice(0, 300)}`);
    }

    const data = JSON.parse(raw) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content?.trim();

    if (!content) {
      throw new Error("AI_EMPTY_RESPONSE");
    }

    return { content, provider: provider.name, model };
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`REQUEST_TIMEOUT: ${provider.name}/${model}`);
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

export async function callChatCompletion(
  messages: ChatMessage[],
  options?: { temperature?: number; max_tokens?: number }
): Promise<ChatResult | null> {
  const providers = getProviderSpecs();
  if (providers.length === 0) return null;

  let lastError = "";
  let isRateLimited = false;

  for (const provider of providers) {
    for (const model of provider.models) {
      try {
        console.log(`[AI] Trying ${provider.name}/${model}`);
        const result = await requestCompletion(provider, model, messages, options);
        console.log(`[AI] Success with ${model}`);
        return result;
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : String(error);
        lastError = message;

        // 检查是否是速率限制错误
        if (message.startsWith("RATE_LIMIT_429:")) {
          isRateLimited = true;
          console.warn(`[AI] ${provider.name}/${model} rate limited, trying next...`);
        } else {
          console.warn(`[AI] ${provider.name}/${model} failed:`, message.slice(0, 160));
        }
      }
    }
  }

  if (isRateLimited) {
    throw new Error("RATE_LIMIT_EXCEEDED");
  }

  if (lastError) throw new Error(lastError);
  return null;
}

async function* requestCompletionStream(
  provider: ProviderSpec,
  model: string,
  messages: ChatMessage[],
  options?: { temperature?: number; max_tokens?: number }
): AsyncGenerator<ChatStreamEvent> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${provider.baseURL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${provider.apiKey}`,
        "Content-Type": "application/json",
        ...(provider.headers || {}),
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: options?.temperature ?? 0.85,
        max_tokens: options?.max_tokens ?? 800,
        stream: true,
      }),
      signal: controller.signal,
      cache: "no-store",
    });

    if (!response.ok || !response.body) {
      const raw = await response.text();
      if (response.status === 429) throw new Error(`RATE_LIMIT_429: ${raw.slice(0, 300)}`);
      throw new Error(`${response.status} ${raw.slice(0, 300)}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let receivedContent = false;

    const consumeLine = (line: string): string | null => {
      const payload = line.startsWith("data:") ? line.slice(5).trim() : "";
      if (!payload || payload === "[DONE]") return null;
      try {
        const parsed = JSON.parse(payload) as { choices?: Array<{ delta?: { content?: string } }> };
        return parsed.choices?.[0]?.delta?.content || null;
      } catch {
        return null;
      }
    };

    while (true) {
      const { done, value } = await reader.read();
      buffer += decoder.decode(value || new Uint8Array(), { stream: !done });
      const lines = buffer.split(/\r?\n/);
      buffer = done ? "" : (lines.pop() || "");
      for (const line of lines) {
        const content = consumeLine(line);
        if (content) {
          receivedContent = true;
          yield { type: "delta", content, provider: provider.name, model };
        }
      }
      if (done) break;
    }

    if (!receivedContent) throw new Error("AI_EMPTY_RESPONSE");
    yield { type: "complete", provider: provider.name, model };
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`REQUEST_TIMEOUT: ${provider.name}/${model}`);
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Starts the first available provider/model stream. Once a stream has emitted
 * content we never switch models mid-answer, which prevents two personas from
 * being spliced into a single chat bubble.
 */
export async function* streamChatCompletion(
  messages: ChatMessage[],
  options?: { temperature?: number; max_tokens?: number }
): AsyncGenerator<ChatStreamEvent> {
  const providers = getProviderSpecs();
  if (providers.length === 0) return;

  let lastError = "";
  for (const provider of providers) {
    for (const model of provider.models) {
      try {
        for await (const event of requestCompletionStream(provider, model, messages, options)) {
          yield event;
        }
        return;
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        lastError = message;
        // A partial reply is already visible to the user; never replace it.
        if (message && !message.startsWith("AI_EMPTY_RESPONSE")) {
          console.warn(`[AI] ${provider.name}/${model} stream failed:`, message.slice(0, 160));
        }
      }
    }
  }
  if (lastError) throw new Error(lastError);
}
