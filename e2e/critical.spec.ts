import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const profile = { name: "Test User", interests: [], language: "zh" };
const acceptedConsent = {
  version: "2026-09-05",
  completed: true,
  aiProcessing: true,
  analytics: false,
  updatedAt: Date.now(),
};

async function seedVisitor(page: import("@playwright/test").Page, consent = acceptedConsent) {
  await page.addInitScript(({ nextProfile, nextConsent }) => {
    localStorage.setItem("user_profile", JSON.stringify(nextProfile));
    localStorage.setItem("wan_gu_ling_xi_privacy_consent", JSON.stringify(nextConsent));
  }, { nextProfile: profile, nextConsent: consent });
}

function createLongHistory() {
  return Array.from({ length: 48 }, (_, index) => ({
    id: `history-${index}`,
    role: index % 2 === 0 ? "assistant" : "user",
    content: `这是第 ${index + 1} 条测试消息，用来模拟一段足够长的历史对话，确保消息再多也不会遮住输入框。`,
    timestamp: Date.now() - (48 - index) * 60_000,
  }));
}

test("home page is usable without horizontal overflow", async ({ page }) => {
  await seedVisitor(page);
  await page.goto("/");
  await expect(page.locator('a[href="/chat/confucius"]').first()).toBeVisible();
  const confuciusAvatar = page.getByAltText("孔子").first();
  await expect.poll(() => confuciusAvatar.evaluate((image) => {
    const imageElement = image as HTMLImageElement;
    return imageElement.complete && imageElement.naturalWidth > 0 && imageElement.currentSrc.endsWith(".webp");
  })).toBe(true);
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("chat sends, receives, and persists a local conversation", async ({ page }) => {
  await seedVisitor(page);
  await page.route("**/api/greeting", (route) => route.fulfill({ json: { success: true, content: "【微笑】欢迎前来。" } }));
  await page.route("**/api/chat?stream=1", (route) => route.fulfill({
    contentType: "text/event-stream",
    body: [
      'data: {"type":"delta","content":"【沉思】知行合一，"}',
      'data: {"type":"delta","content":"先从眼前一步开始。"}',
      'data: {"type":"complete"}',
      "",
    ].join("\n\n"),
  }));
  await page.goto("/chat/confucius");
  await expect(page.getByText("欢迎前来")).toBeVisible();
  const input = page.getByRole("textbox", { name: "开启对话..." });
  await input.fill("我今天该如何学习？");
  await input.press("Enter");
  await expect(page.getByText("知行合一，先从眼前一步开始。")).toBeVisible();
  await expect(page.getByTestId("chat-scroll-area")).toHaveAttribute("aria-live", "off");
  await expect(page.getByRole("status")).toContainText("孔子已回复");
  await expect.poll(() => page.evaluate(() => localStorage.getItem("chat_history_confucius") || "")).toContain("我今天该如何学习？");
});

test("a 320px phone keeps long bubbles, message actions, and the composer inside the screen", async ({ page }) => {
  await seedVisitor(page);
  await page.addInitScript(() => {
    const longUnbrokenText = "https://example.com/" + "very-long-address-segment-".repeat(26);
    localStorage.setItem("chat_history_confucius", JSON.stringify([
      { id: "narrow-assistant", role: "assistant", content: longUnbrokenText, timestamp: Date.now() - 60_000 },
      { id: "narrow-user", role: "user", content: longUnbrokenText, timestamp: Date.now() },
    ]));
  });
  await page.goto("/chat/confucius");
  await page.setViewportSize({ width: 320, height: 568 });

  const input = page.getByRole("textbox", { name: "开启对话..." });
  const lastMessage = page.locator('[data-msg-id="narrow-user"]');
  await expect(input).toBeVisible();
  await expect(lastMessage.getByRole("button", { name: "复制" })).toBeVisible();
  await expect.poll(() => page.evaluate(() => {
    const composer = document.querySelector<HTMLElement>('[data-testid="chat-composer"]');
    const bubbles = Array.from(document.querySelectorAll<HTMLElement>(".bubble-ai, .bubble-user"));
    if (!composer || bubbles.length < 2) return false;
    const viewport = window.innerWidth;
    const composerRect = composer.getBoundingClientRect();
    return document.documentElement.scrollWidth <= viewport
      && composerRect.left >= 0
      && composerRect.right <= viewport
      && bubbles.every((bubble) => {
        const rect = bubble.getBoundingClientRect();
        return rect.left >= 0 && rect.right <= viewport;
      });
  })).toBe(true);
});

test("history drawer keeps keyboard focus contained and exposes a visible delete action on touch", async ({ page }) => {
  await seedVisitor(page);
  await page.addInitScript(() => {
    localStorage.setItem("chat_conversations", JSON.stringify([{
      id: "confucius",
      celebrityId: "confucius",
      celebrityName: "孔子",
      lastMessage: "一段可恢复的对话",
      messageCount: 2,
      lastTimestamp: Date.now(),
      lang: "zh",
    }]));
  });
  await page.goto("/chat/confucius");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: /对话历史|Chat History/ }).click();

  const close = page.getByRole("button", { name: "关闭聊天记录" });
  const remove = page.getByRole("button", { name: "删除与 孔子 的聊天记录" });
  await expect(close).toBeFocused();
  await expect(remove).toBeVisible();
  await expect.poll(() => remove.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const requiresAlwaysVisibleAction = matchMedia("(pointer: coarse)").matches;
    return rect.width >= 40 && rect.height >= 40 && (!requiresAlwaysVisibleAction || getComputedStyle(element).opacity === "1");
  })).toBe(true);
  await page.keyboard.press("Shift+Tab");
  await expect(remove).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(close).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(close).toBeHidden();
});

