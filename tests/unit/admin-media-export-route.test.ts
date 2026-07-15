import { NextRequest, NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requirePermission: vi.fn(),
  exportAdminMediaLibraryAssets: vi.fn(),
  createExportResponse: vi.fn(),
  logAuditAction: vi.fn(),
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

  return {
    AdminAuthError,
    requirePermission: mocks.requirePermission,
  };
});

vi.mock("@/lib/config/server-env", () => ({
  getServerEnv: () => ({ EXPORT_MAX_ROWS: 2 }),
}));

vi.mock("@/lib/repositories/admin-media-library.repository", () => ({
  exportAdminMediaLibraryAssets: mocks.exportAdminMediaLibraryAssets,
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
          order: () => ({
            limit: async () => ({ data: [], error: null }),
          }),
        }),
      }),
    }),
  }),
}));

async function loadRoute() {
  vi.resetModules();
  return import("@/app/api/admin/export/media/route");
}

function request(query = "") {
  return new NextRequest(`http://localhost:3000/api/admin/export/media${query}`);
}

function mediaAsset(overrides: Record<string, unknown> = {}) {
  return {
    id: "asset-1",
    file_name: "yala-hero.jpg",
    storage_path: "attractions/yala-hero.webp",
    thumbnail_storage_path: "attractions/yala-hero_thumb.webp",
    mime_type: "image/webp",
    size_bytes: 320000,
    category: "Attractions",
    lifecycle_status: "active",
    created_at: "2026-07-15T08:00:00.000Z",
    url: "/site-media/attractions/yala-hero.webp",
    thumbnail_url: "/site-media/attractions/yala-hero_thumb.webp",
    is_active: true,
    uploaded_by: "must-not-export",
    ...overrides,
  };
}

describe("/api/admin/export/media", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requirePermission.mockResolvedValue({
      actor: { adminId: "admin-1", permissions: ["export.media"] },
    });
    mocks.exportAdminMediaLibraryAssets.mockResolvedValue([mediaAsset()]);
    mocks.createExportResponse.mockResolvedValue(NextResponse.json({ ok: true }));
  });

  it.each([
    "?category=Tourist%20Photos",
    "?lifecycleStatus=deleted",
    "?mediaType=svg",
    "?format=pdf",
  ])("rejects invalid filters before querying rows: %s", async (query) => {
    const { GET } = await loadRoute();

    const response = await GET(request(query));

    expect(response.status).toBe(400);
    expect(mocks.exportAdminMediaLibraryAssets).not.toHaveBeenCalled();
    expect(mocks.logAuditAction).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "export.media.invalid_filters",
        result: "failed",
      }),
    );
  });

  it("passes the validated list filters to the bounded media_assets export query", async () => {
    const { GET } = await loadRoute();

    const response = await GET(
      request(
        "?search=yala&category=Attractions&lifecycleStatus=archived&mediaType=webp&page=3&pageSize=20&format=xlsx",
      ),
    );

    expect(response.status).toBe(200);
    expect(mocks.requirePermission).toHaveBeenCalledWith("export.media");
    expect(mocks.exportAdminMediaLibraryAssets).toHaveBeenCalledWith(
      {
        search: "yala",
        category: "Attractions",
        lifecycleStatus: "archived",
        mediaType: "webp",
      },
      3,
    );
    expect(mocks.createExportResponse).toHaveBeenCalledWith(
      expect.any(Array),
      expect.stringMatching(/^media_library_export_/),
      "xlsx",
    );
    expect(mocks.logAuditAction).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "export.media.xlsx",
        result: "success",
        metadata: expect.objectContaining({
          rowCount: 1,
          filters: {
            category: "Attractions",
            lifecycleStatus: "archived",
            mediaType: "webp",
            hasSearch: true,
          },
        }),
      }),
    );
    expect(JSON.stringify(mocks.logAuditAction.mock.calls)).not.toContain('"search":"yala"');
  });

  it("returns forbidden before querying when the actor lacks export.media", async () => {
    const { GET } = await loadRoute();
    const { AdminAuthError } = await import("@/lib/auth/guards");
    mocks.requirePermission.mockRejectedValueOnce(
      new AdminAuthError("FORBIDDEN", "You do not have permission to export media."),
    );

    const response = await GET(request());

    expect(response.status).toBe(403);
    expect(mocks.exportAdminMediaLibraryAssets).not.toHaveBeenCalled();
  });

  it("exports privacy-safe media library columns without raw storage paths or actor ids", async () => {
    const { GET } = await loadRoute();

    await GET(request("?format=csv"));

    const [rows] = mocks.createExportResponse.mock.calls[0] as [Array<Record<string, unknown>>];
    expect(rows).toHaveLength(1);
    expect(rows[0]).toEqual(
      expect.objectContaining({
        "Asset ID": "asset-1",
        "File Name": "yala-hero.jpg",
        Category: "Attractions",
        "Media Type": "WEBP",
        "Lifecycle Status": "active",
        "Has Thumbnail": "Yes",
      }),
    );
    expect(rows[0]).not.toHaveProperty("Storage Path");
    expect(rows[0]).not.toHaveProperty("Uploaded By");
  });

  it("rejects a filtered result larger than EXPORT_MAX_ROWS", async () => {
    mocks.exportAdminMediaLibraryAssets.mockResolvedValue([
      mediaAsset({ id: "asset-1" }),
      mediaAsset({ id: "asset-2" }),
      mediaAsset({ id: "asset-3" }),
    ]);
    const { GET } = await loadRoute();

    const response = await GET(request("?category=Homepage"));

    expect(response.status).toBe(413);
    expect(mocks.createExportResponse).not.toHaveBeenCalled();
    expect(mocks.logAuditAction).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "export.media.too_large",
        result: "failed",
        metadata: expect.objectContaining({ maxRows: 2 }),
      }),
    );
  });
});
