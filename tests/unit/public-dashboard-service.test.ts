import { beforeEach, describe, expect, it, vi } from "vitest";
import { getPublicDashboardProvinceScope } from "@/lib/repositories/dashboard.repository";
import { getPublicDashboardAnalytics } from "@/lib/services/dashboard.service";
import { getPublicDashboardEvidence } from "@/lib/services/public-dashboard.service";
import type { DashboardViewModel } from "@/types/dashboard";

vi.mock("@/lib/repositories/dashboard.repository", () => ({
  getPublicDashboardProvinceScope: vi.fn(),
}));

vi.mock("@/lib/services/dashboard.service", () => ({
  getPublicDashboardAnalytics: vi.fn(),
}));

describe("public dashboard service", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("forces the Yala province scope even when a caller supplies another province", async () => {
    vi.mocked(getPublicDashboardProvinceScope).mockResolvedValue({ provinceId: 1, provinceName: "ยะลา" });
    vi.mocked(getPublicDashboardAnalytics).mockResolvedValue({
      filters: { dateFrom: "2026-07-13", dateTo: "2026-08-11", provinceId: 1 },
      generatedAt: "2026-08-11T12:00:00.000Z",
      kpis: [],
      executive: { visitTrend: [], visitsByProvince: [], topAttractions: [] },
      touristProfile: { ageGroups: [], originProvinces: [] },
      travelBehavior: { transportModes: [], companionTypes: [], overnightStatus: [] },
      satisfaction: {
        responseCount: 0, averageOverall: null, safetyAverage: null, safetyResponseCount: 0,
        cleanlinessAverage: null, cleanlinessResponseCount: 0, accessibilityAverage: null,
        accessibilityResponseCount: 0, informationAverage: null, informationResponseCount: 0,
        valueAverage: null, valueResponseCount: 0,
      },
    } as unknown as DashboardViewModel);

    const result = await getPublicDashboardEvidence({ province_id: "2" });

    expect(getPublicDashboardAnalytics).toHaveBeenCalledWith(
      expect.objectContaining({ province_id: "1", provinceId: "1" }),
    );
    expect(result.scope.provinceName).toBe("ยะลา");
  });
});
