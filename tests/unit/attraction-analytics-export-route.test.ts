import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  analytics: vi.fn(),
  audit: vi.fn(),
  createExportResponse: vi.fn(),
  permission: vi.fn(),
}));

vi.mock("@/lib/auth/guards", () => ({
  AdminAuthError: class AdminAuthError extends Error { code = "UNAUTHORIZED"; },
  requirePermission: mocks.permission,
}));

vi.mock("@/lib/services/attraction-analytics.service", () => ({
  getAttractionAnalytics: mocks.analytics,
}));

vi.mock("@/lib/services/audit-log.service", () => ({
  logAuditAction: mocks.audit,
}));

vi.mock("@/lib/utils/export-response", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/lib/utils/export-response")>();
  return { ...original, createExportResponse: mocks.createExportResponse };
});

import { GET } from "@/app/api/admin/dashboard/attractions/export/route";

function analyticsData(overrides: Record<string, unknown> = {}) {
  return {
    generatedAt: "2026-09-04T02:00:00.000Z",
    kpis: { uniqueTourists: 20, visits: 24, repeatVisits: 4, certificateVisits: 18, surveyRate: 75 },
    satisfaction: [],
    funnel: [],
    expenses: { ranges: [], categories: [], note: "Self-reported, not revenue" },
    quality: { truncated: false, smallCellThreshold: 10, scopeNote: "field scope" },
    metricContract: [{ key: "visits", source: "visits", denominator: "ไม่มี" }],
    ...overrides,
  };
}

describe("attraction analytics export route", () => {
  beforeEach(() => {
    mocks.analytics.mockReset();
    mocks.audit.mockReset();
    mocks.createExportResponse.mockReset();
    mocks.audit.mockResolvedValue(undefined);
    mocks.permission.mockReset();
    mocks.permission.mockResolvedValue({ actor: { adminUserId: 1 } });
    mocks.createExportResponse.mockResolvedValue(new Response("ok", { status: 200 }));
  });

  it("embeds reproducible metadata and audits only validated filters", async () => {
    mocks.analytics.mockResolvedValue(analyticsData());
    const response = await GET(new Request(
      "http://localhost/api/admin/dashboard/attractions/export?attractionId=4&dateFrom=2026-08-01&dateTo=2026-08-31&evidenceScope=field_claim&email=person@example.com",
    ));

    expect(response.status).toBe(200);
    const rows = mocks.createExportResponse.mock.calls[0]?.[0] as Array<Record<string, unknown>>;
    expect(rows[0]).toMatchObject({
      Section: "Metadata",
      Metric: "report_title",
      Value: "รายงานวิเคราะห์ระดับสถานที่",
    });
    expect(rows.some((row) => row.Metric === "metric_version")).toBe(true);
    expect(rows.some((row) => row.Metric === "exclusions")).toBe(true);
    expect(rows.some((row) => row.Metric === "suppression_note")).toBe(true);
    const audit = mocks.audit.mock.calls.at(-1)?.[0];
    expect(JSON.stringify(audit)).not.toContain("person@example.com");
    expect(audit.metadata.filters).toMatchObject({ attractionId: 4, evidenceScope: "field_claim" });
  });

  it("audits invalid filters without storing raw values", async () => {
    const response = await GET(new Request(
      "http://localhost/api/admin/dashboard/attractions/export?attractionId=not-an-id&dateFrom=bad&dateTo=2026-08-31&email=person@example.com",
    ));

    expect(response.status).toBe(400);
    expect(mocks.audit).toHaveBeenCalledOnce();
    const audit = mocks.audit.mock.calls[0]?.[0];
    expect(audit.result).toBe("failed");
    expect(audit.metadata).toEqual({ reason: "invalid_filters" });
    expect(JSON.stringify(audit)).not.toContain("person@example.com");
  });

  it("audits blocked truncated exports", async () => {
    mocks.analytics.mockResolvedValue(analyticsData({
      quality: { truncated: true, smallCellThreshold: 10, scopeNote: "field scope" },
    }));
    const response = await GET(new Request(
      "http://localhost/api/admin/dashboard/attractions/export?attractionId=4&dateFrom=2026-08-01&dateTo=2026-08-31",
    ));

    expect(response.status).toBe(409);
    expect(mocks.audit).toHaveBeenCalledWith(expect.objectContaining({
      result: "failed",
      metadata: expect.objectContaining({ reason: "quality_gate" }),
    }));
  });

  it("blocks low-sample attraction exports before any section can reveal counts", async () => {
    mocks.analytics.mockResolvedValue(analyticsData({
      kpis: { uniqueTourists: 7, visits: 8, repeatVisits: 1, certificateVisits: 6, surveyRate: 50 },
    }));
    const response = await GET(new Request(
      "http://localhost/api/admin/dashboard/attractions/export?attractionId=4&dateFrom=2026-08-01&dateTo=2026-08-31",
    ));

    expect(response.status).toBe(422);
    expect(mocks.createExportResponse).not.toHaveBeenCalled();
    expect(mocks.audit).toHaveBeenCalledWith(expect.objectContaining({ result: "failed", metadata: expect.objectContaining({ qualityReason: "insufficient_sample" }) }));
  });

  it("audits a rendering failure without recording a successful export", async () => {
    mocks.analytics.mockResolvedValue(analyticsData());
    mocks.createExportResponse.mockRejectedValue(new Error("render failed"));
    const response = await GET(new Request("http://localhost/api/admin/dashboard/attractions/export?attractionId=4&dateFrom=2026-08-01&dateTo=2026-08-31"));
    expect(response.status).toBe(500);
    expect(mocks.audit).toHaveBeenCalledOnce();
    expect(mocks.audit).toHaveBeenCalledWith(expect.objectContaining({ result: "failed" }));
  });

  it("rejects and audits an unsupported explicit format", async () => {
    const response = await GET(new Request(
      "http://localhost/api/admin/dashboard/attractions/export?attractionId=4&dateFrom=2026-08-01&dateTo=2026-08-31&format=pdf",
    ));

    expect(response.status).toBe(400);
    expect(mocks.audit).toHaveBeenCalledWith(expect.objectContaining({
      result: "failed",
      metadata: { reason: "invalid_format" },
    }));
  });

  it("audits an export permission denial after dashboard authentication", async () => {
    mocks.permission
      .mockResolvedValueOnce({ actor: { adminUserId: 1 } })
      .mockRejectedValueOnce({ code: "FORBIDDEN" });

    const response = await GET(new Request(
      "http://localhost/api/admin/dashboard/attractions/export?attractionId=4&dateFrom=2026-08-01&dateTo=2026-08-31",
    ));

    expect(response.status).toBe(403);
    expect(mocks.audit).toHaveBeenCalledWith(expect.objectContaining({
      result: "failed",
      metadata: { reason: "permission_denied" },
    }));
  });
});
