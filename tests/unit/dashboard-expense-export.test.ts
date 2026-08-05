import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  analytics: vi.fn(),
  exportRows: [] as Array<Record<string, unknown>>,
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
  AdminAuthError: class AdminAuthError extends Error {},
  requirePermission: vi.fn(async () => ({ actor: { adminUserId: 1 } })),
}));

vi.mock("@/lib/repositories/dashboard.repository", () => ({
  getDashboardRepositoryPayload: vi.fn(),
}));

vi.mock("@/lib/validation/dashboard-filters", () => ({
  parseDashboardFilters: vi.fn(() => ({ success: true, data: {} })),
}));

vi.mock("@/lib/utils/export-response", () => ({
  parseExportFormat: vi.fn(() => "csv"),
  createExportResponse: vi.fn(async (rows: Array<Record<string, unknown>>) => {
    mocks.exportRows = rows;
    return new Response("ok", { status: 200 });
  }),
}));

vi.mock("@/lib/services/audit-log.service", () => ({
  logAuditAction: vi.fn(async () => undefined),
}));

import { GET } from "@/app/api/admin/dashboard/export/route";

describe("dashboard expense export", () => {
  beforeEach(() => {
    mocks.exportRows = [];
    mocks.analytics.mockReset();
  });

  it("uses answered spending-range count for the estimated range row", async () => {
    mocks.analytics.mockResolvedValue({
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
  });
});
