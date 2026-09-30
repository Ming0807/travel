import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getCheckinCodeByCode,
  type CheckinCodeDetails,
} from "@/lib/repositories/checkin.repository";
import { resolveAndValidateCheckinCode } from "@/lib/services/checkin.service";

vi.mock("@/lib/auth/checkin-session", () => ({
  getCheckinSessionId: vi.fn(),
}));

vi.mock("@/lib/repositories/funnel.repository", () => ({
  recordFunnelEvent: vi.fn(),
}));

vi.mock("@/lib/repositories/checkin.repository", () => ({
  getCheckinCodeByCode: vi.fn(),
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

describe("demo QR reward isolation", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("blocks a labelled demo even when its direct canonical URL is opened", async () => {
    vi.mocked(getCheckinCodeByCode).mockResolvedValue({
      ...details("DEMO-CODE-123"), label: "Demo QR: Aiyerweng main viewpoint",
    });
    await expect(resolveAndValidateCheckinCode("DEMO-CODE-123"))
      .resolves.toMatchObject({ status: "unavailable" });
  });

  it("keeps genuine venue codes available to guests", async () => {
    vi.mocked(getCheckinCodeByCode).mockResolvedValue({ ...details("YLA-001"), label: "จุดชมวิว" });
    await expect(resolveAndValidateCheckinCode("YLA-001"))
      .resolves.toMatchObject({ status: "valid" });
  });

  it("does not turn an unavailable code into an arbitrary production check-in code", async () => {
    vi.mocked(getCheckinCodeByCode).mockResolvedValue(null);
    await expect(resolveAndValidateCheckinCode("missing"))
      .resolves.toEqual({ status: "not_found" });
    expect(getCheckinCodeByCode).toHaveBeenCalledTimes(1);
    expect(getCheckinCodeByCode).toHaveBeenCalledWith("missing");
  });
});
