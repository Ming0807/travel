import { NextRequest, NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requirePermission: vi.fn(),
  exportContactMessages: vi.fn(),
  createExportResponse: vi.fn(),
  logAuditAction: vi.fn(),
}));

vi.mock("@/lib/auth/guards", () => {
  class AdminAuthError extends Error {
    constructor(
      public readonly code: "UNAUTHORIZED" | "FORBIDDEN" | "ADMIN_INACTIVE",
      message: string
    ) {
      super(message);
      this.name = "AdminAuthError";
    }
  }

  return {
    AdminAuthError,
    requirePermission: mocks.requirePermission,
  };
});

vi.mock("@/lib/config/server-env", () => ({
  getServerEnv: () => ({ EXPORT_MAX_ROWS: 2 }),
}));

vi.mock("@/lib/repositories/admin-message.repository", () => ({
  exportContactMessages: mocks.exportContactMessages,
}));

vi.mock("@/lib/services/audit-log.service", () => ({
  logAuditAction: mocks.logAuditAction,
}));

vi.mock("@/lib/utils/export-response", () => ({
  parseExportFormat: (raw: string | null) => (raw === "xlsx" ? "xlsx" : "csv"),
  createExportResponse: mocks.createExportResponse,
}));

vi.mock("@/lib/supabase/service-role", () => ({
  createSupabaseServiceRoleClient: () => ({
    from: () => ({
      select: () => ({
        order: () => ({
          limit: async () => ({ data: [], error: null }),
        }),
      }),
    }),
  }),
}));

async function loadRoute() {
  vi.resetModules();
  return import("@/app/api/admin/export/messages/route");
}

function request(query = "") {
  return new NextRequest(`http://localhost:3000/api/admin/export/messages${query}`);
}

describe("/api/admin/export/messages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requirePermission.mockResolvedValue({
      actor: {
        adminId: "admin-1",
        permissions: ["export.messages", "export.personal_data"],
      },
    });
    mocks.exportContactMessages.mockResolvedValue([
      {
        id: "message-1",
        name: "Yala Visitor",
        email: "visitor@example.test",
        phone: null,
        subject: "Question",
        message: "Hello",
        status: "read",
        is_replied: false,
        read_at: null,
        created_at: "2026-07-01T09:00:00.000Z",
      },
    ]);
    mocks.createExportResponse.mockResolvedValue(NextResponse.json({ ok: true }));
  });

  it("rejects invalid message filters before querying export rows", async () => {
    const { GET } = await loadRoute();

    const response = await GET(request("?status=deleted"));

    expect(response.status).toBe(400);
    expect(mocks.exportContactMessages).not.toHaveBeenCalled();
    expect(mocks.logAuditAction).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "export.contact_messages.invalid_filters",
        result: "failed",
      })
    );
  });

  it("uses the same validated filters as the admin list and ignores pagination for export", async () => {
    const { GET } = await loadRoute();

    const response = await GET(request("?search=Yala&status=read&sort=oldest&page=3&pageSize=20"));

    expect(response.status).toBe(200);
    expect(mocks.requirePermission).toHaveBeenCalledWith("export.messages");
    expect(mocks.requirePermission).toHaveBeenCalledWith("export.personal_data");
    expect(mocks.exportContactMessages).toHaveBeenCalledWith(
      {
        search: "Yala",
        status: "read",
        sort: "oldest",
      },
      3
    );
    expect(mocks.createExportResponse).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          Name: "Yala Visitor",
          Email: "visitor@example.test",
          Status: "read",
        }),
      ]),
      expect.stringMatching(/^messages_export_/),
      "csv"
    );
    expect(mocks.logAuditAction).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "export.contact_messages.csv",
        metadata: expect.objectContaining({
          filters: { hasSearch: true, status: "read", sort: "oldest" },
          privacyLevel: "restricted",
        }),
      })
    );
    expect(JSON.stringify(mocks.logAuditAction.mock.calls)).not.toContain("Yala");
  });
});
