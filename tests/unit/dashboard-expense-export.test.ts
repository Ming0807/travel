import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  analytics: vi.fn(),
  repository: vi.fn(),
  exportRows: [] as Array<Record<string, unknown>>,
  audit: vi.fn(),
  permission: vi.fn(),
}));

vi.mock("@/lib/services/dashboard.service", () => ({
  DashboardServiceError: class DashboardServiceError extends Error {
    constructor(public code: string, message: string) {
      super(message);
    }
  },
  getDashboardAnalytics: mocks.analytics,
}));

vi.mock("@/lib/auth/guards", () => ({
  AdminAuthError: class AdminAuthError extends Error {
    constructor(public code: string, message: string) { super(message); }
  },
  requirePermission: mocks.permission,
}));

vi.mock("@/lib/repositories/dashboard.repository", () => ({
  getDashboardRepositoryPayload: mocks.repository,
}));

vi.mock("@/lib/validation/dashboard-filters", () => ({
  parseDashboardFilters: vi.fn(() => ({
    success: true,
    data: {
      dateFrom: "2026-08-01",
      dateTo: "2026-08-31",
      evidenceScope: "field_claim",
    },
  })),
}));

vi.mock("@/lib/utils/export-response", () => ({
  parseExportFormat: vi.fn(() => "csv"),
  parseRequestedExportFormat: vi.fn((raw: string | null) => raw === "pdf" ? null : "csv"),
  createExportResponse: vi.fn(async (rows: Array<Record<string, unknown>>) => {
    mocks.exportRows = rows;
    return new Response("ok", { status: 200 });
  }),
}));

vi.mock("@/lib/services/audit-log.service", () => ({
  logAuditAction: mocks.audit,
}));

import { GET } from "@/app/api/admin/dashboard/export/route";
import { parseDashboardFilters } from "@/lib/validation/dashboard-filters";

