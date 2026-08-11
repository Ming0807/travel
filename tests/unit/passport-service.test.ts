import { beforeEach, describe, expect, it, vi } from "vitest";
import { getCurrentTouristPassport } from "@/lib/services/passport.service";
import { resolveCurrentTouristId } from "@/lib/auth/guards";
import {
  listPassportStamps,
  listPublishedAttractionStampTargets,
  listRecentPassportVisits,
} from "@/lib/repositories/passport.repository";
import { getTouristById, listTouristIdentityProviders } from "@/lib/repositories/tourist.repository";

vi.mock("@/lib/auth/guards", () => ({ resolveCurrentTouristId: vi.fn() }));
vi.mock("@/lib/repositories/funnel.repository", () => ({ recordFunnelEvent: vi.fn() }));
vi.mock("@/lib/repositories/passport.repository", () => ({
  listPassportStamps: vi.fn(),
  listPublishedAttractionStampTargets: vi.fn(),
  listRecentPassportVisits: vi.fn(),
}));
vi.mock("@/lib/repositories/tourist.repository", () => ({
  getTouristById: vi.fn(),
  listTouristIdentityProviders: vi.fn(),
}));

const touristId = "10000000-0000-4000-8000-000000000099";

describe("getCurrentTouristPassport", () => {
  beforeEach(() => {
    vi.mocked(resolveCurrentTouristId).mockResolvedValue(touristId);
    vi.mocked(getTouristById).mockResolvedValue({ display_name: "นักเดินทาง" } as never);
    vi.mocked(listTouristIdentityProviders).mockResolvedValue([{ provider: "anonymous_device" }] as never);
    vi.mocked(listPassportStamps).mockResolvedValue([] as never);
    vi.mocked(listPublishedAttractionStampTargets).mockResolvedValue([] as never);
    vi.mocked(listRecentPassportVisits).mockResolvedValue([] as never);
  });

  it("uses only the resolved tourist id for owned passport data", async () => {
    await getCurrentTouristPassport();

    expect(getTouristById).toHaveBeenCalledWith(touristId);
    expect(listTouristIdentityProviders).toHaveBeenCalledWith(touristId);
    expect(listPassportStamps).toHaveBeenCalledWith(touristId);
    expect(listRecentPassportVisits).toHaveBeenCalledWith(touristId);
  });

  it("maps earned targets and recent completed visits without exposing identity fields", async () => {
    vi.mocked(listPassportStamps).mockResolvedValue([
      {
        earned_at: "2026-08-10T10:00:00.000Z",
        stamp_definitions: { stamp_name_th: "ตราสกายวอล์ก", stamp_image_path: null },
        attractions: {
          slug: "aiyerweng-skywalk",
          name_th: "สกายวอล์กอัยเยอร์เวง",
          provinces: { province_name_th: "ยะลา" },
        },
      },
    ] as never);
    vi.mocked(listPublishedAttractionStampTargets).mockResolvedValue([
      {
        slug: "aiyerweng-skywalk",
        name_th: "สกายวอล์กอัยเยอร์เวง",
        provinces: { province_name_th: "ยะลา" },
        stamp_definitions: { stamp_name_th: "ตราสกายวอล์ก", stamp_image_path: null, is_active: true },
      },
    ] as never);
    vi.mocked(listRecentPassportVisits).mockResolvedValue([
      {
        visit_date: "2026-08-10",
        visited_at: "2026-08-10T09:30:00.000Z",
        created_at: "2026-08-10T09:00:00.000Z",
        attractions: {
          slug: "aiyerweng-skywalk",
          name_th: "สกายวอล์กอัยเยอร์เวง",
          provinces: { province_name_th: "ยะลา" },
        },
      },
    ] as never);

    const result = await getCurrentTouristPassport();

    expect(result.totalStampsEarned).toBe(1);
    expect(result.totalStampTargets).toBe(1);
    expect(result.stampTargetsByProvince[0]?.targets[0]).toMatchObject({
      attractionSlug: "aiyerweng-skywalk",
      isEarned: true,
      earnedAt: "2026-08-10T10:00:00.000Z",
    });
    expect(result.recentVisits[0]).toEqual({
      attractionName: "สกายวอล์กอัยเยอร์เวง",
      attractionSlug: "aiyerweng-skywalk",
      provinceName: "ยะลา",
      visitedAt: "2026-08-10T09:30:00.000Z",
    });
    expect(result).not.toHaveProperty("touristId");
    expect(result).not.toHaveProperty("providerUserId");
  });
});
