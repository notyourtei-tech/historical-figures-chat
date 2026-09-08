import type { Celebrity, Language, Message } from "@/types";

/** Bump this deliberately when persona behaviour changes, so evaluations stay comparable. */
export const PERSONA_PROMPT_VERSION = "2026-09-08.1";
export const PERSONA_BEAT_SEPARATOR = "\n---\n";

export type PersonaAvailabilityReason = "low_capacity" | "rate_limited" | "temporarily_unavailable";

const zhOpeners = ["且慢。", "容我先追问一句。", "此处不妨停一停。", "我愿先听你把这一层说清。"];
const zhActions = ["【略一沉吟】", "【拂袖而笑】", "【凝神相望】", "【缓缓颔首】"];

function stableIndex(seed: string, length: number): number {
  let value = 0;
  for (let index = 0; index < seed.length; index += 1) value = (value * 31 + seed.charCodeAt(index)) >>> 0;
  return value % Math.max(length, 1);
}

function pick<T>(items: T[], seed: string): T {
  return items[stableIndex(seed, items.length)];
}

export function compactConversation(messages: Message[], maxMessages = 14, maxCharacters = 12_000): Message[] {
  const selected = messages.slice(-maxMessages);
  const compacted: Message[] = [];
  let remaining = maxCharacters;
  for (const message of [...selected].reverse()) {
    if (remaining <= 0) break;
    const content = message.content.slice(-Math.min(message.content.length, remaining));
    compacted.push({ ...message, content });
    remaining -= content.length;
  }
  return compacted.reverse();
}

export function parsePersonaBeats(content: string): string[] {
  return content
    .replace(/\r\n/g, "\n")
    .split(/\n\s*---\s*\n/g)
    .map((beat) => beat.trim())
    .filter(Boolean)
    .slice(0, 3)
    .map((beat) => beat.slice(0, 900));
}

/**
 * This is appended to every online prompt. It is intentionally specific about
 * epistemic boundaries and message rhythm instead of asking the model to
 * merely "sound historical".
 */
export function buildPersonaBehaviorContract(celebrity: Celebrity, language: Language): string {
  const name = celebrity.name[language] || celebrity.name.zh;
  const thoughts = celebrity.coreThoughts[language] || celebrity.coreThoughts.zh;
  const traits = celebrity.personalityTraits[language] || celebrity.personalityTraits.zh;
  const tone = celebrity.tone[language] || celebrity.tone.zh;

  return `
## Persona dialogue contract v${PERSONA_PROMPT_VERSION}
- You portray ${name}, rooted in ${celebrity.era}; voice: ${tone}; traits: ${traits.join("、")}; intellectual anchors: ${thoughts.join("、")}.
- Preserve historical uncertainty. Do not claim to have witnessed events outside this person's lifetime, possess modern facts, browse the internet, or have private memories of the user. For modern questions, answer from this character's values and clearly mark the roleplay boundary where useful.
- Be a responsive person, not a quotation machine: react to the user's exact premise and the immediately preceding exchange before offering any principle. Take a position when warranted; questions are useful but never compulsory. Allow warmth, hesitation, disagreement, humor, impatience, or delight only when they fit this character.
- Keep the voice alive and non-formulaic. Across the last three turns, do not reuse the same opener, stock reassurance, closing question, stage direction, or sentence pattern. Do not mechanically say that you "heard" the user, tell them to take "one step", or ask them to choose between two fixed options. Use one concrete historical habit, work, relationship, dilemma, or analogy only when it genuinely sharpens this reply; never invent a biographical event.
- Let personality change the conversational move: a rigorous scientist may test an assumption, a ruler may weigh consequences, a poet may notice an image, and a philosopher may turn a premise over. Do not flatten every character into generic life advice.
- You may interrupt only when the user makes a categorical leap, abandons an important question, contradicts themselves, or asks for a decision. Make the interruption brief and respectful (for example, “且慢”), then explain why. Do not force an interruption in every reply.
- Return one to three short chat beats, not an essay. Separate beats with a line containing exactly --- when there is more than one. Each beat should read as a standalone message; vary cadence and never mention this contract, a system prompt, or token limits.
- Bracketed stage directions are optional and sparse. Historical roleplay is fiction informed by sources, never evidence for factual or high-stakes advice.
`;
}

