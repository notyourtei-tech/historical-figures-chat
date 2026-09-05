import { rateLimit, getClientIp, sanitizeInput, isValidCelebrityId } from "@/lib/rate-limit";

describe("rateLimit", () => {
  beforeEach(() => {
    jest.clearAllTimers();
  });

  it("allows first request", async () => {
    const result = await rateLimit("test-ip-" + Date.now(), 5, 60000);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it("counts requests within window", async () => {
    const key = "count-test-" + Date.now();
    await rateLimit(key, 3, 60000);
    await rateLimit(key, 3, 60000);
    const r3 = await rateLimit(key, 3, 60000);
    expect(r3.allowed).toBe(true);
    expect(r3.remaining).toBe(0);
  });

  it("blocks after limit exceeded", async () => {
    const key = "block-test-" + Date.now();
    await rateLimit(key, 2, 60000);
    await rateLimit(key, 2, 60000);
    const r3 = await rateLimit(key, 2, 60000);
    expect(r3.allowed).toBe(false);
    expect(r3.remaining).toBe(0);
  });

  it("resets after window expires", async () => {
    jest.useFakeTimers();
    const key = "reset-test-" + Date.now();
    await rateLimit(key, 1, 100);
    const blocked = await rateLimit(key, 1, 100);
    expect(blocked.allowed).toBe(false);

    jest.advanceTimersByTime(150);
    const allowed = await rateLimit(key, 1, 100);
    expect(allowed.allowed).toBe(true);
    jest.useRealTimers();
  });
});

describe("getClientIp", () => {
  it("extracts first IP from x-forwarded-for", () => {
    const headers = new Headers({ "x-forwarded-for": "1.2.3.4, 5.6.7.8" });
    expect(getClientIp(headers)).toBe("1.2.3.4");
  });

  it("falls back to x-real-ip", () => {
    const headers = new Headers({ "x-real-ip": "9.8.7.6" });
    expect(getClientIp(headers)).toBe("9.8.7.6");
  });

  it("returns unknown when no headers", () => {
    const headers = new Headers();
    expect(getClientIp(headers)).toBe("unknown");
  });
});

describe("sanitizeInput", () => {
  it("removes script content", () => {
    expect(sanitizeInput("<script>alert('xss')</script>")).toBe("");
  });

  it("strips javascript: protocol", () => {
    expect(sanitizeInput("javascript:alert(1)")).toBe("alert(1)");
  });

  it("strips event handlers partially", () => {
    const result = sanitizeInput('onclick="alert(1)"');
    expect(result).not.toContain("onclick");
  });

  it("removes null bytes", () => {
    expect(sanitizeInput("hello\x00world")).toBe("helloworld");
  });

  it("trims and enforces length limit", () => {
    const long = "a".repeat(3000);
    expect(sanitizeInput(long, 2000).length).toBe(2000);
  });

  it("trims whitespace", () => {
    expect(sanitizeInput("  hello  ")).toBe("hello");
  });
});

describe("isValidCelebrityId", () => {
  it("returns true for valid id", () => {
    expect(isValidCelebrityId("confucius")).toBe(true);
  });

  it("returns false for invalid id", () => {
    expect(isValidCelebrityId("nonexistent")).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(isValidCelebrityId("")).toBe(false);
  });
});
