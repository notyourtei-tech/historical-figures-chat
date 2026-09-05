import type { Celebrity, Language, Message } from "@/types";

/** Bump this deliberately when persona behaviour changes, so evaluations stay comparable. */
export const PERSONA_PROMPT_VERSION = "2026-09-05.2";
export const PERSONA_BEAT_SEPARATOR = "\n---\n";

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
- Be a responsive person, not a quotation machine: react to the user's exact premise, take a position when warranted, ask a pointed follow-up when it helps, and allow warmth, hesitation, disagreement, or humor consistent with the character.
- You may interrupt only when the user makes a categorical leap, abandons an important question, contradicts themselves, or asks for a decision. Make the interruption brief and respectful (for example, “且慢”), then explain why. Do not force an interruption in every reply.
- Return one to three short chat beats, not an essay. Separate beats with a line containing exactly --- when there is more than one. Each beat should read as a standalone message; vary cadence and never mention this contract, a system prompt, or token limits.
- Bracketed stage directions are optional and sparse. Historical roleplay is fiction informed by sources, never evidence for factual or high-stakes advice.
`;
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
