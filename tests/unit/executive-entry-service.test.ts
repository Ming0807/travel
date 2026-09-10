import { beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ guard: vi.fn(), read: vi.fn() }));
vi.mock("@/lib/auth/guards", () => ({ requirePermission: mocks.guard }));
vi.mock("@/lib/repositories/executive-entry.repository", () => ({ readExecutiveEntryCohort: mocks.read }));
import { getExecutiveEntryAnalytics } from "@/lib/services/executive-entry.service";
import { buildExecutiveEntryExportRows } from "@/lib/dashboard/executive-entry-export";
import { buildDashboardSummaryExportRows } from "@/lib/dashboard/dashboard-summary-export";
const filters = { dateFrom: "2026-09-01", dateTo: "2026-09-10", evidenceScope: "field_claim" };
const asOf = "2026-09-10T00:00:00Z";
const rows = Array.from({ length: 20 }, (_, i) => ({ entry_session_id: `entry-${i}`, entry_channel: "qr", evidence_scope: "field_observation", created_at: "2026-09-01T00:00:00Z", visit_id: `visit-${i}`, visits: { created_at: "2026-09-02T00:00:00Z", certificates: [{ generated_at: i < 10 ? "2026-09-03T00:00:00Z" : "2026-09-11T00:00:00Z" }] } }));
beforeEach(() => { vi.resetAllMocks(); mocks.guard.mockResolvedValue({}); mocks.read.mockResolvedValue({ status: "ready", asOf, rows, unsupportedFilters: [] }); });
it("authorizes and validates before database access", async () => {
  mocks.guard.mockRejectedValueOnce(new Error("FORBIDDEN"));
  await expect(getExecutiveEntryAnalytics(filters)).rejects.toThrow("FORBIDDEN");
  expect(mocks.read).not.toHaveBeenCalled();
  await expect(getExecutiveEntryAnalytics({ ...filters, dateTo: "invalid" })).rejects.toThrow();
  expect(mocks.read).not.toHaveBeenCalled();
});
it("shares scope, cutoff and suppression math without exporting raw IDs or Visit coverage", async () => {
  const result = await getExecutiveEntryAnalytics(filters);
  expect(result.status).toBe("ready");
  expect(result.data?.channels[0]).toMatchObject({ entries: 20, linkedVisits: 20, certificates: 10, certificateConversion: 50 });
  expect(result.data).not.toHaveProperty("attributionCoverage");
  expect(JSON.stringify(result)).not.toContain("visit-0");
  expect(JSON.stringify(result)).not.toContain("entry-0");
  expect(mocks.guard).toHaveBeenCalledWith("dashboard.read", { unauthenticated: "throw" });
  const exported = buildExecutiveEntryExportRows(result);
  expect(exported.find(row => row.Metric === "qr_certificates_percent")).toMatchObject({ Value: 50, Denominator: 20 });
  expect(exported.some(row => row.Section === "Entry attribution coverage")).toBe(false);
  const summary = buildDashboardSummaryExportRows({ kpis: [], executive: { entryCohort: result, visitTrend: [], visitsByProvince: [], topAttractions: [] } });
  expect(summary.find(row => row.Metric === "qr_certificates_percent")).toMatchObject({ Value: 50, Denominator: 20 });
  expect(summary.every(row => Object.keys(row).join() === Object.keys(summary[0]).join())).toBe(true);
});
it.each(["disabled","unsupported_filters","incomplete"])("preserves %s without partial metrics", async status => {
  mocks.read.mockResolvedValue({ status, asOf, rows, unsupportedFilters: ["ageGroup"] });
  const result = await getExecutiveEntryAnalytics(filters);
  expect(result).toMatchObject({ status, data: null });
  expect(buildExecutiveEntryExportRows(result).every(row => row.Section === "Entry channel metadata")).toBe(true);
});
it("does not mistake a query failure for an empty cohort", async () => {
  mocks.read.mockRejectedValue(new Error("private database message"));
  expect(await getExecutiveEntryAnalytics(filters)).toMatchObject({ status: "unavailable", data: null });
});
it("preserves small-cell suppression through the export boundary", async () => {
  mocks.read.mockResolvedValue({ status: "ready", asOf, rows: rows.slice(0,2), unsupportedFilters: [] });
  const result = await getExecutiveEntryAnalytics(filters);
  expect(result.data?.entries).toBeNull();
  expect(buildExecutiveEntryExportRows(result).find(row => row.Metric === "qr_certificates_percent"))
    .toMatchObject({ Value: "SUPPRESSED_OR_UNAVAILABLE", Denominator: "SUPPRESSED_OR_UNAVAILABLE" });
});
