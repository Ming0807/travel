import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ rows: vi.fn(), issues: vi.fn(), actions: vi.fn(), permission: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("@/lib/auth/guards", () => ({ requirePermission: mocks.permission }));
vi.mock("@/lib/repositories/attraction-analytics.repository", () => ({
  getAttractionAnalyticsRows: mocks.rows,
  ATTRACTION_ANALYTICS_VISIT_LIMIT: 5000,
  ATTRACTION_ANALYTICS_FUNNEL_LIMIT: 10000,
}));
vi.mock("@/lib/repositories/attraction-feedback.repository", () => ({
  listIssuesForAttraction: mocks.issues,
  listActionsForIssues: mocks.actions,
}));

import { getAttractionAnalytics } from "@/lib/services/attraction-analytics.service";

const filters = { attractionId: 4, dateFrom: "2026-05-01", dateTo: "2026-05-03", evidenceScope: "all_records" as const };

function rows(truncated = false) {
  return {
    attraction: { attractionId: 4, nameTh: "วัดหน้าถ้ำ", districtNameTh: "เมืองยะลา", provinceId: 1, attractionTypeId: null, attractionTypeNameTh: null },
    attractions: [{ value: 4, label: "วัดหน้าถ้ำ" }],
    checkinCodes: [],
    visits: [
      { visit_id: "v1", tourist_id: "t1", visit_date: "2026-05-01", attraction_id: 4 },
      { visit_id: "v2", tourist_id: "t2", visit_date: "2026-05-03", attraction_id: 4 },
    ],
    funnelEvents: [], entrySessions: [], channelTrackingEnabled: false,
    channelAsOf: "2026-05-04T00:00:00Z", peerVisits: [], truncated,
  };
}

describe("attraction visit trend", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.permission.mockResolvedValue({ actor: { displayName: "Admin", permissions: ["dashboard.read"] } });
    mocks.issues.mockResolvedValue([]);
    mocks.actions.mockResolvedValue([]);
    mocks.rows.mockResolvedValue(rows());
  });

  it("shows quiet days as zero only for a complete read", async () => {
    const result = await getAttractionAnalytics(filters);
    expect(result?.trend).toEqual([
      { label: "2026-05-01", value: 1 },
      { label: "2026-05-02", value: 0 },
      { label: "2026-05-03", value: 1 },
    ]);
    expect(result?.kpis.visits).toBe(2);
  });

  it("withholds the trend when any required live read is incomplete", async () => {
    mocks.rows.mockResolvedValue(rows(true));
    const result = await getAttractionAnalytics(filters);
    expect(result?.quality.truncated).toBe(true);
    expect(result?.trend).toEqual([]);
  });
});
