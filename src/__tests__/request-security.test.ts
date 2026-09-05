import { NextRequest } from "next/server";
import { isSameOriginRequest } from "@/lib/request-security";

describe("same-origin protection", () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const mutableEnvironment = process.env as Record<string, string | undefined>;

  beforeEach(() => {
    mutableEnvironment.NODE_ENV = "production";
  });

  afterAll(() => {
    if (originalNodeEnv === undefined) delete mutableEnvironment.NODE_ENV;
    else mutableEnvironment.NODE_ENV = originalNodeEnv;
  });

  it("accepts a same-origin secure state change", () => {
    const request = new NextRequest("https://app.example.com/api/account", {
      method: "DELETE",
      headers: { host: "app.example.com", origin: "https://app.example.com" },
    });
    expect(isSameOriginRequest(request)).toBe(true);
  });

  it("rejects a cross-origin or origin-less state change", () => {
    const crossOrigin = new NextRequest("https://app.example.com/api/account", {
      method: "DELETE",
      headers: { host: "app.example.com", origin: "https://attacker.example" },
    });
    const missingOrigin = new NextRequest("https://app.example.com/api/account", {
      method: "DELETE",
      headers: { host: "app.example.com" },
    });
    expect(isSameOriginRequest(crossOrigin)).toBe(false);
    expect(isSameOriginRequest(missingOrigin)).toBe(false);
  });
});