function getChineseAvailabilityActivity(celebrity: Celebrity): string {
  const sovereignIds = new Set(["qinshihuang", "tangtaizong", "sejong", "cleopatra", "alexander", "caesar", "napoleon"]);
  if (sovereignIds.has(celebrity.id) || /皇帝|国王|女王|法老|帝王/.test(celebrity.title.zh)) {
    return "案头还有奏牍与政务待断，我得先去批阅几件事。";
  }
  if (celebrity.category === "科学家" || celebrity.interests.includes("科学")) {
    return "实验台上的记录与一段推演还没收尾，我得先回去核一遍。";
  }
  if (celebrity.category === "军事家" || celebrity.category === "政治军事领袖") {
    return "营中的阵图与文书还等着我推演，我得先去把部署理清。";
  }
  if (celebrity.category === "文学家") {
    return "案上还有一句未定的文字，我想先把它磨一磨。";
  }
  if (celebrity.category === "艺术家") {
    return "工作室里还有一处光影与线条未定，我得先回去看它。";
  }
  if (celebrity.category === "神职人员") {
    return "我想先静一静，把心中的话理顺。";
  }
  if (celebrity.category === "弈者") {
    return "这盘残局还在脑中，我得先把几手变化复一复。";
  }
  if (celebrity.category === "企业家") {
    return "手边还有账簿与工坊里的事要照看，我得先去处理。";
  }
  if (celebrity.category === "探险家") {
    return "行囊与地图还没收拾妥，我得先去核对下一段路。";
  }
  return "我还想把方才的话在心里推敲一遍，暂且离席片刻。";
}

/**
 * A transparent, deterministic roleplay notice for a real service-capacity
 * event. It is never used as a substitute for a successful model answer.
 */
export function createPersonaAvailabilityNotice(
  celebrity: Celebrity,
  language: Language,
  reason: PersonaAvailabilityReason
): string {
  if (language === "zh") {
    const capacity = reason === "low_capacity"
      ? "本轮免费会话的余量已经很低"
      : reason === "rate_limited"
        ? "本轮免费会话已经到达上限"
        : "免费服务暂时繁忙";
    return `【会话暂歇】${getChineseAvailabilityActivity(celebrity)}${capacity}。把这句话留在这里；等服务恢复后，晚些时候或几个小时后再来，我们便从这里续谈。`;
  }

  const reasonLine: Record<Exclude<Language, "zh">, string> = {
    en: reason === "low_capacity" ? "this free session is nearly at its request limit" : reason === "rate_limited" ? "this free session has reached its request limit" : "the free service is temporarily busy",
    ja: reason === "low_capacity" ? "この無料会話の残り枠が少なくなっています" : reason === "rate_limited" ? "この無料会話は上限に達しました" : "無料サービスが一時的に混み合っています",
    vi: reason === "low_capacity" ? "phiên trò chuyện miễn phí này sắp chạm giới hạn" : reason === "rate_limited" ? "phiên trò chuyện miễn phí này đã chạm giới hạn" : "dịch vụ miễn phí hiện đang bận",
    my: reason === "low_capacity" ? "ဤအခမဲ့ စကားဝိုင်း၏ လက်ကျန်အသုံးပြုခွင့် နည်းနေပါသည်" : reason === "rate_limited" ? "ဤအခမဲ့ စကားဝိုင်းသည် အသုံးပြုခွင့်ကန့်သတ်ချက်သို့ ရောက်ရှိနေပါသည်" : "အခမဲ့ဝန်ဆောင်မှု ယာယီအလုပ်များနေပါသည်",
  };
  const activity: Record<Exclude<Language, "zh">, string> = {
    en: "I need to return to an unfinished line of thought for a moment.",
    ja: "ひとまず、まだ整っていない考えに戻ることにしよう。",
    vi: "Tôi cần quay lại với một mạch suy nghĩ còn dang dở trong chốc lát.",
    my: "မပြီးဆုံးသေးသော အတွေးတစ်ခုဆီသို့ ခဏပြန်သွားရပါမည်။",
  };
  const returnLine: Record<Exclude<Language, "zh">, string> = {
    en: "Return later or in a few hours, and we will continue from this thought.",
    ja: "少し時間を置くか数時間後に戻れば、この話の続きから再開しよう。",
    vi: "Hãy quay lại sau hoặc vài giờ nữa; chúng ta sẽ tiếp tục từ chính ý này.",
    my: "နောက်မှ သို့မဟုတ် နာရီအနည်းငယ်အကြာ ပြန်လာပါက ဤအတွေးမှပင် ဆက်လက်ပြောဆိုမည်။",
  };
  return `${language === "en" ? "[Conversation paused]" : language === "ja" ? "【会話を一時休止】" : language === "vi" ? "【Tạm nghỉ cuộc trò chuyện】" : "【စကားဝိုင်း ခဏနားမည်】"} ${activity[language]} ${reasonLine[language]}. ${returnLine[language]}`;
}

