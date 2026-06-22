import { Celebrity } from "@/types";

/** 各伟人的 MBTI 类型（基于历史性格特征的合理推断） */
export const CELEBRITY_MBTI: Record<string, string> = {
  // 原有
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
  // 中国哲学家
  zhuangzi: "INFP",
  mengzi: "ENFJ",
  xunzi: "INTJ",
  // 中国文学家
  quyuan: "INFJ",
  sushi: "ENFP",
  taoyuanming: "INFP",
  // 中国军事/政治
  zhugeliang: "INTJ",
  caocao: "ENTJ",
  // 皇帝
  qinshihuang: "ENTJ",
  tangtaizong: "ENTJ",
  // 西方科学家
  galileo: "ENTP",
  darwin: "INTJ",
  curie: "ISTJ",
  hawking: "INTP",
  turing: "INTP",
  // 西方哲学家
  aristotle: "INTJ",
  nietzsche: "INTJ",
  // 西方军事/政治
  alexander: "ENTJ",
  caesar: "ENTJ",
  lincoln: "INFJ",
  napoleon: "ENTJ",
  // 艺术家
  mozart: "ENFP",
  beethoven: "INTJ",
  vangogh: "INFP",
  // 宗教
  shakyamuni: "INFJ",
  gandhi: "INFJ",
  // 近现代
  tesla: "INTP",
  edison: "ENTJ",
  stevejobs: "ENTP",
  // 日本
  musashi: "ISTP",
  hokusai: "INFP",
  // 俄罗斯
  tolstoy: "INFJ",
  dostoevsky: "INFJ",
  // 法国
  voltaire: "ENTP",
  victorhugo: "ENFJ",
  // 德国
  goethe: "INFJ",
  freud: "INTJ",
  // 西班牙
  picasso: "ENTP",
  cervantes: "ENFP",
  // 印度
  tagore: "INFP",
  // 英国
  shelley: "ENFP",
  sarahBernhardt: "ENFP",
  // 美国
  franklin: "ENTP",
  mlk: "ENFJ",
  // 韩国
  sejong: "INTJ",
  // 古埃及
  cleopatra: "ENTJ",
  // 意大利
  michelangelo: "INTJ",
  machiavelli: "INTJ",
  // 奥地利
  schwarzenegger: "ESTP",
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