test("a real free-service limit becomes a character-specific pause with a retry path", async ({ page }) => {
  await seedVisitor(page);
  await page.route("**/api/greeting", (route) => route.fulfill({ json: { success: true, content: "【抬眼】说吧。" } }));
  await page.route("**/api/chat?stream=1", (route) => route.fulfill({
    contentType: "text/event-stream",
    headers: { "Retry-After": "43" },
    body: 'data: {"type":"error","error":"RATE_LIMIT_EXCEEDED"}\n\n',
  }));

  await page.goto("/chat/qinshihuang");
  await expect(page.getByText("说吧。")).toBeVisible();
  const input = page.getByRole("textbox", { name: "开启对话..." });
  await input.fill("我想继续问治国的事。");
  await input.press("Enter");

  await expect(page.getByText(/会话暂歇/)).toBeVisible();
  await expect(page.getByText(/奏牍|政务|批阅/)).toBeVisible();
  await expect(page.getByText(/43 秒后可重试/)).toBeVisible();
  await expect(page.getByRole("button", { name: /重试/ })).toBeVisible();
  await expect.poll(() => page.evaluate(() => localStorage.getItem("chat_history_qinshihuang") || "")).toContain("我想继续问治国的事。");
});

test("a low visitor capacity warning arrives after a complete character reply", async ({ page }) => {
  await seedVisitor(page);
  await page.route("**/api/greeting", (route) => route.fulfill({ json: { success: true, content: "【微笑】我们开始吧。" } }));
  await page.route("**/api/chat?stream=1", (route) => route.fulfill({
    contentType: "text/event-stream",
    headers: { "X-RateLimit-Limit": "20", "X-RateLimit-Remaining": "2", "X-RateLimit-Reset-After": "31" },
    body: [
      'data: {"type":"delta","content":"先把假设写下来，再检验它。"}',
      'data: {"type":"complete"}',
      "",
    ].join("\n\n"),
  }));

  await page.goto("/chat/einstein");
  await expect(page.getByText("我们开始吧。")).toBeVisible();
  const input = page.getByRole("textbox", { name: "开启对话..." });
  await input.fill("相对论为什么重要？");
  await input.press("Enter");

  await expect(page.getByText("先把假设写下来，再检验它。")).toBeVisible();
  await expect(page.getByText(/本轮免费会话的余量已经很低/)).toBeVisible();
  await expect(page.getByText(/小提琴|实验台|推演/)).toBeVisible();
  await expect(page.getByText(/31 秒后开始回补/)).toBeVisible();
});

