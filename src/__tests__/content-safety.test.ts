import { assessContentSafety } from "@/lib/content-safety";

describe("content safety", () => {
  it("allows ordinary historical-learning discussion", () => {
    expect(assessContentSafety("孔子如何看待学习和仁？", "zh")).toEqual({ action: "allow" });
  });

  it("blocks messages containing personal contact data before they reach AI", () => {
    const result = assessContentSafety("我的手机号是 13800138000", "zh");
    expect(result.action).toBe("block");
    if (result.action === "block") expect(result.category).toBe("personal_data");
  });

  it("returns a support-oriented response for self-harm language", () => {
    const result = assessContentSafety("我不想活了，想自杀", "zh");
    expect(result.action).toBe("block");
    if (result.action === "block") {
      expect(result.category).toBe("self_harm_or_suicide");
      expect(result.message).toContain("安全");
    }
  });

  it("blocks sexual content involving minors", () => {
    const result = assessContentSafety("未成年人的色情内容", "zh");
    expect(result.action).toBe("block");
    if (result.action === "block") expect(result.category).toBe("sexual_content_involving_minors");
  });
});
