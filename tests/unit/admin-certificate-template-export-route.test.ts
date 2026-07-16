import { NextRequest, NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requirePermission: vi.fn(),
  exportTemplates: vi.fn(),
  createExportResponse: vi.fn(),
  logAuditAction: vi.fn(),
}));

vi.mock("@/lib/auth/guards", () => {
  class AdminAuthError extends Error {
    constructor(public readonly code: "UNAUTHORIZED" | "FORBIDDEN", message: string) {
      super(message);
    }
  }
  return { AdminAuthError, requirePermission: mocks.requirePermission };
});
vi.mock("@/lib/config/server-env", () => ({ getServerEnv: () => ({ EXPORT_MAX_ROWS: 2 }) }));
vi.mock("@/lib/repositories/admin-certificate-template.repository", () => ({
  exportAdminCertificateTemplates: mocks.exportTemplates,
}));
vi.mock("@/lib/services/audit-log.service", () => ({ logAuditAction: mocks.logAuditAction }));
vi.mock("@/lib/utils/export-response", () => ({
  parseExportFormat: (value: string | null) => (value === "xlsx" ? "xlsx" : "csv"),
  createExportResponse: mocks.createExportResponse,
}));

async function loadRoute() {
  vi.resetModules();
  return import("@/app/api/admin/export/certificate-templates/route");
}

describe("/api/admin/export/certificate-templates", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requirePermission.mockResolvedValue({ actor: { adminId: "admin-1" } });
    mocks.exportTemplates.mockResolvedValue([
      {
        template_id: 4,
        template_name: "Yala Memory",
        attraction_id: 11,
        attraction_name: "สกายวอล์คอัยเยอร์เวง",
        background_path: "private/path.webp",
        language: "th",
        is_default: false,
        is_active: true,
        created_at: "2026-07-01T00:00:00.000Z",
        updated_at: null,
      },
    ]);
    mocks.createExportResponse.mockResolvedValue(NextResponse.json({ ok: true }));
  });

  it("enforces template and export permissions with list-export parity", async () => {
    const { GET } = await loadRoute();
    const response = await GET(
      new NextRequest(
        "http://localhost/api/admin/export/certificate-templates?search=Yala&status=active&language=th&scope=attraction&sort=oldest&page=2&format=csv"
      )
    );

    expect(response.status).toBe(200);
    expect(mocks.requirePermission.mock.calls.map(([permission]) => permission)).toEqual([
      "certificate.template_manage",
      "export.certificate_templates",
    ]);
    expect(mocks.exportTemplates).toHaveBeenCalledWith(
      {
        search: "Yala",
        status: "active",
        language: "th",
        scope: "attraction",
        sort: "oldest",
      },
      3
    );
    const serializedRows = JSON.stringify(mocks.createExportResponse.mock.calls[0]?.[0]);
    expect(serializedRows).toContain("สกายวอล์คอัยเยอร์เวง");
    expect(serializedRows).not.toContain("private/path.webp");
  });

  it("rejects invalid filters before querying", async () => {
    const { GET } = await loadRoute();
    const response = await GET(
      new NextRequest("http://localhost/api/admin/export/certificate-templates?scope=campaign")
    );

    expect(response.status).toBe(400);
    expect(mocks.exportTemplates).not.toHaveBeenCalled();
  });
});
