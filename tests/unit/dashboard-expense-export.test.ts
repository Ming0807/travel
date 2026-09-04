import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  analytics: vi.fn(),
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
  getDashboardRepositoryPayload: vi.fn(),
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
  beforeEach(() => {
    mocks.exportRows = [];
    mocks.analytics.mockReset();
    mocks.audit.mockReset();
    mocks.audit.mockResolvedValue(undefined);
    mocks.permission.mockReset();
    mocks.permission.mockResolvedValue({ actor: { adminUserId: 1 } });
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
