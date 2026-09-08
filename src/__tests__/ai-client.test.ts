import { getAIProviders } from "@/lib/ai-client";

describe("OpenRouter free-only routing", () => {
  const originalKey = process.env.OPENROUTER_API_KEY;

  afterEach(() => {
    if (originalKey === undefined) {
      delete process.env.OPENROUTER_API_KEY;
    } else {
      process.env.OPENROUTER_API_KEY = originalKey;
    }
  });

  it("never offers a paid model as a fallback", () => {
    process.env.OPENROUTER_API_KEY = "test-key";

    expect(getAIProviders()).toEqual([
      { name: "openrouter", models: ["openrouter/free"] },
    ]);
  });
});
