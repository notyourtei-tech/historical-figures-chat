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
    zh: "【系统提示】未检测到 API Key（OPENROUTER_API_KEY）。请在环境变量中配置后重启服务。可在 openrouter.ai 免费获取。",
    en: "[System] API Key not configured (OPENROUTER_API_KEY). Set it in your environment variables and restart. Get a free key at openrouter.ai.",
    ja: "【システム】API Key（OPENROUTER_API_KEY）が設定されていません。環境変数に設定して再起動してください。openrouter.ai で無料取得できます。",
    vi: "[Hệ thống] Chưa cấu hình API Key (OPENROUTER_API_KEY). Hãy thiết lập trong biến môi trường và khởi động lại. Lấy key miễn phí tại openrouter.ai.",
    my: "[စနစ်] API Key (OPENROUTER_API_KEY) မတွေ့ပါ။ ပတ်ဝန်းကျင် variable တွင် ထည့်ပြီး ပြန်စတင်ပါ။ openrouter.ai တွင် အခမဲ့ရယူနိုင်ပါသည်။"
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
