import { Language } from "@/types";

export type MbtiDimension = "E" | "I" | "S" | "N" | "T" | "F" | "J" | "P";

export interface MbtiQuestion {
  id: number;
  question: Record<Language, string>;
  options: [
    { label: Record<Language, string>; value: MbtiDimension },
    { label: Record<Language, string>; value: MbtiDimension },
  ];
}

export const MBTI_QUESTIONS: MbtiQuestion[] = [
  {
    id: 1,
    question: {
      zh: "参加聚会后，你通常感觉？",
      en: "After a social gathering, you usually feel?",
      ja: "集まりの後、あなたは通常どう感じますか？",
      vi: "Sau buổi gặp gỡ, bạn thường cảm thấy?",
      my: "လူမှုအဖွဲ့အစည်းပြီးနောက် သင်ဘာခံစားရလဲ?",
    },
    options: [
      { label: { zh: "精力充沛，想继续交流", en: "Energized, want more interaction", ja: "元気になり、もっと交流したい", vi: "Tràn đầy năng lượng", my: "စွမ်းအားပြည့်ဝသည်" }, value: "E" },
      { label: { zh: "有些疲惫，需要独处恢复", en: "Tired, need alone time", ja: "疲れて、一人の時間が必要", vi: "Mệt mỏi, cần ở một mình", my: "ပင်ပန်းပြီး တစ်ယောက်တည်း လိုသည်" }, value: "I" },
    ],
  },
  {
    id: 2,
    question: {
      zh: "你更喜欢哪种学习方式？",
      en: "Which learning style do you prefer?",
      ja: "どの学び方を好みますか？",
      vi: "Bạn thích cách học nào?",
      my: "မည်သည့်သင်ယူမှုနည်းလမ်းကို ကြိုက်သလဲ?",
    },
    options: [
      { label: { zh: "与人讨论、实践体验", en: "Discussing and hands-on practice", ja: "議論と実践", vi: "Thảo luận và thực hành", my: "ဆွေးနွေးခြင်းနှင့် လက်တွေ့" }, value: "E" },
      { label: { zh: "独自阅读、深入思考", en: "Reading alone and deep reflection", ja: "一人で読み、深く考える", vi: "Đọc một mình và suy ngẫm", my: "တစ်ယောက်တည်း ဖတ်ပြီး တွေးတောခြင်း" }, value: "I" },
    ],
  },
  {
    id: 3,
    question: {
      zh: "遇到新朋友时，你倾向于？",
      en: "When meeting new people, you tend to?",
      ja: "新しい人に会うとき、あなたは？",
      vi: "Khi gặp người mới, bạn thường?",
      my: "သူငယ်ချင်းအသစ်တွေ့ရင်?",
    },
    options: [
      { label: { zh: "主动开口，热情交流", en: "Start conversations warmly", ja: "積極的に話しかける", vi: "Chủ động trò chuyện", my: "စကားစပြောသည်" }, value: "E" },
      { label: { zh: "先观察，再慢慢熟悉", en: "Observe first, warm up slowly", ja: "まず観察し、ゆっくり慣れる", vi: "Quan sát trước, làm quen từ từ", my: "စောင့်ကြည့်ပြီးဖြည်းချဉ်သည်" }, value: "I" },
    ],
  },
  {
    id: 4,
    question: {
      zh: "你更关注事物的？",
      en: "You focus more on?",
      ja: "あなたは何に注目しますか？",
      vi: "Bạn chú ý hơn đến?",
      my: "သင်ဘာကို ပိုအာရုံစိုက်လဲ?",
    },
    options: [
      { label: { zh: "具体事实与细节", en: "Concrete facts and details", ja: "具体的な事実と詳細", vi: "Sự kiện và chi tiết cụ thể", my: "အချက်အလက်နှင့် အသေးစိတ်" }, value: "S" },
      { label: { zh: "整体模式与可能性", en: "Patterns and possibilities", ja: "パターンと可能性", vi: "Mô hình và khả năng", my: "ပုံစံနှင့် ဖြစ်နိုင်ချေ" }, value: "N" },
    ],
  },
  {
    id: 5,
    question: {
      zh: "阅读历史故事时，你更被什么吸引？",
      en: "When reading history, what draws you more?",
      ja: "歴史を読むとき、何に惹かれますか？",
      vi: "Khi đọc lịch sử, điều gì thu hút bạn?",
      my: "သမိုင်းကို ဖတ်ရင် ဘာက ဆွဲဆောင်လဲ?",
    },
    options: [
      { label: { zh: "真实事件与人物经历", en: "Real events and lived experiences", ja: "実際の出来事と経験", vi: "Sự kiện thật và trải nghiệm", my: "အမှန်တကယ် ဖြစ်ရပ်များ" }, value: "S" },
      { label: { zh: "思想寓意与未来启示", en: "Ideas, symbolism, and future insight", ja: "思想、象徴、未来への示唆", vi: "Tư tưởng và ý nghĩa", my: "အတွေးအခေါ်နှင့် အဓိပ္ပာယ်" }, value: "N" },
    ],
  },
  {
    id: 6,
    question: {
      zh: "解决问题时，你更依赖？",
      en: "When solving problems, you rely more on?",
      ja: "問題解決で何を頼りにしますか？",
      vi: "Khi giải quyết vấn đề, bạn dựa vào?",
      my: "ပြဿနာဖြေရှင်းရင် ဘာကို အားကိုးလဲ?",
    },
    options: [
      { label: { zh: "过往经验与可行方法", en: "Past experience and proven methods", ja: "経験と実証済みの方法", vi: "Kinh nghiệm và phương pháp đã chứng minh", my: "အတွေ့အကြုံနှင့် စမ်းသပ်ထားသော နည်းလမ်း" }, value: "S" },
      { label: { zh: "直觉联想与创新思路", en: "Intuition and creative approaches", ja: "直感と創造的な発想", vi: "Trực giác và sáng tạo", my: "အင်တူစစ်နှင့် ဖန်တီးမှု" }, value: "N" },
    ],
  },
  {
    id: 7,
    question: {
      zh: "做决定时，你更看重？",
      en: "When making decisions, you value more?",
      ja: "決断するとき、何を重視しますか？",
      vi: "Khi quyết định, bạn coi trọng?",
      my: "ဆုံးဖြတ်ချက်ချရင် ဘာကို အရေးကြီးသလဲ?",
    },
    options: [
      { label: { zh: "逻辑分析与客观公正", en: "Logic and objectivity", ja: "論理と客観性", vi: "Logic và khách quan", my: "ယုတ္တိဗေဒနှင့် ဘက်မလိုက်မှု" }, value: "T" },
      { label: { zh: "他人感受与和谐关系", en: "Others' feelings and harmony", ja: "他者の感情と調和", vi: "Cảm xúc và hòa hợp", my: "သူတစ်ပါး ခံစားချက်နှင့် ဟန်ချက်ညီမှု" }, value: "F" },
    ],
  },
  {
    id: 8,
    question: {
      zh: "朋友向你倾诉烦恼，你首先会？",
      en: "When a friend shares troubles, you first?",
      ja: "友人が悩みを打ち明けたら、まず？",
      vi: "Khi bạn chia sẻ nỗi buồn, bạn trước tiên?",
      my: "သူငယ်ချင်း ဝေဒနာပြောရင် ပထမဆုံး?",
    },
    options: [
      { label: { zh: "分析问题，给出建议", en: "Analyze and offer advice", ja: "分析して助言する", vi: "Phân tích và đưa lời khuyên", my: "ခွဲခြမ်းပြီး အကြံပေးသည်" }, value: "T" },
      { label: { zh: "倾听共情，给予安慰", en: "Listen with empathy and comfort", ja: "共感して寄り添う", vi: "Lắng nghe và an ủi", my: "နားထောင်ပြီး နှစ်သက်စေသည်" }, value: "F" },
    ],
  },
  {
    id: 9,
    question: {
      zh: "在团队中，你更擅长？",
      en: "In a team, you are better at?",
      ja: "チームで得意なのは？",
      vi: "Trong nhóm, bạn giỏi hơn?",
      my: "အဖွဲ့ထဲမှာ ဘာကို ပိုကျွမ်းလဲ?",
    },
    options: [
      { label: { zh: "指出问题，优化方案", en: "Spotting issues and optimizing", ja: "問題点を指摘し改善する", vi: "Chỉ ra vấn đề và tối ưu", my: "ပြဿနာတွေ့ပြီး ပိုကောင်းအောင် လုပ်သည်" }, value: "T" },
      { label: { zh: "凝聚人心，照顾氛围", en: "Uniting people and caring for morale", ja: "人をまとめ雰囲気を整える", vi: "Gắn kết mọi người", my: "လူများကို စည်းလုံးစေသည်" }, value: "F" },
    ],
  },
  {
    id: 10,
    question: {
      zh: "你更喜欢的生活方式是？",
      en: "Your preferred lifestyle is?",
      ja: "好む生活スタイルは？",
      vi: "Phong cách sống bạn thích?",
      my: "ကြိုက်သော ဘဝပုံစံ?",
    },
    options: [
      { label: { zh: "有计划、有条理", en: "Planned and organized", ja: "計画的で整理された", vi: "Có kế hoạch, ngăn nắp", my: "အစီအစဉ်ရှိသော" }, value: "J" },
      { label: { zh: "随性自由、灵活应变", en: "Flexible and spontaneous", ja: "自由で柔軟", vi: "Tự do, linh hoạt", my: "လွတ်လပ်ပြီး ပြောင်းလွယ်ပြင်လွယ်" }, value: "P" },
    ],
  },
  {
    id: 11,
    question: {
      zh: "面对截止日期，你通常？",
      en: "Facing a deadline, you usually?",
      ja: "締め切りに直面すると？",
      vi: "Đối mặt deadline, bạn thường?",
      my: "နောက်ဆုံးရက်ရောက်ရင်?",
    },
    options: [
      { label: { zh: "提前完成，留有余地", en: "Finish early with buffer time", ja: "余裕を持って早めに終える", vi: "Hoàn thành sớm", my: "စောစီးစွာ ပြီးအောင်လုပ်သည်" }, value: "J" },
      { label: { zh: "临近时效率最高", en: "Work best near the deadline", ja: "直前に最高の効率", vi: "Hiệu quả nhất sát hạn", my: "နောက်ဆုံးရက်နီးမှ ထိရောက်သည်" }, value: "P" },
    ],
  },
  {
    id: 12,
    question: {
      zh: "旅行时你更倾向于？",
      en: "When traveling, you prefer to?",
      ja: "旅行では？",
      vi: "Khi du lịch, bạn thích?",
      my: "ခရီးသွားရင်?",
    },
    options: [
      { label: { zh: "提前规划行程", en: "Plan the itinerary in advance", ja: "事前に計画する", vi: "Lên kế hoạch trước", my: "ကြိုတင်စီစဉ်သည်" }, value: "J" },
      { label: { zh: "走到哪算哪，享受意外", en: "Go with the flow, enjoy surprises", ja: "流れに任せて楽しむ", vi: "Tự nhiên, thích bất ngờ", my: "စိတ်ကြိုက်သွားသည်" }, value: "P" },
    ],
  },
];

export function calculateMbti(answers: MbtiDimension[]): string {
  const scores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
  for (const a of answers) scores[a]++;

  return [
    scores.E >= scores.I ? "E" : "I",
    scores.S >= scores.N ? "S" : "N",
    scores.T >= scores.F ? "T" : "F",
    scores.J >= scores.P ? "J" : "P",
  ].join("");
}
