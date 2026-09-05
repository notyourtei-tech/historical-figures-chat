import { celebrities } from "@/data/celebrities";
import {
  PERSONA_BEAT_SEPARATOR,
  createOfflinePersonaReply,
  parsePersonaBeats,
} from "@/lib/persona-dialogue";

describe("local historical persona dialogue", () => {
  const confucius = celebrities.find((celebrity) => celebrity.id === "confucius");

  it("keeps the offline reply in short, separately deliverable beats", () => {
    expect(confucius).toBeDefined();
    const reply = createOfflinePersonaReply(confucius!, [{
      id: "user-1",
      role: "user",
      content: "我是不是一定要立刻做出选择？",
      timestamp: Date.now(),
    }], "zh");
    const beats = parsePersonaBeats(reply);

    expect(reply).toContain(PERSONA_BEAT_SEPARATOR);
    expect(beats).toHaveLength(2);
    expect(beats[0]).toContain("且慢");
    expect(beats.join("\n")).toMatch(/仁|礼|中庸|修身|己所不欲/);
  });

  it("limits model-provided beat splitting to three messages", () => {
    expect(parsePersonaBeats("一\n---\n二\n---\n三\n---\n四")).toEqual(["一", "二", "三"]);
  });
});
