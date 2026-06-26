import { Celebrity, Message, Language } from "../types";
import { ErrorCode } from "../lib/errors";

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
      return { success: false, error: ErrorCode.SERVER_ERROR, content: `HTTP ${response.status}` };
    }
    return data;
  } catch {
    return { success: false, error: ErrorCode.INVALID_RESPONSE, content: raw };
  }
}

const errorMsgs: Record<string, Record<Language, string>> = {
  [ErrorCode.MISSING_API_KEY]: {
    zh: "【系统提示】请在 .env.local 中配置 API Key（OPENROUTER_API_KEY），保存后重启开发服务器。",
    en: "[System] Please configure API Key in .env.local (OPENROUTER_API_KEY), then restart dev server.",
    ja: "【システム】.env.local に API Key を設定し、開発サーバーを再起動してください。",
    vi: "[Hệ thống] Vui lòng cấu hình API Key trong .env.local và khởi động lại server.",
    my: "[စနစ်] .env.local တွင် API Key ထည့်ပြီး server ကို ပြန်စတင်ပါ။"
  },
  [ErrorCode.API_CALL_FAILED]: {
    zh: "AI API 请求失败，请检查网络或 API Key 配置。",
    en: "AI API request failed. Check network or API Key.",
    ja: "AI API リクエストに失敗しました。ネットワークまたは API Key の設定を確認してください。",
    vi: "Yêu cầu AI API thất bại. Vui lòng kiểm tra mạng hoặc cấu hình API Key.",
    my: "AI API တောင်းဆိုမှုမအောင်မြင်ပါ။ ကွန်ရက် သို့မဟုတ် API Key ကို စစ်ဆေးပါ။"
  },
  [ErrorCode.INVALID_RESPONSE]: {
    zh: "【响应错误】API 返回了无效响应，请稍后重试。",
    en: "[Response Error] API returned invalid response. Please try again later.",
    ja: "【応答エラー】API から無効な応答が返されました。",
    vi: "[Lỗi phản hồi] API trả về phản hồi không hợp lệ.",
    my: "[တုံ့ပြန်မှုအမှား] API က မှားယွင်းတဲ့တုံ့ပြန်မှုပြန်ပေးလိုက်ပါတယ်။"
  },
  [ErrorCode.RATE_LIMIT]: {
    zh: "请求过于频繁，请稍后再试。",
    en: "Too many requests. Please try again later.",
    ja: "リクエストが多すぎます。少し待ってから再試行してください。",
    vi: "Quá nhiều yêu cầu. Vui lòng thử lại sau.",
    my: "တောင်းဆိုမှုများလွန်းပါသည်။ နောက်မှ ထပ်ကြိုးစားပါ။"
  },
};

export async function chatWithCelebrity(
  celebrity: Celebrity,
  messages: Message[],
  language: Language = "zh"
): Promise<string> {
  const result = await callChatApi("/api/chat", { celebrity, messages, language });

  if (result.success && result.content) {
    return result.content;
  }

  const errorType = result.error || ErrorCode.API_CALL_FAILED;
  const baseMsg = errorMsgs[errorType]?.[language] || errorMsgs[ErrorCode.API_CALL_FAILED][language];
  const prefix = errorType === ErrorCode.API_CALL_FAILED ? "【连接失败】" : "";
  const detail = result.content ? `\n${result.content}` : "";
  return `${prefix}${baseMsg}${detail}`;
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
