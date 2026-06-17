import { Category, Era, Language } from "@/types";

export const LANGUAGE_LABELS: Record<Language, string> = {
  zh: "简体中文",
  en: "English",
  ja: "日本語",
  vi: "Tiếng Việt",
  my: "မြန်မာဘာသာ",
};

const CATEGORY_LABELS: Record<Category, Record<Language, string>> = {
  哲学家: { zh: "哲学家", en: "Philosopher", ja: "哲学者", vi: "Triết gia", my: "တွေးခေါ်ပညာရှင်" },
  科学家: { zh: "科学家", en: "Scientist", ja: "科学者", vi: "Nhà khoa học", my: "သိပ္ပံပညာရှင်" },
  文学家: { zh: "文学家", en: "Writer", ja: "文学者", vi: "Nhà văn", my: "စာပေရှင်" },
  政治家: { zh: "政治家", en: "Statesman", ja: "政治家", vi: "Chính khách", my: "နိုင်ငံရေးသမား" },
  军事家: { zh: "军事家", en: "Military Strategist", ja: "軍事家", vi: "Nhà quân sự", my: "စစ်ပညာရှင်" },
  企业家: { zh: "企业家", en: "Entrepreneur", ja: "実業家", vi: "Doanh nhân", my: "စီးပွားရေးသမား" },
  艺术家: { zh: "艺术家", en: "Artist", ja: "芸術家", vi: "Nghệ sĩ", my: "အနုပညာရှင်" },
  探险家: { zh: "探险家", en: "Explorer", ja: "探検家", vi: "Nhà thám hiểm", my: "စူးစမ်းရှာဖွေသူ" },
  神职人员: { zh: "神职人员", en: "Clergy", ja: "宗教家", vi: "Tôn giáo", my: "ဘာသာရေးသမား" },
  弈者: { zh: "弈者", en: "Go Master", ja: "棋士", vi: "Kỳ thủ", my: "ဂိုပညာရှင်" },
  智者: { zh: "智者", en: "Sage", ja: "智者", vi: "Trí giả", my: "ပညာရှိ" },
  政治军事领袖: { zh: "政治军事领袖", en: "Political-Military Leader", ja: "政治軍事指導者", vi: "Lãnh đạo chính trị-quân sự", my: "နိုင်ငံရေးစစ်ရေး ခေါင်းဆောင်" },
};

const ERA_LABELS: Record<Era, Record<Language, string>> = {
  上古: { zh: "上古", en: "Ancient", ja: "上古", vi: "Thượng cổ", my: "ရှေးခေတ်" },
  春秋: { zh: "春秋", en: "Spring & Autumn", ja: "春秋", vi: "Xuân Thu", my: "နွေဦးရာသီ" },
  战国: { zh: "战国", en: "Warring States", ja: "戦国", vi: "Chiến Quốc", my: "စစ်ပွဲခေတ်" },
  秦: { zh: "秦朝", en: "Qin Dynasty", ja: "秦", vi: "Nhà Tần", my: "ချင်မင်းဆက်" },
  古典时代: { zh: "古典时代", en: "Classical Era", ja: "古典時代", vi: "Thời cổ điển", my: "ဂန္ထဝင်ခေတ်" },
  古希腊: { zh: "古希腊", en: "Ancient Greece", ja: "古代ギリシャ", vi: "Hy Lạp cổ", my: "ရှေးဂရိ" },
  古罗马: { zh: "古罗马", en: "Ancient Rome", ja: "古代ローマ", vi: "La Mã cổ", my: "ရှေးရ" },
  中世纪: { zh: "中世纪", en: "Medieval", ja: "中世", vi: "Trung cổ", my: "အလယ်ခေတ်" },
  文艺复兴: { zh: "文艺复兴", en: "Renaissance", ja: "ルネサンス", vi: "Phục hưng", my: "ပြန်လည်မွေးမြူးရေးခေတ်" },
  启蒙运动: { zh: "启蒙运动", en: "Enlightenment", ja: "啓蒙", vi: "Khai sáng", my: "အလင်းရောင်ခေတ်" },
  近代: { zh: "近代", en: "Modern Era", ja: "近代", vi: "Cận đại", my: "နီးစပ်ခေတ်" },
  现代: { zh: "现代", en: "Contemporary", ja: "現代", vi: "Hiện đại", my: "ခေတ်သစ်" },
};

const INTEREST_LABELS: Record<string, Record<Language, string>> = {
  philosophy: { zh: "哲学", en: "Philosophy", ja: "哲学", vi: "Triết học", my: "တွေးခေါ်မှု" },
  science: { zh: "科学", en: "Science", ja: "科学", vi: "Khoa học", my: "သိပ္ပံ" },
  art: { zh: "艺术", en: "Art", ja: "芸術", vi: "Nghệ thuật", my: "အနုပညာ" },
  history: { zh: "历史", en: "History", ja: "歴史", vi: "Lịch sử", my: "သမိုင်း" },
  go: { zh: "围棋", en: "Go", ja: "囲碁", vi: "Cờ vây", my: "ဂို" },
  divination: { zh: "占卜/命运", en: "Divination", ja: "占い", vi: "Bói toán", my: "ဗေဒင်" },
  literature: { zh: "文学", en: "Literature", ja: "文学", vi: "Văn học", my: "စာပေ" },
  peace: { zh: "和平", en: "Peace", ja: "平和", vi: "Hòa bình", my: "ငြိမ်းချမ်းရေး" },
};

export function translateCategory(category: Category, language: Language): string {
  return CATEGORY_LABELS[category]?.[language] ?? category;
}

export function translateEra(era: Era, language: Language): string {
  return ERA_LABELS[era]?.[language] ?? era;
}

export function translateInterest(interestId: string, language: Language): string {
  return INTEREST_LABELS[interestId]?.[language] ?? interestId;
}

export const MBTI_TYPES = [
  "INTJ", "INTP", "ENTJ", "ENTP",
  "INFJ", "INFP", "ENFJ", "ENFP",
  "ISTJ", "ISFJ", "ESTJ", "ESFJ",
  "ISTP", "ISFP", "ESTP", "ESFP",
] as const;

export type MbtiType = (typeof MBTI_TYPES)[number];
