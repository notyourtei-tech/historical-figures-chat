import { Celebrity, Message, Language } from "../types";

type ChatApiResult = {
  success: boolean;
  content?: string;
  error?: string;
};

async function callChatApi(
  endpoint: "/api/chat" | "/api/greeting",
  body: Record<string, unknown>
): Promise<ChatApiResult> {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = (await response.json()) as ChatApiResult;
  if (!response.ok && !data.error) {
    return { success: false, error: "SERVER_ERROR", content: `HTTP ${response.status}` };
  }
  return data;
}

function formatError(language: Language, error?: string, detail?: string): string {
  const errorDetail = detail ? `\n(${detail})` : "";

  if (error === "MISSING_API_KEY") {
    const messages: Record<Language, string> = {
      zh: `【灵犀未启】请在 .env.local 中配置 API Key（OPENROUTER_API_KEY 或 DEEPSEEK_API_KEY），保存后重启 npm run dev。${errorDetail}`,
      en: `[Soul Unbound] Configure API Key in .env.local (OPENROUTER_API_KEY or DEEPSEEK_API_KEY), then restart npm run dev.${errorDetail}`,
      ja: `【霊感未踏】.env.local に API Key を設定し、npm run dev を再起動してください。${errorDetail}`,
      vi: `[Linh hồn chưa mở] Cấu hình API Key trong .env.local và khởi động lại npm run dev.${errorDetail}`,
      my: `[ဝိညာဉ်မနိုးသေးပါ] .env.local တွင် API Key ထည့်ပြီး npm run dev ကို restart လုပ်ပါ။${errorDetail}`,
    };
    return messages[language];
  }

  const messages: Record<Language, string> = {
    zh: `【灵犀受阻】AI 连接失败，请检查网络或 API 配置。${errorDetail}`,
    en: `[Soul Blocked] AI connection failed. Check network or API config.${errorDetail}`,
    ja: `【霊感遮断】AI 接続に失敗しました。${errorDetail}`,
    vi: `[Linh hồn bị chặn] Kết nối AI thất bại.${errorDetail}`,
    my: `[ဝိညာဉ်ပိတ်ဆို့နေသည်] AI ချိတ်ဆက်မှု မအောင်မြင်ပါ။${errorDetail}`,
  };
  return messages[language];
}

export async function chatWithCelebrity(
  celebrity: Celebrity,
  messages: Message[],
  language: Language = "zh"
) {
  try {
    const result = await callChatApi("/api/chat", { celebrity, messages, language });

    if (result.success && result.content) {
      return result.content;
    }

    return formatError(language, result.error, result.content);
  } catch (error: unknown) {
    console.error("AI Chat Error:", error);
    const detail = error instanceof Error ? error.message : String(error);
    return formatError(language, "SERVER_ERROR", detail);
  }
}

export async function getInitialGreeting(
  celebrity: Celebrity,
  language: Language = "zh"
) {
  try {
    const result = await callChatApi("/api/greeting", { celebrity, language });
    if (result.success && result.content) {
      return result.content;
    }
    return null;
  } catch (error) {
    console.error("Initial Greeting Error:", error);
    return null;
  }
}
