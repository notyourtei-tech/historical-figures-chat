import { expect, test } from "@playwright/test";

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
