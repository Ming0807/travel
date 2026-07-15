import { describe, expect, it } from "vitest";
import {
  adminAuditQuerySchema,
  auditExportFilters,
  buildAuditSearchFilter,
  sanitizeAuditLogDetails,
  toAuditExportRows,
} from "@/lib/validation/admin-audit";

describe("adminAuditQuerySchema", () => {
  it("defaults to newest audit rows with bounded pagination", () => {
    expect(adminAuditQuerySchema.parse({})).toEqual({
      page: 1,
      pageSize: 20,
      sort: "newest",
    });
  });

  it("normalizes the same filter contract for list and export", () => {
    const parsed = adminAuditQuerySchema.parse({
      page: "3",
      pageSize: "50",
      adminId: "system",
      action: "export",
      entityType: "media",
      startDate: "2026-07-01",
      endDate: "2026-07-15",
      search: "  50%_token  ",
      sort: "oldest",
    });

    expect(parsed).toEqual({
      page: 3,
      pageSize: 50,
      adminId: "system",
      action: "export",
      entityType: "media",
      startDate: "2026-07-01",
      endDate: "2026-07-15",
      search: "50%_token",
      sort: "oldest",
    });

    expect(auditExportFilters(parsed)).toEqual({
      adminId: "system",
      action: "export",
      entityType: "media",
      startDate: "2026-07-01",
      endDate: "2026-07-15",
      search: "50%_token",
      sort: "oldest",
    });
  });

  it("rejects invalid dates, reversed ranges, unknown values, and unknown keys", () => {
    expect(() => adminAuditQuerySchema.parse({ startDate: "07/01/2026" })).toThrow();
    expect(() => adminAuditQuerySchema.parse({ startDate: "2026-07-16", endDate: "2026-07-15" })).toThrow();
    expect(() => adminAuditQuerySchema.parse({ action: "drop table" })).toThrow();
    expect(() => adminAuditQuerySchema.parse({ entityType: "tourists" })).toThrow();
    expect(() => adminAuditQuerySchema.parse({ includeRawData: "true" })).toThrow();
  });
});

describe("buildAuditSearchFilter", () => {
  it("escapes wildcard and separator characters before building the PostgREST OR filter", () => {
    const filter = buildAuditSearchFilter("50%_promo,token\\x");

    expect(filter).toBe("action.ilike.%50\\%\\_promo token\\\\x%,entity_type.ilike.%50\\%\\_promo token\\\\x%");
  });
});

describe("audit export row safety", () => {
  it("exports only the existing audit columns and never raw old_data/new_data values", () => {
    const rows = toAuditExportRows([
      {
        created_at: "2026-07-15T05:06:07.000Z",
        admin_users: { display_name: "Security Admin", email: "admin@example.test" },
        action: "data.export",
        entity_type: "audit_export",
        entity_id: "export-1",
        old_data: { password: "secret", status: "draft" },
        new_data: { provider_user_id: "line-secret", status: "published" },
      },
    ]);

    expect(rows).toEqual([
      {
        Timestamp: "2026-07-15 05:06:07",
        Actor: "Security Admin",
        Action: "data.export",
        "Entity Type": "audit_export",
        "Entity ID": "export-1",
        "Old Data Fields": "password, status",
        "New Data Fields": "provider_user_id, status",
      },
    ]);
    expect(JSON.stringify(rows)).not.toContain("line-secret");
    expect(JSON.stringify(rows)).not.toContain("admin@example.test");
  });

  it("sanitizes legacy audit details before writing arbitrary metadata", () => {
    const sanitized = sanitizeAuditLogDetails({
      fileName: "safe.csv",
      signedUrl: "https://storage.example.test/private.csv?token=secret",
      nested: {
        guest_token: "guest-secret",
        comment: "x".repeat(600),
      },
    });

    expect(sanitized).toMatchObject({
      fileName: "safe.csv",
      signedUrl: "[REDACTED]",
      nested: {
        guest_token: "[REDACTED]",
      },
    });
    expect(String((sanitized.nested as Record<string, unknown>).comment).length).toBeLessThan(520);
  });
});