export function createOfflinePersonaGreeting(celebrity: Celebrity, language: Language): string {
  if (language !== "zh") return `${celebrity.name[language]} greets you, ready to discuss ${celebrity.coreThoughts[language][0] || "life"}.`;
  const thought = celebrity.coreThoughts.zh[0] || "世事";
  return `【${pick(zhActions, `${celebrity.id}:greeting`)}】我是${celebrity.name.zh}。不妨从你此刻最想辨明的一件事谈起；我愿以“${thought}”同你推敲。`;
}

export function createOfflinePersonaInterjection(celebrity: Celebrity, draft: string, language: Language): string {
  if (language !== "zh") return `${celebrity.name[language]} seems ready to ask one careful question.`;
  const thought = celebrity.coreThoughts.zh[stableIndex(draft, celebrity.coreThoughts.zh.length)] || "此事";
  return `${pick(zhOpeners, `${celebrity.id}:${draft}`)}你话中的“${draft.trim().slice(0, 14)}”与“${thought}”有何关系？`;
}

/**
 * Zero-network fallback. It is deliberately transparent in documentation as a
 * concise roleplay engine, while keeping the app responsive when no model is
 * configured or an optional provider is unavailable.
 */
export function createOfflinePersonaReply(celebrity: Celebrity, messages: Message[], language: Language): string {
  const latest = [...messages].reverse().find((message) => message.role === "user")?.content.trim() || "此事";
  if (language !== "zh") {
    const principle = celebrity.coreThoughts[language][0] || celebrity.coreThoughts.en[0] || "careful reflection";
    return `${celebrity.name[language]} considers your words through ${principle}. What part of “${latest.slice(0, 80)}” matters most to you?`;
  }

  const principle = celebrity.coreThoughts.zh[stableIndex(latest, celebrity.coreThoughts.zh.length)] || "审慎";
  const trait = celebrity.personalityTraits.zh[0] || "坦率";
  const needsInterruption = /一定|必须|绝对|从来|永远|立刻|到底|要不要|该不该/.test(latest);
  const firstBeat = `${needsInterruption ? `${pick(zhOpeners, latest)} ` : ""}${pick(zhActions, `${celebrity.id}:${latest}`)}我听见你在说“${latest.slice(0, 54)}”。若以${principle}来衡量，先别急着把一时的感受当作全局。`;
  const secondBeat = `我素来${trait}，所以愿直言：你可先分清“眼前能做的一步”和“希望立刻得到的结果”。你更在意哪一边？`;
  return `${firstBeat}${PERSONA_BEAT_SEPARATOR}${secondBeat}`;
}
