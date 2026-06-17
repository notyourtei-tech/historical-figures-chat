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

interface ProviderSpec {
  name: string;
  apiKey: string;
  baseURL: string;
  models: string[];
  headers?: Record<string, string>;
}

function getProviderSpecs(): ProviderSpec[] {
  const providers: ProviderSpec[] = [];

  const openrouterKey = process.env.OPENROUTER_API_KEY;
  if (isValidKey(openrouterKey)) {
    providers.push({
      name: "openrouter",
      apiKey: openrouterKey,
      baseURL: "https://openrouter.ai/api/v1",
      models: [
        process.env.OPENROUTER_MODEL || "google/gemma-4-26b-a4b-it:free",
        "google/gemma-4-31b-it:free",
        "openrouter/free",
        "liquid/lfm-2.5-1.2b-instruct:free",
      ],
      headers: {
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "X-Title": "Ancient Wisdom Chat",
      },
    });
  }

  const deepseekKey =
    process.env.DEEPSEEK_API_KEY || process.env.VITE_AI_API_KEY;
  if (isValidKey(deepseekKey)) {
    providers.push({
      name: "deepseek",
      apiKey: deepseekKey,
      baseURL:
        process.env.DEEPSEEK_BASE_URL ||
        process.env.VITE_AI_BASE_URL ||
        "https://api.deepseek.com/v1",
      models: [
        process.env.DEEPSEEK_MODEL ||
          process.env.VITE_AI_MODEL ||
          "deepseek-chat",
      ],
    });
  }

  const openaiKey = process.env.OPENAI_API_KEY;
  if (isValidKey(openaiKey)) {
    providers.push({
      name: "openai",
      apiKey: openaiKey,
      baseURL: "https://api.openai.com/v1",
      models: [process.env.OPENAI_MODEL || "gpt-4o-mini"],
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
      throw new Error(`${response.status} ${raw.slice(0, 300)}`);
    }

    const data = JSON.parse(raw) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content?.trim();

    if (!content) {
      throw new Error("AI 返回空内容");
    }

    return { content, provider: provider.name, model };
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`请求超时（${REQUEST_TIMEOUT_MS / 1000}s）: ${provider.name}/${model}`);
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

  for (const provider of providers) {
    for (const model of provider.models) {
      try {
        console.log(`[AI] 尝试 ${provider.name}/${model}`);
        return await requestCompletion(provider, model, messages, options);
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : String(error);
        lastError = message;
        console.warn(`[AI] ${provider.name}/${model} 失败:`, message.slice(0, 160));
      }
    }
  }

  if (lastError) throw new Error(lastError);
  return null;
}
