import { mbtiCompatibility, getCelebrityMbti, getMbtiRecommendations } from "@/lib/mbti-match";
import { celebrities } from "@/data/celebrities";

describe("mbtiCompatibility", () => {
  it("returns 4 for exact match", () => {
    expect(mbtiCompatibility("INTJ", "INTJ")).toBe(4);
  });

  it("returns 3 for 3 matching dimensions", () => {
    expect(mbtiCompatibility("INTJ", "INTP")).toBe(3);
  });

  it("returns 2 for 2 matching dimensions", () => {
    expect(mbtiCompatibility("INTJ", "ENTP")).toBe(2);
  });

  it("returns 0 for completely different", () => {
    expect(mbtiCompatibility("INTJ", "ESFP")).toBe(0);
  });

  it("returns 0 for invalid length", () => {
    expect(mbtiCompatibility("IN", "INTJ")).toBe(0);
    expect(mbtiCompatibility("INTJ", "INTJA")).toBe(0);
  });

  it("is case sensitive", () => {
    expect(mbtiCompatibility("intj", "INTJ")).toBe(0);
  });
});

describe("getCelebrityMbti", () => {
  it("returns MBTI for known celebrity", () => {
    expect(getCelebrityMbti("confucius")).toBe("ESFJ");
    expect(getCelebrityMbti("einstein")).toBe("INTP");
    expect(getCelebrityMbti("shakespeare")).toBe("INFJ");
  });

  it("returns undefined for unknown celebrity", () => {
    expect(getCelebrityMbti("nonexistent")).toBeUndefined();
  });

  it("returns undefined for empty string", () => {
    expect(getCelebrityMbti("")).toBeUndefined();
  });
});

describe("getMbtiRecommendations", () => {
  it("returns up to limit recommendations", () => {
    const recs = getMbtiRecommendations(celebrities, "INTJ", 4);
    expect(recs.length).toBeLessThanOrEqual(4);
  });

  it("returns only celebrities with matching MBTI", () => {
    const recs = getMbtiRecommendations(celebrities, "INTJ", 10);
    recs.forEach((c) => {
      const mbti = getCelebrityMbti(c.id);
      expect(mbti).toBeDefined();
      const score = mbtiCompatibility("INTJ", mbti!);
      expect(score).toBeGreaterThan(0);
    });
  });

  it("returns sorted by score descending", () => {
    const recs = getMbtiRecommendations(celebrities, "INTJ", 10);
    for (let i = 1; i < recs.length; i++) {
      const prev = mbtiCompatibility("INTJ", getCelebrityMbti(recs[i - 1].id) || "");
      const curr = mbtiCompatibility("INTJ", getCelebrityMbti(recs[i].id) || "");
      expect(prev).toBeGreaterThanOrEqual(curr);
    }
  });

  it("returns empty array for no matches", () => {
    const recs = getMbtiRecommendations([], "INTJ", 4);
    expect(recs).toEqual([]);
  });
});