test("long chat history never pushes the composer outside the viewport", async ({ page }) => {
  await seedVisitor(page);
  const history = createLongHistory();
  await page.addInitScript((messages) => {
    localStorage.setItem("chat_history_confucius", JSON.stringify(messages));
  }, history);
  await page.route("**/api/chat?stream=1", (route) => route.fulfill({
    contentType: "text/event-stream",
    body: [
      'data: {"type":"delta","content":"我已收到你的问题。"}',
      'data: {"type":"complete"}',
      "",
    ].join("\n\n"),
  }));

  await page.goto("/chat/confucius");
  const input = page.getByRole("textbox", { name: "开启对话..." });
  await expect(input).toBeVisible();
  await expect.poll(() => page.evaluate(() => {
    const composer = document.querySelector<HTMLElement>('[data-testid="chat-composer"]');
    const scrollArea = document.querySelector<HTMLElement>('[data-testid="chat-scroll-area"]');
    if (!composer || !scrollArea) return false;
    const composerRect = composer.getBoundingClientRect();
    // Browser/device pixel rounding can make a layout-aligned edge differ by a
    // fraction of a CSS pixel. Keep a small tolerance while still requiring
    // the composer to be entirely reachable in the visible viewport.
    const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
    const edgeTolerance = 2;
    return composerRect.top >= -edgeTolerance
      && composerRect.bottom <= viewportHeight + edgeTolerance
      && scrollArea.scrollHeight > scrollArea.clientHeight
      && document.documentElement.scrollHeight <= document.documentElement.clientHeight + edgeTolerance;
  })).toBe(true);

  await input.focus();
  await expect.poll(() => page.evaluate(() => document.activeElement?.tagName)).toBe("TEXTAREA");
  await input.fill("长对话后仍然应该可以方便地继续提问。");
  await input.press("Enter");
  await expect(page.getByText("我已收到你的问题。")).toBeVisible();
  await expect(input).toBeVisible();
});

test("the mobile composer tracks a shrinking visual viewport without moving the page", async ({ page }) => {
  await seedVisitor(page);
  await page.addInitScript((messages) => {
    localStorage.setItem("chat_history_confucius", JSON.stringify(messages));
  }, createLongHistory());
  await page.goto("/chat/confucius");
  const input = page.getByRole("textbox", { name: "开启对话..." });
  await input.focus();

  // This simulates the reduced visible area produced by a phone keyboard.
  // The app must recalculate its VisualViewport-backed layout rather than
  // letting the document or the composer jump outside the screen.
  await page.setViewportSize({ width: 390, height: 430 });
  await expect.poll(() => page.evaluate(() => {
    const composer = document.querySelector<HTMLElement>('[data-testid="chat-composer"]');
    const scrollArea = document.querySelector<HTMLElement>('[data-testid="chat-scroll-area"]');
    if (!composer || !scrollArea) return false;
    const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
    const composerRect = composer.getBoundingClientRect();
    const root = document.documentElement;
    return root.style.getPropertyValue("--vh") === `${Math.round(viewportHeight)}px`
      && root.dataset.chatSurface === "true"
      && composerRect.top >= -2
      && composerRect.bottom <= viewportHeight + 2
      && scrollArea.clientHeight > 0
      && document.documentElement.scrollHeight <= document.documentElement.clientHeight + 2
      && window.scrollY === 0;
  })).toBe(true);

  await input.fill("键盘打开后，输入区仍应保持稳定、可见并且方便继续输入。");
  await expect(input).toBeVisible();
});

