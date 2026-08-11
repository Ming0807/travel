import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

import { POST } from "@/app/api/line/recover/route";
import { verifyLineIdToken } from "@/lib/line/verify";
import { recoverTouristPassportWithLine } from "@/lib/repositories/tourist-identity.repository";
import { cookies } from "next/headers";

vi.mock("@/lib/line/verify", () => ({ verifyLineIdToken: vi.fn() }));
vi.mock("@/lib/repositories/tourist-identity.repository", () => ({
  recoverTouristPassportWithLine: vi.fn(),
}));
vi.mock("next/headers", () => ({ cookies: vi.fn() }));

const setCookie = vi.fn();

function createRequest() {
  return new NextRequest("https://travel.example/api/line/recover", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      idToken: "x".repeat(24),
      hasConsented: true,
      language: "th",
    }),
  });
}

describe("POST /api/line/recover", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(verifyLineIdToken).mockResolvedValue({
      provider: "line",
      providerUserId: "line-user",
      displayName: "ผู้เดินทาง",
      pictureUrl: null,
    });
    vi.mocked(recoverTouristPassportWithLine).mockResolvedValue({ status: "recovered" });
    vi.mocked(cookies).mockResolvedValue({ set: setCookie } as never);
  });

  it("records recovery consent atomically before setting the device cookie", async () => {
    const response = await POST(createRequest());

    expect(response.status).toBe(200);
    expect(recoverTouristPassportWithLine).toHaveBeenCalledWith({
      lineProviderUserId: "line-user",
      newGuestToken: expect.any(String),
      language: "th",
      consentVersion: "line_recovery_v1",
      consentPurposeKey: "passport_recovery",
    });
    expect(setCookie).toHaveBeenCalledWith(
      "sbtp_guest_id",
      expect.any(String),
      expect.objectContaining({ httpOnly: true, sameSite: "lax", path: "/" }),
    );
    await expect(response.json()).resolves.toEqual({ success: true, recovered: true });
  });

  it("does not set a cookie when the atomic recovery fails", async () => {
    vi.mocked(recoverTouristPassportWithLine).mockRejectedValue(new Error("TOURIST_NOT_FOUND"));

    const response = await POST(createRequest());

    expect(response.status).toBe(404);
    expect(setCookie).not.toHaveBeenCalled();
    const payload = await response.json();
    expect(payload).toEqual({
      success: false,
      error: {
        code: "TOURIST_NOT_FOUND",
        message: "ไม่พบพาสปอร์ตที่เชื่อมกับบัญชี LINE นี้",
      },
    });
    expect(JSON.stringify(payload)).not.toContain("line-user");
  });
});
