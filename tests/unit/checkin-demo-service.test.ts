import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getCheckinCodeByCode,
  listPublicDemoCheckinCodes,
  type CheckinCodeDetails,
} from "@/lib/repositories/checkin.repository";
import { resolvePublicDemoCheckinCode } from "@/lib/services/checkin.service";

vi.mock("@/lib/auth/checkin-session", () => ({
  getCheckinSessionId: vi.fn(),
}));

vi.mock("@/lib/repositories/funnel.repository", () => ({
  recordFunnelEvent: vi.fn(),
}));

vi.mock("@/lib/repositories/checkin.repository", () => ({
  getCheckinCodeByCode: vi.fn(),
  listPublicDemoCheckinCodes: vi.fn(),
}));

function details(code: string, isPublished = true): CheckinCodeDetails {
  return {
    checkin_code_id: 1,
    code,
    is_active: true,
    starts_at: null,
    ends_at: null,
    attraction: {
      attraction_id: 1,
      name_th: "สถานที่ทดสอบ",
      name_en: null,
      short_description_th: null,
      is_active: true,
      is_published: isPublished,
      cover_image_url: null,
      province: {
        province_name_th: "ยะลา",
        is_active: true,
        destination_status: "live",
      },
    },
    photo_spot: null,
  };
}

describe("resolvePublicDemoCheckinCode", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the first demo code that passes the same validation as a scanned QR", async () => {
    vi.mocked(listPublicDemoCheckinCodes).mockResolvedValue(["DEMO-HIDDEN", "DEMO-CODE-123"]);
    vi.mocked(getCheckinCodeByCode)
      .mockResolvedValueOnce(details("DEMO-HIDDEN", false))
      .mockResolvedValueOnce(details("DEMO-CODE-123"));

    await expect(resolvePublicDemoCheckinCode()).resolves.toBe("DEMO-CODE-123");
  });

  it("does not fall back to an arbitrary production check-in code", async () => {
    vi.mocked(listPublicDemoCheckinCodes).mockResolvedValue([]);

    await expect(resolvePublicDemoCheckinCode()).resolves.toBeNull();
    expect(getCheckinCodeByCode).not.toHaveBeenCalled();
  });
});
