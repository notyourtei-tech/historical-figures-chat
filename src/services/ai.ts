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

  const raw = await response.text();

  try {
    const data = JSON.parse(raw) as ChatApiResult;
    if (!response.ok && !data.error) {
      return { success: false, error: "SERVER_ERROR", content: `HTTP ${response.status}` };
    }
    return data;
  } catch {
    return { success: false, error: "INVALID_RESPONSE", content: raw };
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

  const errorMsgs: Record<string, Record<Language, string>> = {
    MISSING_API_KEY: {
      zh: "【系统提示】请在 .env.local 中配置 API Key（OPENROUTER_API_KEY 或 DEEPSEEK_API_KEY），保存后重启开发服务器。",
      en: "[System] Please configure API Key in .env.local (OPENROUTER_API_KEY or DEEPSEEK_API_KEY), then restart dev server.",
      ja: "【システム】.env.local に API Key を設定し、開発サーバーを再起動してください。",
      vi: "[Hệ thống] Vui lòng cấu hình API Key trong .env.local và khởi động lại server.",
      my: "[စနစ်] .env.local တွင် API Key ထည့်ပြီး server ကို ပြန်စတင်ပါ။"
    },
    API_CALL_FAILED: {
      zh: `【连接失败】${result.content || "AI API 请求失败，请检查网络或 API Key 配置。"}`,
      en: `[Connection Failed] ${result.content || "AI API request failed. Check network or API Key."}`,
      ja: `【接続失敗】${result.content || "AI API リクエストに失敗しました。"}`,
      vi: `[Kết nối thất bại] ${result.content || "Yêu cầu AI API thất bại."}`,
      my: `[ချိတ်ဆက်မှုမအောင်မြင်] ${result.content || "AI API တောင်းဆိုမှုမအောင်မြင်ပါ။"}`
    },
    INVALID_RESPONSE: {
      zh: "【响应错误】API 返回了无效响应，请稍后重试。",
      en: "[Response Error] API returned invalid response. Please try again later.",
      ja: "【応答エラー】API から無効な応答が返されました。",
      vi: "[Lỗi phản hồi] API trả về phản hồi không hợp lệ.",
      my: "[တုံ့ပြန်မှုအမှား] API က မှားယွင်းတဲ့တုံ့ပြန်မှုပြန်ပေးလိုက်ပါတယ်။"
    }
  };

  const errorType = result.error || "API_CALL_FAILED";
  return errorMsgs[errorType]?.[language] || errorMsgs.API_CALL_FAILED[language];
}

export async function getInitialGreeting(
  celebrity: Celebrity,
  language: Language = "zh"
): Promise<string | null> {
  const result = await callChatApi("/api/greeting", { celebrity, language });
  if (result.success && result.content) {
    return result.content;
  }
  return null;
}
