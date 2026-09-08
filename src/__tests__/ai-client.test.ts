import { callChatCompletion, getAIProviders } from "@/lib/ai-client";

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

  it("keeps mandatory reasoning private without disabling it", async () => {
    process.env.OPENROUTER_API_KEY = "test-key";
    const originalFetch = global.fetch;
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({
        model: "provider/free-model",
        choices: [{ message: { content: "人物回复" } }],
      }),
    });
    global.fetch = fetchMock as typeof fetch;

    try {
      await expect(callChatCompletion([{ role: "user", content: "测试" }])).resolves.toMatchObject({
        content: "人物回复",
        model: "provider/free-model",
      });

      const request = JSON.parse(fetchMock.mock.calls[0][1].body as string);
      expect(request).toMatchObject({
        model: "openrouter/free",
        reasoning: { exclude: true },
      });
      expect(request.reasoning.effort).toBeUndefined();
    } finally {
      global.fetch = originalFetch;
    }
  });
});
