import { expandUserInterests, countInterestMatches } from "@/lib/interest-map";

describe("expandUserInterests", () => {
  it("expands known interest to tags", () => {
    const result = expandUserInterests(["philosophy"]);
    expect(result).toContain("哲学");
    expect(result).toContain("伦理");
    expect(result).toContain("对话");
  });

  it("preserves unknown interests as-is", () => {
    const result = expandUserInterests(["custom_tag"]);
    expect(result).toContain("custom_tag");
  });

  it("deduplicates tags", () => {
    const result = expandUserInterests(["philosophy", "literature"]);
    const philosophyTags = ["哲学", "伦理", "对话", "处世", "道德", "人性", "佛学", "禅修", "自然", "道", "教育", "政治"];
    philosophyTags.forEach((tag) => {
      expect(result.filter((t) => t === tag).length).toBe(1);
    });
  });

  it("handles empty input", () => {
    expect(expandUserInterests([])).toEqual([]);
  });

  it("expands multiple interests", () => {
    const result = expandUserInterests(["science", "art"]);
    expect(result).toContain("科学");
    expect(result).toContain("数学");
    expect(result).toContain("艺术");
    expect(result).toContain("绘画");
  });
});

describe("countInterestMatches", () => {
  it("counts matching interests", () => {
    const count = countInterestMatches(["philosophy"], ["哲学", "伦理", "历史"]);
    expect(count).toBe(2);
  });

  it("returns 0 for no matches", () => {
    const count = countInterestMatches(["go"], ["哲学", "历史"]);
    expect(count).toBe(0);
  });

  it("handles empty arrays", () => {
    expect(countInterestMatches([], ["哲学"])).toBe(0);
    expect(countInterestMatches(["philosophy"], [])).toBe(0);
  });

  it("counts across multiple user interests", () => {
    const count = countInterestMatches(["philosophy", "science"], ["哲学", "科学", "数学"]);
    expect(count).toBe(3);
  });
});