describe("dashboard expense export", () => {
  it("uses the first repeated query value just like the dashboard page", async () => {
    mocks.analytics.mockResolvedValue({ quality: { exportAllowed: false, blockers: ["test"] } });
    await GET(new Request("http://localhost/api/admin/dashboard/export?type=expenses&province_id=1&province_id=2"));
    expect(parseDashboardFilters).toHaveBeenLastCalledWith(expect.objectContaining({ province_id: "1" }));
  });

  beforeEach(() => {
    mocks.exportRows = [];
    mocks.analytics.mockReset();
    mocks.repository.mockReset();
    mocks.audit.mockReset();
    mocks.audit.mockResolvedValue(undefined);
    mocks.permission.mockReset();
    mocks.permission.mockResolvedValue({ actor: { adminUserId: 1 } });
  });

  it.each(["summary", "expenses", "tourists", "visits", "surveys"])("rejects anonymous %s exports before reading data", async (type) => {
    mocks.permission.mockRejectedValueOnce({ code: "UNAUTHORIZED" });
    const response = await GET(new Request(`http://localhost/api/admin/dashboard/export?type=${type}`));
    expect(response.status).toBe(401);
    expect(mocks.analytics).not.toHaveBeenCalled();
    expect(mocks.repository).not.toHaveBeenCalled();
    expect(mocks.exportRows).toEqual([]);
  });

  it.each([
    ["summary", "export.summary"],
    ["expenses", "export.expense_data"],
    ["tourists", "export.tourist_summary"],
    ["visits", "export.visit_records"],
    ["surveys", "export.survey_data"],
  ])("enforces the separate %s export permission", async (type, permission) => {
    mocks.permission.mockResolvedValueOnce({ actor: { adminUserId: 1 } }).mockRejectedValueOnce({ code: "FORBIDDEN" });
    const response = await GET(new Request(`http://localhost/api/admin/dashboard/export?type=${type}`));
    expect(response.status).toBe(403);
    expect(mocks.permission).toHaveBeenNthCalledWith(1, "dashboard.read", { unauthenticated: "throw" });
    expect(mocks.permission).toHaveBeenNthCalledWith(2, permission, { unauthenticated: "throw" });
    expect(mocks.analytics).not.toHaveBeenCalled();
    expect(mocks.repository).not.toHaveBeenCalled();
    expect(mocks.exportRows).toEqual([]);
    expect(mocks.audit).toHaveBeenCalledWith(expect.objectContaining({ result: "failed", metadata: expect.objectContaining({ reason: "permission_denied" }) }));
  });

  it("uses answered spending-range count for the estimated range row", async () => {
    mocks.analytics.mockResolvedValue({
      generatedAt: "2026-09-04T02:00:00.000Z",
      quality: {
        exportAllowed: true,
        blockers: [],
        scope: { code: "field_claim", label: "หลักฐานภาคสนาม" },
        sampleSize: 40,
        coverage: { answeredCount: 40, denominatorCount: 40, rate: 1, missingCount: 0, missingRate: 0 },
        suppressedCellCount: 0,
        metadata: { metricVersion: "dashboard-v3", exclusions: ["ไม่รวม Pilot"] },
      },
      expense: {
        spendingRanges: [{ label: "501-1,000 บาท", value: 3, percent: 1 }],
        expenseCategories: [{ label: "อาหาร", value: 40, percent: 1 }],
        estimatedMin: 1_503,
        estimatedMax: 3_000,
        hasOpenEndedRange: false,
        responseCount: 40,
        spendingRangeResponseCount: 3,
        expenseCategoryResponseCount: 40,
        methodologyNote: "ค่าประมาณจากช่วงค่าใช้จ่ายที่รายงานด้วยตนเอง",
      },
    });

    const response = await GET(new Request("http://localhost/api/admin/dashboard/export?type=expenses"));
    const estimateRow = mocks.exportRows.find((row) => row.Section === "Estimated Range");

    expect(response.status).toBe(200);
    expect(estimateRow?.Responses).toBe(3);
    expect(estimateRow?.Responses).not.toBe(40);
    expect(estimateRow?.["Report Title"]).toBe("สัญญาณค่าใช้จ่ายที่รายงานด้วยตนเอง");
    expect(estimateRow?.["Metric Version"]).toBe("dashboard-v3");
  });

  it("exports overview KPIs and daily trends as well as the existing attraction ranking", async () => {
    mocks.analytics.mockResolvedValue({
      generatedAt: "2026-09-04T02:00:00.000Z",
      quality: { exportAllowed: true, blockers: [], scope: { code: "field_claim", label: "Field" }, sampleSize: 30, coverage: null, suppressedCellCount: 0, metadata: { metricVersion: "dashboard-v3", exclusions: [] } },
      kpis: [
        { key: "visits", label: "Visits", value: "30", rawValue: 30, valueType: "count", definition: "Visit records, not QR scans", evidence: { sampleSize: 30, denominator: null, unit: "visits" } },
        { key: "average_satisfaction", label: "Average satisfaction", value: "No data", rawValue: null, valueType: "rating", definition: "Answered scores only", evidence: { sampleSize: 0, denominator: 30, unit: "responses" } },
      ],
      executive: {
        visitTrend: [{ label: "2026-08-01", value: 0 }, { label: "2026-08-02", value: 30 }],
        topAttractions: [{ rank: 1, attractionName: "Example", provinceName: "Yala", visitCount: 30, certificateCount: 20, surveyResponseCount: 0, averageSatisfaction: null }],
      },
    });
    const response = await GET(new Request("http://localhost/api/admin/dashboard/export?type=summary"));
    expect(response.status).toBe(200);
    expect(mocks.exportRows.find((row) => row.Metric === "visits")).toMatchObject({ Section: "KPI", Value: 30, "Sample Size": 30 });
    expect(mocks.exportRows.find((row) => row.Metric === "average_satisfaction")).toMatchObject({ Value: "", Denominator: 30 });
    expect(mocks.exportRows.find((row) => row.Date === "2026-08-01")).toMatchObject({ Section: "Visit Trend", Value: 0 });
    expect(mocks.exportRows.find((row) => row.Section === "Attraction Ranking")).toMatchObject({ Rank: 1, Attraction: "Example", Visits: 30, "Average Satisfaction": "" });
    const columns = Object.keys(mocks.exportRows[0]);
    expect(mocks.exportRows.every((row) => Object.keys(row).join() === columns.join())).toBe(true);
  });

  it("never stores unknown or personal query parameters in export audit metadata", async () => {
    mocks.analytics.mockResolvedValue({
      generatedAt: "2026-09-04T02:00:00.000Z",
      quality: {
        exportAllowed: true,
        blockers: [],
        scope: { code: "field_claim", label: "หลักฐานภาคสนาม" },
        sampleSize: 30,
        coverage: null,
        suppressedCellCount: 0,
        metadata: { metricVersion: "dashboard-v3", exclusions: [] },
      },
      expense: {
        spendingRanges: [], expenseCategories: [], estimatedMin: null, estimatedMax: null,
        hasOpenEndedRange: false, responseCount: 30, spendingRangeResponseCount: 30,
        expenseCategoryResponseCount: 30, methodologyNote: "",
      },
    });

    await GET(new Request("http://localhost/api/admin/dashboard/export?type=expenses&date_from=2026-08-01&email=person@example.com&tourist_id=secret&unknown=value"));

    const auditPayload = mocks.audit.mock.calls.at(-1)?.[0];
    expect(auditPayload.metadata.filters).toEqual({
      date_from: "2026-08-01",
      date_to: "2026-08-31",
      evidence_scope: "field_claim",
    });
    expect(JSON.stringify(auditPayload)).not.toContain("person@example.com");
    expect(JSON.stringify(auditPayload)).not.toContain("secret");
  });

  it("blocks an export when the server-side quality gate fails", async () => {
    mocks.analytics.mockResolvedValue({
      quality: {
        exportAllowed: false,
        blockers: ["ข้อมูลถูกตัดที่ขีดจำกัดการอ่าน"],
      },
      expense: {
        spendingRanges: [],
        expenseCategories: [],
        estimatedMin: null,
        estimatedMax: null,
        hasOpenEndedRange: false,
        responseCount: 10_000,
        spendingRangeResponseCount: 10_000,
        expenseCategoryResponseCount: 10_000,
        methodologyNote: "",
      },
    });

    const response = await GET(new Request("http://localhost/api/admin/dashboard/export?type=expenses"));

    expect(response.status).toBe(422);
    expect(await response.text()).toContain("ไม่สามารถส่งออก");
    expect(mocks.exportRows).toEqual([]);
  });

  it("rejects and audits an unsupported explicit export format", async () => {
    const response = await GET(new Request("http://localhost/api/admin/dashboard/export?type=expenses&format=pdf"));

    expect(response.status).toBe(400);
    expect(mocks.analytics).not.toHaveBeenCalled();
    expect(mocks.audit).toHaveBeenCalledWith(expect.objectContaining({
      result: "failed",
      metadata: { reason: "invalid_format" },
    }));
  });

  it("audits an export permission denial after dashboard authentication", async () => {
    mocks.permission
      .mockResolvedValueOnce({ actor: { adminUserId: 1 } })
      .mockRejectedValueOnce({ code: "FORBIDDEN" });

    const response = await GET(new Request("http://localhost/api/admin/dashboard/export?type=expenses"));

    expect(response.status).toBe(403);
    expect(mocks.audit).toHaveBeenCalledWith(expect.objectContaining({
      result: "failed",
      metadata: { exportType: "expenses", reason: "permission_denied" },
    }));
  });

  it("rejects a scope that cannot be represented safely instead of broadening it", async () => {
    vi.mocked(parseDashboardFilters).mockReturnValueOnce({ success: true, data: {
      dateFrom: "2026-08-01", dateTo: "2026-08-31", evidenceScope: "field_claim", ageGroup: "private_person",
    } });
    const response = await GET(new Request("http://localhost/api/admin/dashboard/export?type=expenses&age_group=private_person"));
    expect(response.status).toBe(400);
    expect(mocks.analytics).not.toHaveBeenCalled();
    expect(JSON.stringify(mocks.audit.mock.calls)).not.toContain("private_person");
  });
});
