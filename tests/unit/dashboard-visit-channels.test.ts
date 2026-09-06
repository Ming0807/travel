import { describe, expect, it } from "vitest";
import { buildDashboardVisitChannels } from "@/lib/dashboard/visit-channels";
import { buildDashboardSummaryExportRows } from "@/lib/dashboard/dashboard-summary-export";

const rows = (channel: string, count: number) => Array.from({ length: count }, (_, index) => ({
  visit_id: `${channel}-${index}`, checkin_entry_sessions: [{ entry_channel: channel }],
}));

describe("executive Visit channel distribution", () => {
  it("uses unique scoped Visits, not raw scans or legacy channel guesses", () => {
    const visits = [...rows("qr", 20), ...rows("nfc", 10), ...rows("unknown", 10)];
    visits.push(visits[0]);
    const result = buildDashboardVisitChannels(visits, true, false);
    expect(result.status).toBe("ready");
    expect(result.denominator).toBe(40);
    expect(result.distribution.map((row) => row.value)).toEqual([20, 10, 10]);
    expect(result.distribution[0].percent).toBe(0.5);
    expect(JSON.stringify(result)).not.toContain("visit_id");
  });

  it("keeps legacy and ambiguous relations unknown", () => {
    const visits = Array.from({ length: 10 }, (_, index) => ({ visit_id: `legacy-${index}`, entry_channel: "qr" }));
    expect(buildDashboardVisitChannels(visits, true, false).distribution[2].value).toBe(10);
    const ambiguous = Array.from({ length: 10 }, (_, index) => ({ visit_id: `ambiguous-${index}`, checkin_entry_sessions: [{ entry_channel: "qr" }, { entry_channel: "nfc" }] }));
    expect(buildDashboardVisitChannels(ambiguous, true, false).distribution[2].value).toBe(10);
  });

  it("suppresses all cells when a complementary small cell could be derived", () => {
    const result = buildDashboardVisitChannels([...rows("qr", 100), ...rows("nfc", 2)], true, false);
    expect(result).toMatchObject({ status: "suppressed", denominator: null, distribution: [] });
  });

  it("preserves true zero channels when remaining cells are sufficiently large", () => {
    expect(buildDashboardVisitChannels(rows("qr", 10), true, false).distribution.map((row) => row.value)).toEqual([10, 0, 0]);
  });

  it.each([
    [false, false, "disabled"], [true, true, "incomplete"],
  ] as const)("does not leak counts for a blocked state %#", (enabled, incomplete, status) => {
    expect(buildDashboardVisitChannels(rows("qr", 30), enabled, incomplete)).toMatchObject({ status, denominator: null, distribution: [] });
  });

  it("distinguishes empty data from blocked data", () => {
    expect(buildDashboardVisitChannels([], true, false)).toMatchObject({ status: "empty", denominator: 0, distribution: [] });
  });

  it.each([10, 2])("exports the identical visible distribution without suppressed counts (%s)", (count) => {
    const visitChannels = buildDashboardVisitChannels(rows("qr", count), true, false);
    const exported = buildDashboardSummaryExportRows({ kpis: [], executive: { visitChannels, visitTrend: [], visitsByProvince: [], topAttractions: [] } });
    expect(exported[0].Value).toBe(visitChannels.status);
    expect(exported.slice(1).map((row) => row.Value)).toEqual(visitChannels.distribution.map((row) => row.value));
    if (count === 2) expect(exported).toHaveLength(1);
    else expect(exported[1].Denominator).toBe(10);
  });
});