test("reading older messages never moves the page or pulls the reader back to the latest reply", async ({ page }) => {
  await seedVisitor(page);
  await page.addInitScript((messages) => {
    localStorage.setItem("chat_history_confucius", JSON.stringify(messages));
  }, createLongHistory());
  await page.route("**/api/chat?stream=1", (route) => route.fulfill({
    contentType: "text/event-stream",
    body: [
      'data: {"type":"delta","content":"这是一段新增的回复。"}',
      'data: {"type":"complete"}',
      "",
    ].join("\n\n"),
  }));

  await page.goto("/chat/confucius");
  const scrollArea = page.getByTestId("chat-scroll-area");
  const input = page.getByRole("textbox", { name: "开启对话..." });
  await expect(scrollArea).toBeVisible();

  const before = await page.evaluate(() => {
    const header = document.querySelector("header")?.getBoundingClientRect();
    const composer = document.querySelector<HTMLElement>('[data-testid="chat-composer"]')?.getBoundingClientRect();
    return { headerTop: header?.top, composerTop: composer?.top, pageTop: window.scrollY };
  });

  await scrollArea.evaluate((element) => {
    element.scrollTop = 0;
    element.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, pointerId: 1, pointerType: "touch" }));
    element.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, pointerId: 1, pointerType: "touch" }));
  });
  await expect.poll(() => scrollArea.evaluate((element) => element.scrollTop)).toBe(0);

  await input.fill("我正在阅读前面的消息。");
  await input.press("Enter");
  await expect(page.getByText("这是一段新增的回复。")).toBeVisible();

  await expect.poll(() => scrollArea.evaluate((element) => element.scrollTop)).toBe(0);
  const after = await page.evaluate(() => {
    const header = document.querySelector("header")?.getBoundingClientRect();
    const composer = document.querySelector<HTMLElement>('[data-testid="chat-composer"]')?.getBoundingClientRect();
    return {
      headerTop: header?.top,
      composerTop: composer?.top,
      pageTop: window.scrollY,
      chatSurface: document.documentElement.dataset.chatSurface,
    };
  });
  expect(after).toMatchObject({
    headerTop: before.headerTop,
    composerTop: before.composerTop,
    pageTop: before.pageTop,
    chatSurface: "true",
  });
});

test("first-visit privacy choice never hides the composer", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.removeItem("wan_gu_ling_xi_privacy_consent");
    localStorage.setItem("user_profile", JSON.stringify({ name: "Test User", interests: [], language: "zh" }));
  });
  await page.goto("/chat/confucius");
  const composer = page.getByTestId("chat-composer");
  const consentBanner = page.getByTestId("privacy-consent-banner");
  await expect(composer).toBeVisible();
  await expect(consentBanner).toBeVisible();
  await expect.poll(() => page.evaluate(() => {
    const composerElement = document.querySelector<HTMLElement>('[data-testid="chat-composer"]');
    const bannerElement = document.querySelector<HTMLElement>('[data-testid="privacy-consent-banner"]');
    if (!composerElement || !bannerElement) return false;
    const composerRect = composerElement.getBoundingClientRect();
    const bannerRect = bannerElement.getBoundingClientRect();
    return bannerRect.bottom <= composerRect.top || bannerRect.top >= composerRect.bottom;
  })).toBe(true);
});

test("chat composer passes the WCAG AA automated scan", async ({ page }) => {
  await seedVisitor(page);
  await page.addInitScript(() => {
    localStorage.setItem("chat_history_confucius", JSON.stringify([{
      id: "a11y-static-message",
      role: "user",
      content: "用于无障碍扫描的静态消息。",
      timestamp: Date.now(),
    }]));
  });
  await page.goto("/chat/confucius");
  await expect(page.getByRole("textbox", { name: "开启对话..." })).toBeVisible();
  const message = page.locator('[data-msg-id="a11y-static-message"]');
  await expect(message).toBeVisible();
  await expect.poll(() => message.evaluate((element) => getComputedStyle(element).opacity)).toBe("1");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});

test("local experience login never submits the password", async ({ page }) => {
  const postedBodies: string[] = [];
  page.on("request", (request) => {
    if (request.method() === "POST") postedBodies.push(request.postData() || "");
  });
  await page.goto("/login");
  await page.getByLabel("体验邮箱").fill("visitor@example.com");
  await page.getByLabel("体验密码").fill("not-stored-anywhere");
  await page.getByRole("button", { name: "进入本机体验" }).click();
  await expect.poll(() => page.evaluate(() => localStorage.getItem("wan_gu_ling_xi_local_session_v1") || "")).toContain("visitor@example.com");
  await expect.poll(() => page.evaluate(() => localStorage.getItem("wan_gu_ling_xi_local_session_v1") || "")).not.toContain("not-stored-anywhere");
  expect(postedBodies.join("\n")).not.toContain("not-stored-anywhere");
});

test("AI endpoint is not called until AI processing is explicitly allowed", async ({ page }) => {
  const browsingOnly = { ...acceptedConsent, aiProcessing: false };
  await seedVisitor(page, browsingOnly);
  let greetingCalls = 0;
  await page.route("**/api/greeting", (route) => { greetingCalls += 1; return route.abort(); });
  await page.goto("/chat/confucius");
  await expect(page.getByText("请先在页面底部选择")).toBeVisible();
  expect(greetingCalls).toBe(0);
});
