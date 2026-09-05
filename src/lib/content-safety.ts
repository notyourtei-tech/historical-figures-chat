import { createHash } from "crypto";
import type { Language } from "@/types";

export type ContentSafetyCategory =
  | "sexual_content_involving_minors"
  | "self_harm_or_suicide"
  | "credible_violent_threat"
  | "personal_data";

export type ContentSafetyResult =
  | { action: "allow" }
  | { action: "block"; category: ContentSafetyCategory; message: string };

const minorPattern = /(未成年|儿童|小孩|幼女|幼童|未滿|未满|minor|child|under\s*18|teen)/i;
const sexualPattern = /(性行为|性交|裸照|裸聊|色情|强奸|猥亵|sex(?:ual)?|nude|porn|rape)/i;
const selfHarmPattern = /(自杀|自殘|自残|结束生命|不想活|割腕|suicide|kill\s+myself|self[-\s]?harm)/i;
const threatPattern = /(我要杀|去杀|炸掉|枪杀|捅死|kill\s+(?:him|her|them|someone)|shoot\s+(?:him|her|them|someone)|bomb\s+(?:the|a))/i;
const personalDataPattern = /(?:\b1\d{10}\b|\b\d{3}[-\s]?\d{3}[-\s]?\d{4}\b|\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b|身份证|护照号|银行卡号)/i;

const supportMessages: Record<Language, string> = {
  zh: "我很在意你的安全。若你可能马上伤害自己，请立即联系当地紧急服务，或联系你信任的人陪在身边。你也可以拨打当地心理危机干预热线；在美国/加拿大可拨打或短信 988。我们可以先慢慢说说此刻发生了什么。",
  en: "Your safety matters. If you may hurt yourself now, contact local emergency services or a trusted person who can stay with you. In the US and Canada, call or text 988. We can also take this one moment at a time.",
  ja: "あなたの安全が最優先です。今すぐ自分を傷つけるおそれがあるなら、地域の緊急サービスや信頼できる人に連絡してください。今ここで、何が起きているかを少しずつ話しても大丈夫です。",
  vi: "Sự an toàn của bạn là quan trọng. Nếu bạn có thể làm hại bản thân ngay bây giờ, hãy liên hệ dịch vụ khẩn cấp địa phương hoặc một người đáng tin cậy ở bên bạn. Chúng ta có thể nói từng chút về điều đang xảy ra.",
  my: "သင့်လုံခြုံရေးက အရေးကြီးပါတယ်။ ယခုအချိန်တွင် ကိုယ့်ကိုယ်ကို ထိခိုက်စေနိုင်မည်ဆိုပါက ဒေသဆိုင်ရာ အရေးပေါ်ဝန်ဆောင်မှု သို့မဟုတ် ယုံကြည်ရသူတစ်ဦးကို ချက်ချင်းဆက်သွယ်ပါ။ ဖြစ်နေသမျှကို တစ်ဆင့်ချင်း ပြောနိုင်ပါတယ်။",
};

const blockedMessages: Record<Language, string> = {
  zh: "这条内容不能由本应用继续处理。请勿发送涉及未成年人性内容或对他人的具体暴力威胁的信息。",
  en: "This content cannot be processed here. Do not send sexual content involving minors or specific violent threats.",
  ja: "この内容は本アプリでは処理できません。未成年者を含む性的内容や具体的な暴力的脅迫は送信しないでください。",
  vi: "Nội dung này không thể được xử lý tại đây. Không gửi nội dung tình dục liên quan đến trẻ vị thành niên hoặc đe dọa bạo lực cụ thể.",
  my: "ဤအကြောင်းအရာကို ဤအက်ပ်တွင် ဆက်လက်လုပ်ဆောင်၍မရပါ။ အရွယ်မရောက်သေးသူဆိုင်ရာ လိင်ပိုင်းအကြောင်းအရာ သို့မဟုတ် သီးခြားအကြမ်းဖက်ခြိမ်းခြောက်မှုကို မပို့ပါနှင့်။",
};

const personalDataMessages: Record<Language, string> = {
  zh: "为保护你的隐私，请先移除手机号、邮箱、证件号、银行卡号或其他个人敏感信息，再继续对话。",
  en: "To protect your privacy, remove phone numbers, email addresses, identity or bank details before continuing.",
  ja: "プライバシー保護のため、電話番号、メールアドレス、身分証・銀行情報などを削除してから続けてください。",
  vi: "Để bảo vệ quyền riêng tư, hãy xóa số điện thoại, email, giấy tờ tùy thân hoặc thông tin ngân hàng trước khi tiếp tục.",
  my: "သင့်ကိုယ်ရေးလုံခြုံမှုအတွက် ဖုန်းနံပါတ်၊ အီးမေးလ်၊ မှတ်ပုံတင် သို့မဟုတ် ဘဏ်အချက်အလက်ကို ဖယ်ရှားပြီးမှ ဆက်လက်ပြောဆိုပါ။",
};

export function assessContentSafety(content: string, language: Language): ContentSafetyResult {
  if (minorPattern.test(content) && sexualPattern.test(content)) {
    return { action: "block", category: "sexual_content_involving_minors", message: blockedMessages[language] };
  }
  if (selfHarmPattern.test(content)) {
    return { action: "block", category: "self_harm_or_suicide", message: supportMessages[language] };
  }
  if (threatPattern.test(content)) {
    return { action: "block", category: "credible_violent_threat", message: blockedMessages[language] };
  }
  if (personalDataPattern.test(content)) {
    return { action: "block", category: "personal_data", message: personalDataMessages[language] };
  }
  return { action: "allow" };
}

/** A non-reversible identifier for safety telemetry; never store message text. */
export function contentFingerprint(content: string): string {
  return createHash("sha256").update(content).digest("hex");
}
