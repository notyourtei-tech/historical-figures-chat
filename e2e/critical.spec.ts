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
  await expect.poll(() => page.evaluate(() => localStorage.getItem("chat_history_confucius") || "")).toContain("我今天该如何学习？");
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
