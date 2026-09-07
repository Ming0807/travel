import { beforeEach, describe, expect, it, vi } from "vitest";
import type { DashboardFilters } from "@/types/dashboard";
const from = vi.hoisted(() => vi.fn());
vi.mock("@/lib/supabase/service-role", () => ({ createSupabaseServiceRoleClient: () => ({ from }) }));
import { getDashboardSummaryKpis, getDashboardSummaryTrend, getDashboardSummaryByProvince, getDashboardSummaryTopAttractions, getDashboardSummaryFunnelCounts } from "@/lib/repositories/dashboard-summary.repository";

describe("legacy daily summary evidence boundary", () => {
  beforeEach(() => vi.resetAllMocks());
  const readers = [getDashboardSummaryKpis, getDashboardSummaryTrend, getDashboardSummaryByProvince, getDashboardSummaryTopAttractions, getDashboardSummaryFunnelCounts];
  it.each(readers)("rejects field claims before querying an unsegmented summary (%#)", async (read) => {
    await expect(read({ dateFrom: "2026-09-01", dateTo: "2026-09-07" })).rejects.toThrow("DASHBOARD_SUMMARY_SCOPE_UNSUPPORTED");
    expect(from).not.toHaveBeenCalled();
  });
  it.each(["pilot_only", "simulated_only", "field_claim"] as const)("cannot interpret the summary as %s", async (evidenceScope) => {
    await expect(getDashboardSummaryKpis({ dateFrom: "2026-09-01", dateTo: "2026-09-07", evidenceScope })).rejects.toThrow("DASHBOARD_SUMMARY_SCOPE_UNSUPPORTED");
  });
  it.each([{ ageGroup: "18-24" }, { districtId: 1 }, { satisfactionMin: 4 }, { attractionTypeId: 2 }])("rejects unsupported dimensions even for all records %#", async (extra: Partial<DashboardFilters>) => {
    await expect(getDashboardSummaryTrend({ dateFrom: "2026-09-01", dateTo: "2026-09-07", evidenceScope: "all_records", ...extra })).rejects.toThrow("DASHBOARD_SUMMARY_SCOPE_UNSUPPORTED");
  });
  it("retains explicit all-record date/attraction reads for diagnostic use", async () => {
    const query = { select: vi.fn(), gte: vi.fn(), lte: vi.fn(), eq: vi.fn(), then: vi.fn() };
    for (const method of [query.select, query.gte, query.lte, query.eq]) method.mockReturnValue(query);
    query.then.mockImplementation((resolve: (value: unknown) => unknown) => resolve({ data: [], error: null }));
    from.mockReturnValue(query);
    expect(await getDashboardSummaryTrend({ dateFrom: "2026-09-01", dateTo: "2026-09-07", evidenceScope: "all_records", attractionId: 4 })).toEqual([]);
    expect(query.eq).toHaveBeenCalledWith("attraction_id", 4);
  });
});
