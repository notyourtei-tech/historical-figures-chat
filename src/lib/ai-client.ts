export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatResult {
  content: string;
  provider: string;
  model: string;
}

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

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
        "meta-llama/llama-3.3-70b-instruct:free",
        "qwen/qwen3-coder:free",
        "google/gemma-4-31b-it:free",
        "nousresearch/hermes-3-llama-3.1-405b:free",
        "nvidia/nemotron-3-super-120b-a12b:free",
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
