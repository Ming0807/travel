import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest, NextResponse } from "next/server";

const authMocks = vi.hoisted(() => ({ requirePermission: vi.fn() }));
const envMocks = vi.hoisted(() => ({ getServerEnv: vi.fn() }));
const repositoryMocks = vi.hoisted(() => ({ getAuditLogsPaginated: vi.fn() }));
const auditMocks = vi.hoisted(() => ({ logAuditAction: vi.fn() }));
const exportResponseMocks = vi.hoisted(() => ({
  parseExportFormat: vi.fn(),
  createExportResponse: vi.fn(),
}));

vi.mock("@/lib/auth/guards", () => {
  class AdminAuthError extends Error {
    constructor(public readonly code: "UNAUTHORIZED" | "FORBIDDEN" | "ADMIN_INACTIVE", message: string) {
      super(message);
      this.name = "AdminAuthError";
    }
  }

  return {
    AdminAuthError,
    requirePermission: authMocks.requirePermission,
  };
});

vi.mock("@/lib/config/server-env", () => ({ getServerEnv: envMocks.getServerEnv }));
vi.mock("@/lib/repositories/admin-audit.repository", () => ({
  getAuditLogsPaginated: repositoryMocks.getAuditLogsPaginated,
}));
vi.mock("@/lib/services/audit-log.service", () => ({ logAuditAction: auditMocks.logAuditAction }));
vi.mock("@/lib/utils/export-response", () => ({
  parseExportFormat: exportResponseMocks.parseExportFormat,
  createExportResponse: exportResponseMocks.createExportResponse,
}));

import { GET } from "@/app/api/admin/audit/export/route";

const actor = {
  adminId: "actor-admin-id",
  authUserId: "actor-auth-id",
  email: "actor@example.test",
  displayName: "Security Admin",
  roleNames: ["super_admin"],
  permissions: ["audit.export"],
};

const auditRow = {
  log_id: "log-1",
  created_at: "2026-07-15T05:06:07.000Z",
  admin_users: { display_name: "Security Admin", email: "admin@example.test" },
  action: "data.export",
  entity_type: "audit_export",
  entity_id: "export-1",
  old_data: null,
  new_data: {
    service_role_key: "SUPABASE_SERVICE_ROLE_KEY",
    provider_user_id: "line-secret",
  },
};

function request(query = ""): NextRequest {
  return new NextRequest(`http://localhost/api/admin/audit/export${query}`);
}

describe("/api/admin/audit/export", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMocks.requirePermission.mockResolvedValue({ actor, adminId: actor.adminId });
    envMocks.getServerEnv.mockReturnValue({ EXPORT_MAX_ROWS: 2 });
    repositoryMocks.getAuditLogsPaginated.mockResolvedValue({ data: [auditRow], total: 1, page: 1, limit: 3, totalPages: 1 });
    exportResponseMocks.parseExportFormat.mockReturnValue("csv");
    exportResponseMocks.createExportResponse.mockImplementation(async (rows: unknown) => NextResponse.json(rows));
  });

  it("requires only the dedicated audit export permission", async () => {
    const response = await GET(request("?format=csv"));

    expect(response.status).toBe(200);
    expect(authMocks.requirePermission.mock.calls.map(([permission]) => permission)).toEqual(["audit.export"]);
  });

  it("uses the shared validated filters, ignores pagination, and honors the row sentinel", async () => {
    await GET(request("?page=9&pageSize=100&adminId=system&action=export&entityType=media&search=50%25_token&sort=oldest&format=xlsx"));

    expect(repositoryMocks.getAuditLogsPaginated).toHaveBeenCalledWith(1, 3, {
      adminId: "system",
      action: "export",
      entityType: "media",
      search: "50%_token",
      sort: "oldest",
    });
    expect(auditMocks.logAuditAction).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "export.audit.csv",
        entityType: "audit_export",
        result: "success",
        metadata: expect.objectContaining({
          rowCount: 1,
          maxRows: 2,
          format: "csv",
          privacyLevel: "internal",
          filters: {
            adminId: "system",
            action: "export",
            entityType: "media",
            search: "50%_token",
            sort: "oldest",
          },
        }),
      })
    );
    expect(JSON.stringify(auditMocks.logAuditAction.mock.calls)).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
    expect(JSON.stringify(auditMocks.logAuditAction.mock.calls)).not.toContain("line-secret");
    expect(JSON.stringify(auditMocks.logAuditAction.mock.calls)).not.toContain("admin@example.test");
  });

  it("rejects invalid filters before querying audit rows", async () => {
    const response = await GET(request("?action=drop-table"));

    expect(response.status).toBe(400);
    expect(repositoryMocks.getAuditLogsPaginated).not.toHaveBeenCalled();
    expect(auditMocks.logAuditAction).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "export.audit.invalid_filters",
        entityType: "audit_export",
        result: "failed",
        metadata: { reason: "invalid_filters", privacyLevel: "internal" },
      })
    );
  });

  it("rejects and audits exports above EXPORT_MAX_ROWS", async () => {
    repositoryMocks.getAuditLogsPaginated.mockResolvedValue({
      data: [auditRow, auditRow, auditRow],
      total: 3,
      page: 1,
      limit: 3,
      totalPages: 1,
    });

    const response = await GET(request("?entityType=media"));

    expect(response.status).toBe(413);
    expect(exportResponseMocks.createExportResponse).not.toHaveBeenCalled();
    expect(auditMocks.logAuditAction).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "export.audit.too_large",
        entityType: "audit_export",
        result: "failed",
        metadata: expect.objectContaining({
          maxRows: 2,
          privacyLevel: "internal",
          filters: { entityType: "media", sort: "newest" },
        }),
      })
    );
  });

  it("exports only safe audit row fields", async () => {
    const response = await GET(request("?format=csv"));
    const rows = (await response.json()) as Array<Record<string, unknown>>;
    const serialized = JSON.stringify(rows);

    expect(rows[0]).toMatchObject({
      Actor: "Security Admin",
      Action: "data.export",
      "Entity Type": "audit_export",
      "New Data Fields": "provider_user_id, service_role_key",
    });
    expect(serialized).not.toContain("line-secret");
    expect(serialized).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
    expect(serialized).not.toContain("admin@example.test");
  });
});
