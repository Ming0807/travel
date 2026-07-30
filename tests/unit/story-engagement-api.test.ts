import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  record: vi.fn(),
}));

vi.mock("@/lib/services/story-engagement.service", () => ({
  recordStoryEngagementSignal: (...args: unknown[]) => mocks.record(...args),
}));

import { POST } from "@/app/api/content/events/route";

function request(
  body: unknown,
  options: {
    origin?: string;
    contentType?: string;
  } = {},
) {
  return new NextRequest("http://localhost:3000/api/content/events", {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "content-type": options.contentType ?? "application/json",
      origin: options.origin ?? "http://localhost:3000",
      "x-forwarded-for": "203.0.113.8",
    },
  });
}

const validPayload = {
  event: "story_open",
  storyId: 42,
  surface: "story_detail",
  locale: "th",
  nonce: "0123456789abcdef0123456789abcdef",
};

describe("POST /api/content/events", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.APP_ENV = "test";
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
    process.env.CONTENT_ENGAGEMENT_HASH_SECRET =
      "0123456789abcdef0123456789abcdef";
    mocks.record.mockResolvedValue({ accepted: true });
  });

  it("records a minimized event without forwarding a raw IP or origin", async () => {
    const response = await POST(request(validPayload));

    expect(response.status).toBe(202);
    expect(await response.json()).toEqual({ success: true });
    expect(mocks.record).toHaveBeenCalledOnce();
    expect(mocks.record.mock.calls[0][0]).toEqual(validPayload);
    expect(mocks.record.mock.calls[0][1]).toEqual(
      expect.objectContaining({
        transientSource: "203.0.113.8",
        origin: "http://localhost:3000",
      }),
    );
  });

  it("rejects cross-origin and non-JSON requests before calling the service", async () => {
    const crossOrigin = await POST(
      request(validPayload, { origin: "https://evil.example" }),
    );
    const nonJson = await POST(
      request(validPayload, { contentType: "text/plain" }),
    );

    expect(crossOrigin.status).toBe(403);
    expect(nonJson.status).toBe(415);
    expect(mocks.record).not.toHaveBeenCalled();
  });

  it("rejects invalid and oversized payloads", async () => {
    const invalid = await POST(
      request({ ...validPayload, touristId: "tourist-1" }),
    );
    const oversized = await POST(
      request({ ...validPayload, nonce: "a".repeat(2_100) }),
    );

    expect(invalid.status).toBe(400);
    expect(oversized.status).toBe(413);
    expect(mocks.record).not.toHaveBeenCalled();
  });

  it("returns a generic unavailable response without leaking service errors", async () => {
    mocks.record.mockRejectedValueOnce(new Error("database details"));

    const response = await POST(request(validPayload));
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body).toEqual({
      success: false,
      error: {
        code: "ENGAGEMENT_UNAVAILABLE",
        message: "ไม่สามารถบันทึกข้อมูลการใช้งานได้ในขณะนี้",
      },
    });
    expect(JSON.stringify(body)).not.toContain("database details");
  });
});
