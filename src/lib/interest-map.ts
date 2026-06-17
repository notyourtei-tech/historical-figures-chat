/** 将 onboarding 英文 id 映射到名人 interests 中使用的中文标签 */
export const INTEREST_TO_TAGS: Record<string, string[]> = {
  philosophy: [
    "哲学",
    "伦理",
    "对话",
    "处世",
    "道德",
    "人性",
    "佛学",
    "禅修",
    "自然",
    "道",
    "教育",
    "政治",
  ],
  science: ["科学", "数学", "物理", "天文学", "炼金术"],
  art: ["艺术", "绘画", "文学", "戏剧", "书法", "音乐"],
  history: ["历史", "军事", "战略"],
  go: ["围棋"],
  divination: ["占卜", "命运"],
  literature: ["文学", "诗歌", "戏剧"],
  peace: ["和平"],
};

export function expandUserInterests(interests: string[]): string[] {
  const tags = new Set<string>();
  for (const interest of interests) {
    const mapped = INTEREST_TO_TAGS[interest];
    if (mapped) {
      mapped.forEach((tag) => tags.add(tag));
    } else {
      tags.add(interest);
    }
  }
  return Array.from(tags);
}

export function countInterestMatches(
  userInterests: string[],
  celebrityInterests: string[]
): number {
  const tags = expandUserInterests(userInterests);
  return tags.filter((tag) => celebrityInterests.includes(tag)).length;
}
