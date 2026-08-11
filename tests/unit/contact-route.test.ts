import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  from: vi.fn(),
  insert: vi.fn(),
  rateLimit: vi.fn(),
}));

vi.mock("@/lib/supabase/service-role", () => ({
  createSupabaseServiceRoleClient: () => ({ from: mocks.from }),
}));

vi.mock("@/lib/utils/rate-limit", () => ({
  rateLimit: (...args: unknown[]) => mocks.rateLimit(...args),
}));

import { POST } from "@/app/api/contact/route";

const validPayload = {
  name: "  ผู้ทดสอบระบบ  ",
  email: "  TESTER@EXAMPLE.COM ",
  subject: "  แจ้งปัญหา QR  ",
  message: "  สแกน QR แล้วไม่สามารถเปิดหน้าสร้างใบประกาศได้  ",
};

function makeRequest(payload: unknown, forwardedFor = "203.0.113.8, 10.0.0.1") {
  return new NextRequest("http://localhost/api/contact", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": forwardedFor,
    },
    body: JSON.stringify(payload),
  });
}

describe("POST /api/contact", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.rateLimit.mockReturnValue({ success: true, remaining: 4 });
    mocks.from.mockReturnValue({ insert: mocks.insert });
    mocks.insert.mockResolvedValue({ error: null });
  });

  it("normalizes and stores a valid support message", async () => {
    const response = await POST(makeRequest(validPayload));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(body).toEqual({ success: true, message: "ส่งข้อความเรียบร้อยแล้ว" });
    expect(mocks.rateLimit).toHaveBeenCalledWith("203.0.113.8_contact", 5, 60 * 60 * 1000);
    expect(mocks.from).toHaveBeenCalledWith("contact_messages");
    expect(mocks.insert).toHaveBeenCalledWith({
      name: "ผู้ทดสอบระบบ",
      email: "tester@example.com",
      subject: "แจ้งปัญหา QR",
      message: "สแกน QR แล้วไม่สามารถเปิดหน้าสร้างใบประกาศได้",
      status: "unread",
      is_replied: false,
    });
  });

  it("returns structured field errors without writing invalid data", async () => {
    const response = await POST(makeRequest({
      name: "ก",
      email: "not-an-email",
      message: "สั้น",
    }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toMatchObject({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        details: {
          name: expect.any(Array),
          email: expect.any(Array),
          message: expect.any(Array),
        },
      },
    });
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it("rate limits repeated contact attempts before database access", async () => {
    mocks.rateLimit.mockReturnValue({ success: false, remaining: 0 });

    const response = await POST(makeRequest(validPayload));
    const body = await response.json();

    expect(response.status).toBe(429);
    expect(body).toMatchObject({ success: false, error: { code: "RATE_LIMITED" } });
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it("does not expose database details when saving fails", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    mocks.insert.mockResolvedValue({
      error: { code: "PGRST204", message: "sensitive database detail" },
    });

    const response = await POST(makeRequest(validPayload));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({
      success: false,
      error: {
        code: "SAVE_FAILED",
        message: "ยังส่งข้อความไม่ได้ กรุณาลองใหม่อีกครั้ง",
      },
    });
    expect(JSON.stringify(body)).not.toContain("sensitive database detail");
    consoleError.mockRestore();
  });
});
