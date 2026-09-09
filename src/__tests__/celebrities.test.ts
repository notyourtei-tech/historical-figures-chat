import { celebrities } from "@/data/celebrities";
import { getCelebrityMbti } from "@/lib/mbti-match";

describe("celebrities data", () => {
  it("has at least 50 celebrities", () => {
    expect(celebrities.length).toBeGreaterThanOrEqual(50);
  });

  it("all celebrities have unique ids", () => {
    const ids = celebrities.map((c) => c.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("all celebrities have all required fields", () => {
    celebrities.forEach((c) => {
      expect(c.id).toBeTruthy();
      expect(c.name.zh).toBeTruthy();
      expect(c.name.en).toBeTruthy();
      expect(c.title.zh).toBeTruthy();
      expect(c.title.en).toBeTruthy();
      expect(c.category).toBeTruthy();
      expect(c.era).toBeTruthy();
      expect(c.description.zh).toBeTruthy();
      expect(c.description.en).toBeTruthy();
      expect(c.avatar).toBeTruthy();
      expect(c.tone.zh).toBeTruthy();
      expect(c.tone.en).toBeTruthy();
      expect(c.coreThoughts.zh.length).toBeGreaterThan(0);
      expect(c.keyWorks.zh.length).toBeGreaterThan(0);
      expect(c.personalityTraits.zh.length).toBeGreaterThan(0);
      expect(c.expertise.zh.length).toBeGreaterThan(0);
      expect(c.interests.length).toBeGreaterThan(0);
    });
  });

  it("all celebrities have valid local avatar paths", () => {
    celebrities.forEach((c) => {
      expect(c.avatar).toMatch(/^\/images\/avatars\/.+\.webp$/);
    });
  });

  it("has celebrities from diverse categories", () => {
    const categories = new Set(celebrities.map((c) => c.category));
    expect(categories.size).toBeGreaterThanOrEqual(5);
  });

  it("has celebrities from diverse eras", () => {
    const eras = new Set(celebrities.map((c) => c.era));
    expect(eras.size).toBeGreaterThanOrEqual(5);
  });

  it("shows historically specific eras for prominent Chinese figures", () => {
    const eraById = new Map(celebrities.map((celebrity) => [celebrity.id, celebrity.era]));

    expect(eraById.get("libai")).toBe("唐朝");
    expect(eraById.get("tangtaizong")).toBe("唐朝");
    expect(eraById.get("sushi")).toBe("北宋");
    expect(eraById.get("zhugeliang")).toBe("三国");
  });

  it("all celebrities have MBTI mapping", () => {
    const missing = celebrities.filter((c) => !getCelebrityMbti(c.id));
    expect(missing).toEqual([]);
  });
});
