import { Celebrity } from "@/types";

/** 各伟人的 MBTI 类型（基于历史性格特征的合理推断） */
export const CELEBRITY_MBTI: Record<string, string> = {
  confucius: "ESFJ",
  mencius: "ENFJ",
  socrates: "ENTP",
  plato: "INTJ",
  laozi: "INFP",
  einstein: "INTP",
  newton: "ISTJ",
  libai: "ENFP",
  shakespeare: "INFJ",
  sunzi: "INTJ",
  davinci: "ENTP",
  wuqingyuan: "INFJ",
  huineng: "INFJ",
};

export function getCelebrityMbti(celebrityId: string): string | undefined {
  return CELEBRITY_MBTI[celebrityId];
}

/** 计算 MBTI 匹配度（0-4，4 为完全匹配） */
export function mbtiCompatibility(userMbti: string, celebrityMbti: string): number {
  if (userMbti.length !== 4 || celebrityMbti.length !== 4) return 0;
  if (userMbti === celebrityMbti) return 4;
  let score = 0;
  for (let i = 0; i < 4; i++) {
    if (userMbti[i] === celebrityMbti[i]) score++;
  }
  return score;
}

export function getMbtiRecommendations(
  celebrities: Celebrity[],
  userMbti: string,
  limit = 4
): Celebrity[] {
  return [...celebrities]
    .map((c) => ({
      celebrity: c,
      score: mbtiCompatibility(userMbti, getCelebrityMbti(c.id) || ""),
    }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.celebrity);
}
