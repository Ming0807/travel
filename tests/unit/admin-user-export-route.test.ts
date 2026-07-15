import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const authMocks = vi.hoisted(() => ({ requirePermission: vi.fn() }));
const envMocks = vi.hoisted(() => ({ getServerEnv: vi.fn() }));
const repositoryMocks = vi.hoisted(() => ({ exportAdminUsers: vi.fn() }));
const auditMocks = vi.hoisted(() => ({ logAuditAction: vi.fn() }));
const exportResponseMocks = vi.hoisted(() => ({
  parseExportFormat: vi.fn(),
  createExportResponse: vi.fn(),
}));

vi.mock("@/lib/auth/guards", () => {
  class AdminAuthError extends Error {
    constructor(public readonly code: "UNAUTHORIZED" | "FORBIDDEN", message: string) {
      super(message);
    }
  }
  return { requirePermission: authMocks.requirePermission, AdminAuthError };
});

vi.mock("@/lib/config/server-env", () => ({ getServerEnv: envMocks.getServerEnv }));
vi.mock("@/lib/repositories/admin-user.repository", () => ({
  exportAdminUsers: repositoryMocks.exportAdminUsers,
}));
vi.mock("@/lib/services/audit-log.service", () => ({ logAuditAction: auditMocks.logAuditAction }));
vi.mock("@/lib/utils/export-response", () => ({
  parseExportFormat: exportResponseMocks.parseExportFormat,
  createExportResponse: exportResponseMocks.createExportResponse,
}));

import { GET } from "@/app/api/admin/export/users/route";

const actor = {
  adminId: "actor-admin-id",
  authUserId: "actor-auth-id",
  email: "actor@example.com",
  displayName: "ผู้ดูแล",
  roleNames: ["super_admin"],
  permissions: [],
};

const exportRow = {
  admin_id: "11111111-1111-4111-8111-111111111111",
  email: "admin@example.com",
  display_name: "ผู้ดูแลทดสอบ",
  is_active: true,
  last_login_at: null,
  created_at: "2026-07-01T00:00:00.000Z",
  roles: ["super_admin"],
};

function request(query: string): NextRequest {
  return new NextRequest(`http://localhost/api/admin/export/users?${query}`);
}

describe("admin user export route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMocks.requirePermission.mockResolvedValue({ actor, adminId: actor.adminId });
    envMocks.getServerEnv.mockReturnValue({ EXPORT_MAX_ROWS: 50 });
    repositoryMocks.exportAdminUsers.mockResolvedValue([exportRow]);
    exportResponseMocks.parseExportFormat.mockReturnValue("csv");
    exportResponseMocks.createExportResponse.mockImplementation(async (rows: unknown) =>
      Response.json(rows)
    );
  });

  it("enforces read, manage, resource export, and personal-data permissions", async () => {
    const response = await GET(request("status=active&roleId=3&sort=name_asc&format=csv"));

    expect(response.status).toBe(200);
    expect(authMocks.requirePermission.mock.calls.map(([permission]) => permission)).toEqual([
      "user.read",
      "user.manage",
      "export.users",
      "export.personal_data",
    ]);
  });

  it("uses validated list filters, ignores pagination, and honors the row sentinel", async () => {
    await GET(
      request("page=9&pageSize=100&search=admin%40example.com&status=inactive&roleId=3&sort=oldest&format=xlsx")
    );

    expect(repositoryMocks.exportAdminUsers).toHaveBeenCalledWith(
      {
        search: "admin@example.com",
        status: "inactive",
        roleId: 3,
        sort: "oldest",
      },
      51
    );
    expect(auditMocks.logAuditAction).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "export.admin_users.csv",
        result: "success",
        metadata: expect.objectContaining({
          rowCount: 1,
          maxRows: 50,
          privacyLevel: "restricted",
          filters: {
            hasSearch: true,
            status: "inactive",
            roleId: 3,
            sort: "oldest",
          },
        }),
      })
    );
    expect(JSON.stringify(auditMocks.logAuditAction.mock.calls)).not.toContain("admin@example.com");
    expect(JSON.stringify(auditMocks.logAuditAction.mock.calls)).not.toContain(exportRow.admin_id);
  });

  it("rejects and audits invalid filters before querying data", async () => {
    const response = await GET(request("status=deleted"));

    expect(response.status).toBe(400);
    expect(repositoryMocks.exportAdminUsers).not.toHaveBeenCalled();
    expect(auditMocks.logAuditAction).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "export.admin_users.invalid_filters",
        result: "failed",
        metadata: { reason: "invalid_filters", privacyLevel: "restricted" },
      })
    );
  });

  it("rejects and audits exports above EXPORT_MAX_ROWS", async () => {
    repositoryMocks.exportAdminUsers.mockResolvedValue(Array.from({ length: 51 }, () => exportRow));

    const response = await GET(request("status=active"));

    expect(response.status).toBe(413);
    expect(auditMocks.logAuditAction).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "export.admin_users.too_large",
        result: "failed",
        metadata: expect.objectContaining({ maxRows: 50, privacyLevel: "restricted" }),
      })
    );
    expect(exportResponseMocks.createExportResponse).not.toHaveBeenCalled();
  });

  it("exports email but never includes auth or admin IDs in file rows", async () => {
    const response = await GET(request("format=csv"));
    const rows = (await response.json()) as Array<Record<string, unknown>>;
    const serialized = JSON.stringify(rows);

    expect(serialized).toContain("admin@example.com");
    expect(serialized).not.toContain(exportRow.admin_id);
    expect(serialized).not.toContain("auth_user_id");
    expect(serialized).not.toContain("actor-auth-id");
  });
});
