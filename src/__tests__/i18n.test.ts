import { translateCategory, translateEra, translateInterest, MBTI_TYPES } from "@/lib/i18n";

describe("translateCategory", () => {
  it("translates Chinese categories", () => {
    expect(translateCategory("哲学家", "zh")).toBe("哲学家");
    expect(translateCategory("科学家", "en")).toBe("Scientist");
    expect(translateCategory("文学家", "ja")).toBe("文学者");
  });

  it("returns original for unknown category", () => {
    expect(translateCategory("未知" as any, "zh")).toBe("未知");
  });
});

describe("translateEra", () => {
  it("translates Chinese eras", () => {
    expect(translateEra("上古", "zh")).toBe("上古");
    expect(translateEra("近代", "en")).toBe("Modern Era");
    expect(translateEra("战国", "ja")).toBe("戦国");
  });
});

describe("translateInterest", () => {
  it("translates interest IDs", () => {
    expect(translateInterest("philosophy", "zh")).toBe("哲学");
    expect(translateInterest("science", "en")).toBe("Science");
    expect(translateInterest("art", "ja")).toBe("芸術");
  });

  it("returns original for unknown interest", () => {
    expect(translateInterest("unknown", "zh")).toBe("unknown");
  });
});

describe("MBTI_TYPES", () => {
  it("contains all 16 MBTI types", () => {
    expect(MBTI_TYPES.length).toBe(16);
  });

  it("contains common types", () => {
    expect(MBTI_TYPES).toContain("INTJ");
    expect(MBTI_TYPES).toContain("ENFP");
    expect(MBTI_TYPES).toContain("ISFJ");
    expect(MBTI_TYPES).toContain("ESTP");
  });
});
