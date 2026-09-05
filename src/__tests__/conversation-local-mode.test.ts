import { NextRequest } from "next/server";
import { GET as getConversationList } from "@/app/api/conversations/route";
import { GET as getConversation } from "@/app/api/conversations/[celebrityId]/route";
import { ErrorCode } from "@/lib/errors";
import { getAuthenticatedUser } from "@/lib/supabase/server";

jest.mock("@/lib/supabase/server", () => ({
  getAuthenticatedUser: jest.fn(),
}));

const mockGetAuthenticatedUser = getAuthenticatedUser as jest.MockedFunction<typeof getAuthenticatedUser>;

describe("conversation cloud-sync fallback", () => {
  beforeEach(() => {
    mockGetAuthenticatedUser.mockResolvedValue({ supabase: null, user: null });
  });

  it("keeps the conversation list in local mode without returning a 5xx error", async () => {
    const response = await getConversationList();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      success: false,
      error: ErrorCode.CONFIGURATION_REQUIRED,
      storage: "local",
    });
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });

  it("keeps an individual chat in local mode without returning a 5xx error", async () => {
    const response = await getConversation(
      new NextRequest("https://app.example.com/api/conversations/confucius"),
      { params: Promise.resolve({ celebrityId: "confucius" }) }
    );

    expect(response).toBeDefined();
    if (!response) throw new Error("Conversation route did not return a response");
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      success: false,
      error: ErrorCode.CONFIGURATION_REQUIRED,
      storage: "local",
    });
  });
});
