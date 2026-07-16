import { NextRequest, NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requirePermission: vi.fn(),
  exportAdminRoles: vi.fn(),
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
vi.mock("@/lib/repositories/role.repository", () => ({ exportAdminRoles: mocks.exportAdminRoles }));
vi.mock("@/lib/services/audit-log.service", () => ({ logAuditAction: mocks.logAuditAction }));
vi.mock("@/lib/utils/export-response", () => ({
  parseExportFormat: (value: string | null) => (value === "xlsx" ? "xlsx" : "csv"),
  createExportResponse: mocks.createExportResponse,
}));

async function loadRoute() {
  vi.resetModules();
  return import("@/app/api/admin/export/roles/route");
}

describe("/api/admin/export/roles", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requirePermission.mockResolvedValue({ actor: { adminId: "admin-1" } });
    mocks.exportAdminRoles.mockResolvedValue([
      {
        role_id: 8,
        role_name: "content_editor",
        description: "ดูแลเนื้อหา",
        permissions: ["story.read"],
        is_active: true,
        created_at: "2026-07-01T00:00:00.000Z",
      },
    ]);
    mocks.createExportResponse.mockResolvedValue(NextResponse.json({ ok: true }));
  });

  it("enforces read and export permissions and uses validated list filters", async () => {
    const { GET } = await loadRoute();
    const response = await GET(
      new NextRequest(
        "http://localhost/api/admin/export/roles?search=editor&status=active&sort=name_asc&page=3&format=xlsx"
      )
    );

    expect(response.status).toBe(200);
    expect(mocks.requirePermission.mock.calls.map(([permission]) => permission)).toEqual([
      "role.read",
      "export.roles",
    ]);
    expect(mocks.exportAdminRoles).toHaveBeenCalledWith(
      { search: "editor", status: "active", sort: "name_asc" },
      3
    );
    expect(mocks.createExportResponse).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ "ชื่อบทบาท": "content_editor" })]),
      expect.stringMatching(/^roles_export_/),
      "xlsx"
    );
  });

  it("rejects unknown filters before querying", async () => {
    const { GET } = await loadRoute();
    const response = await GET(
      new NextRequest("http://localhost/api/admin/export/roles?permission=all")
    );

    expect(response.status).toBe(400);
    expect(mocks.exportAdminRoles).not.toHaveBeenCalled();
  });
});
