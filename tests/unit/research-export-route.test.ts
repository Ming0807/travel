import { NextRequest, NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requirePermission: vi.fn(),
  loadDeidentifiedResearchExport: vi.fn(),
  logAuditAction: vi.fn(),
  createExportResponse: vi.fn(),
}));

vi.mock("@/lib/auth/guards", () => {
  class AdminAuthError extends Error {
    constructor(
      public readonly code: "UNAUTHORIZED" | "FORBIDDEN" | "ADMIN_INACTIVE",
      message: string,
    ) {
      super(message);
      this.name = "AdminAuthError";
    }
  }

  return { AdminAuthError, requirePermission: mocks.requirePermission };
});

vi.mock("@/lib/config/server-env", () => ({
  getServerEnv: () => ({ EXPORT_MAX_ROWS: 100 }),
}));

vi.mock("@/lib/services/audit-log.service", () => ({
  logAuditAction: mocks.logAuditAction,
}));

vi.mock("@/lib/services/research-export.service", () => {
  class ResearchExportError extends Error {
    constructor(
      public readonly code: "STUDY_NOT_FOUND" | "SMALL_SAMPLE" | "TRUNCATED" | "UNSUPPORTED_DATASET",
      message: string,
    ) {
      super(message);
      this.name = "ResearchExportError";
    }
  }

  return {
    ResearchExportError,
    loadDeidentifiedResearchExport: mocks.loadDeidentifiedResearchExport,
  };
});

vi.mock("@/lib/utils/export-response", () => ({
  parseExportFormat: (raw: string | null) => (raw === "xlsx" ? "xlsx" : "csv"),
  createExportResponse: mocks.createExportResponse,
}));

async function loadRoute() {
  vi.resetModules();
  return import("@/app/api/admin/export/research/route");
}

function request(query = "") {
  return new NextRequest(`http://localhost/api/admin/export/research${query}`);
}

const actor = {
  adminId: "admin-1",
  authUserId: "auth-1",
  email: "researcher@example.test",
  displayName: "Researcher",
  roleNames: ["researcher"],
  permissions: ["research.export"],
};

describe("/api/admin/export/research", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requirePermission.mockResolvedValue({ actor });
    mocks.loadDeidentifiedResearchExport.mockResolvedValue([{ participant_code: "P-001" }]);
    mocks.createExportResponse.mockResolvedValue(NextResponse.json({ ok: true }));
  });

  it("exports only after research.export permission and audits success", async () => {
    const { GET } = await loadRoute();

    const response = await GET(request("?studyId=11111111-1111-4111-8111-111111111111&dataset=participants&format=xlsx"));

    expect(response.status).toBe(200);
    expect(mocks.requirePermission).toHaveBeenCalledWith("research.export");
    expect(mocks.logAuditAction).toHaveBeenCalledWith(
      expect.objectContaining({
        actor,
        action: "export.research.participants.xlsx",
        result: "success",
        metadata: expect.objectContaining({ deidentified: true, minCellThreshold: 10 }),
      }),
    );
  });

  it("rejects invalid filters before reading research rows and audits the failure", async () => {
    const { GET } = await loadRoute();

    const response = await GET(request("?studyId=not-a-uuid&dataset=participants"));

    expect(response.status).toBe(400);
    expect(mocks.loadDeidentifiedResearchExport).not.toHaveBeenCalled();
    expect(mocks.logAuditAction).toHaveBeenCalledWith(
      expect.objectContaining({ action: "export.research.invalid_filters", result: "failed" }),
    );
  });

  it("audits privacy-threshold rejection without exposing row data", async () => {
    const { GET } = await loadRoute();
    const { ResearchExportError } = await import("@/lib/services/research-export.service");
    mocks.loadDeidentifiedResearchExport.mockRejectedValueOnce(
      new ResearchExportError("SMALL_SAMPLE", "กลุ่มตัวอย่างมีขนาดเล็กเกินไป"),
    );

    const response = await GET(request("?studyId=11111111-1111-4111-8111-111111111111&dataset=answers"));

    expect(response.status).toBe(422);
    expect(mocks.createExportResponse).not.toHaveBeenCalled();
    expect(mocks.logAuditAction).toHaveBeenCalledWith(
      expect.objectContaining({
        actor,
        action: "export.research.small_sample",
        result: "failed",
        metadata: {
          code: "SMALL_SAMPLE",
          dataset: "answers",
          deidentified: true,
          minCellThreshold: 10,
        },
      }),
    );
    expect(JSON.stringify(mocks.logAuditAction.mock.calls)).not.toContain("participant_code");
  });

  it("audits denied attempts without request filters or an actor record", async () => {
    const { GET } = await loadRoute();
    const { AdminAuthError } = await import("@/lib/auth/guards");
    mocks.requirePermission.mockRejectedValueOnce(new AdminAuthError("FORBIDDEN", "ไม่มีสิทธิ์ส่งออกข้อมูล"));

    const response = await GET(request("?studyId=11111111-1111-4111-8111-111111111111&dataset=participants"));

    expect(response.status).toBe(403);
    expect(mocks.loadDeidentifiedResearchExport).not.toHaveBeenCalled();
    expect(mocks.logAuditAction).toHaveBeenCalledWith({
      action: "export.research.denied",
      entityType: "research_export",
      result: "denied",
      metadata: { code: "FORBIDDEN" },
    });
  });
});
