import { celebrities } from "@/data/celebrities";
import {
  PERSONA_BEAT_SEPARATOR,
  buildPersonaBehaviorContract,
  createPersonaAvailabilityNotice,
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

  it("uses a transparent, role-specific pause notice when free capacity is low", () => {
    const qin = celebrities.find((celebrity) => celebrity.id === "qinshihuang");
    const einstein = celebrities.find((celebrity) => celebrity.id === "einstein");
    const liBai = celebrities.find((celebrity) => celebrity.id === "libai");

    expect(qin).toBeDefined();
    expect(einstein).toBeDefined();
    expect(liBai).toBeDefined();
    expect(createPersonaAvailabilityNotice(qin!, "zh", "rate_limited", { retryAfterSeconds: 43 })).toMatch(/会话暂歇|奏牍|政务|批阅/);
    expect(createPersonaAvailabilityNotice(qin!, "zh", "rate_limited", { retryAfterSeconds: 43 })).toContain("43 秒后");
    expect(createPersonaAvailabilityNotice(einstein!, "zh", "low_capacity", { retryAfterSeconds: 60 })).toMatch(/会话暂歇|小提琴|实验台|推演/);
    expect(createPersonaAvailabilityNotice(liBai!, "zh", "rate_limited", { variationSeed: "wang-lun" })).toMatch(/汪伦|月色/);
  });

  it("tells the online model to vary voice and avoid generic advice templates", () => {
    expect(confucius).toBeDefined();
    const contract = buildPersonaBehaviorContract(confucius!, "zh");

    expect(contract).toContain("non-formulaic");
    expect(contract).toContain("generic life advice");
    expect(contract).toContain("last three turns");
  });
});
