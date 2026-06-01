import { describe, expect, it, vi, beforeAll, beforeEach } from "vitest";
import type { Mock } from "vitest";
import { NextRequest } from "next/server";
import fs from "fs";
import path from "path";

// ============================================================================
// Migration Validation Suite
// ============================================================================

const MIGRATION_PATH = path.resolve(
  __dirname,
  "../../supabase/migrations/20260529000000_add_media_assets_lifecycle.sql"
);

function readMigrationSql(): string {
  return fs.readFileSync(MIGRATION_PATH, "utf-8");
}

describe("Media assets lifecycle migration (20260529000000)", () => {
  let sql: string;

  beforeAll(() => {
    sql = readMigrationSql();
  });

  it("exists and is not empty", () => {
    expect(fs.existsSync(MIGRATION_PATH)).toBe(true);
    expect(sql.length).toBeGreaterThan(100);
  });

  it("adds lifecycle_status column with NOT NULL and DEFAULT 'active'", () => {
    expect(sql).toContain("ADD COLUMN IF NOT EXISTS lifecycle_status varchar(30) NOT NULL DEFAULT 'active'");
  });

  it("adds archived_at column as timestamptz", () => {
    expect(sql).toContain("ADD COLUMN IF NOT EXISTS archived_at timestamptz");
  });

  it("adds archived_by column as uuid with FK to auth.users(id) ON DELETE SET NULL", () => {
    expect(sql).toContain("ADD COLUMN IF NOT EXISTS archived_by uuid REFERENCES auth.users(id) ON DELETE SET NULL");
  });

  it("adds check constraint constraining lifecycle_status to active or archived", () => {
    expect(sql).toContain("CONSTRAINT media_assets_lifecycle_status_check");
    expect(sql).toContain("lifecycle_status IN ('active', 'archived')");
  });

  it("creates an index on lifecycle_status", () => {
    expect(sql).toContain("CREATE INDEX IF NOT EXISTS idx_media_assets_lifecycle_status");
    expect(sql).toContain("ON public.media_assets(lifecycle_status)");
  });

  it("restricts public SELECT to active assets only", () => {
    expect(sql).toContain("Allow public read access to media_assets");
    expect(sql).toContain("USING (lifecycle_status = 'active')");
  });

  it("updates admin RLS policy with lifecycle_status awareness", () => {
    expect(sql).toContain("Allow admins to manage media_assets");
    expect(sql).toContain("lifecycle_status IS NOT NULL");
    expect(sql).toContain("admin_users");
    expect(sql).toContain("admin_user_roles");
  });
});

// ============================================================================
// Route Handler Integration Suite
// ============================================================================
// Tests the real DELETE/PATCH route handlers through the actual import chain.
// Mocking is at the Supabase client layer (createClient), not at the
// service-role function level, so createSupabaseServiceRoleClient is real.

// ── Mocks ──────────────────────────────────────────────────────────────────
// Use vi.hoisted() to create shared mock state BEFORE vi.mock factories run.
// This avoids Temporal Dead Zone (TDZ) issues caused by vi.mock hoisting.
//
// Design note on findMediaReferences mocking:
// The content_media query uses .select().eq("storage_path", path) WITHOUT
// .single()/.maybeSingle(). So the result of that chain is awaited directly.
// To make the mock chain return real content_media data, we make eqMock
// conditionally return a thenable when called with column="storage_path"
// (only while contentMediaData is configured). All other .eq() calls —
// for asset fetch, entity lookups, and update chaining — continue to return
// the builder as before, so existing tests are unaffected.

const { mockQueryBuilder, mockRequirePermission, setContentMediaData } = vi.hoisted(() => {
  // Mutable state for the content_media query path
  let _contentMediaData: { data: Record<string, unknown>[] | null; error: unknown } | null = null;

  // eqMock: return a thenable for storage_path lookups when data is configured
  const eqMock: Mock = vi.fn((column: string) => {
    if (column === "storage_path" && _contentMediaData) {
      return Promise.resolve(_contentMediaData);
    }
    return builder;
  });

  const selectMock: Mock = vi.fn(() => builder);
  const orderMock: Mock = vi.fn(() => builder);
  const updateMock: Mock = vi.fn(() => ({ eq: eqMock }));
  const insertMock: Mock = vi.fn(() => ({
    select: vi.fn(() => ({ single: vi.fn().mockResolvedValue({ data: null, error: null }) })),
  }));

  const builder = {
    select: selectMock,
    eq: eqMock,
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    order: orderMock,
    update: updateMock,
    insert: insertMock,
  };

  const requirePermissionMock = vi.fn<(...args: unknown[]) => Promise<Record<string, unknown>>>();

  return {
    mockQueryBuilder: builder as typeof builder & {
      select: Mock; eq: Mock; single: Mock; maybeSingle: Mock;
      order: Mock; update: Mock; insert: Mock;
    },
    mockRequirePermission: requirePermissionMock,
    setContentMediaData: (data: { data: Record<string, unknown>[] | null; error: unknown } | null) => {
      _contentMediaData = data;
    },
  };
});

// Mock the Supabase client — safely references mockQueryBuilder from vi.hoisted
vi.mock("@supabase/supabase-js", () => {
  return {
    createClient: vi.fn(() => ({
      from: vi.fn(() => mockQueryBuilder),
      storage: {
        from: vi.fn(() => ({
          getPublicUrl: vi.fn(() => ({
            data: { publicUrl: "https://test.supabase.co/storage/v1/object/public/site-media/test.jpg" },
          })),
          upload: vi.fn().mockResolvedValue({ error: null }),
          remove: vi.fn().mockResolvedValue({ error: null }),
        })),
      },
      auth: {
        getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      },
    })),
  };
});

// Mock environment configs so createSupabaseServiceRoleClient works
vi.mock("@/lib/config/public-env", () => ({
  getPublicEnv: () => ({
    NEXT_PUBLIC_APP_URL: "http://localhost:3000",
    NEXT_PUBLIC_SUPABASE_URL: "https://test.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "test-anon-key",
  }),
}));

vi.mock("@/lib/config/server-env", () => ({
  getServerEnv: () => ({
    APP_ENV: "test",
    APP_DEFAULT_LOCALE: "th",
    APP_SUPPORTED_LOCALES: "th,en",
    APP_TIMEZONE: "Asia/Bangkok",
    SUPABASE_SERVICE_ROLE_KEY: "test-service-role-key",
    SUPABASE_DATABASE_URL: "postgresql://test:test@localhost:5432/postgres",
    MAX_UPLOAD_IMAGE_SIZE_MB: 5,
    ALLOWED_TOURIST_IMAGE_MIME_TYPES: "image/jpeg,image/png,image/webp",
    CERTIFICATE_SIGNED_URL_TTL_SECONDS: 600,
    EXPORT_SIGNED_URL_TTL_SECONDS: 600,
    EXPORT_MAX_ROWS: 5000,
    STORAGE_PROVIDER: "supabase",
  }),
}));

// Mock requirePermission but keep the rest of guards (AdminAuthError, etc.)
vi.mock("@/lib/auth/guards", async () => {
  const actual = await vi.importActual<typeof import("@/lib/auth/guards")>("@/lib/auth/guards");
  return {
    ...actual,
    requirePermission: mockRequirePermission,
  };
});

// ── Helpers ─────────────────────────────────────────────────────────────────

function createRequest(method: string, body?: unknown): NextRequest {
  const url = new URL("http://localhost:3000/api/admin/media/test-id");
  return new NextRequest(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
}

function buildPermissions() {
  return {
    actorId: "admin-1",
    authUserId: "auth-user-1",
    adminId: "admin-1",
    email: "admin@test.com",
    displayName: "Test Admin",
    roleNames: ["admin"],
    permissions: ["media.deactivate", "media.activate"],
    actor: {
      adminId: "admin-1",
      authUserId: "auth-user-1",
      email: "admin@test.com",
      displayName: "Test Admin",
      roleNames: ["admin"],
      permissions: ["media.deactivate", "media.activate"],
    },
  };
}

// ── Delete (Archive) Tests ─────────────────────────────────────────────────

describe("DELETE /api/admin/media/[id] — integration flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequirePermission.mockResolvedValue(buildPermissions());
    setContentMediaData(null); // Reset content_media mock data
  });

  it("fetches the asset, checks references, and archives it", async () => {
    mockQueryBuilder.single.mockResolvedValue({
      data: {
        id: "media-1",
        storage_path: "attractions/abc.jpg",
        file_name: "photo.jpg",
        mime_type: "image/jpeg",
        size_bytes: 102400,
        category: "General",
        lifecycle_status: "active",
      },
      error: null,
    });

    const eqAfterUpdate: Mock = vi.fn().mockResolvedValue({ error: null, data: null });
    mockQueryBuilder.update.mockReturnValue({ eq: eqAfterUpdate });

    const { DELETE } = await import("@/app/api/admin/media/[id]/route");

    const response = await DELETE(createRequest("DELETE"), {
      params: Promise.resolve({ id: "media-1" }),
    });

    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(Array.isArray(body.references)).toBe(true);

    // requirePermission was called with media.deactivate
    expect(mockRequirePermission).toHaveBeenCalledWith("media.deactivate");

    // .single() was called (to fetch the asset)
    expect(mockQueryBuilder.single).toHaveBeenCalled();

    // update() was called with the full archive payload including archived_by
    expect(mockQueryBuilder.update).toHaveBeenCalledWith({
      lifecycle_status: "archived",
      archived_at: expect.any(String),
      archived_by: "auth-user-1",
    });

    // .eq() was called with the correct id
    expect(eqAfterUpdate).toHaveBeenCalledWith("id", "media-1");
  });

  it("returns 404 when the asset does not exist", async () => {
    mockQueryBuilder.single.mockResolvedValue({
      data: null,
      error: { message: "Not found", details: "", hint: "", code: "PGRST116" },
    });

    const { DELETE } = await import("@/app/api/admin/media/[id]/route");

    const response = await DELETE(createRequest("DELETE"), {
      params: Promise.resolve({ id: "nonexistent" }),
    });

    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body.error).toBe("Media not found");
  });

  it("returns empty references when content_media has no matching records", async () => {
    mockQueryBuilder.single.mockResolvedValue({
      data: {
        id: "media-1",
        storage_path: "attractions/abc.jpg",
      },
      error: null,
    });

    // No content_media data configured — the .eq("storage_path") path
    // returns the builder (no thenable), so contentMediaRefs is undefined.
    const { DELETE } = await import("@/app/api/admin/media/[id]/route");

    const response = await DELETE(createRequest("DELETE"), {
      params: Promise.resolve({ id: "media-1" }),
    });

    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.references).toEqual([]);
  });

  it("discovers content_media references and resolves entity names", async () => {
    // ── Asset fetch ──────────────────────────────────────────────────────
    mockQueryBuilder.single.mockResolvedValue({
      data: {
        id: "media-1",
        storage_path: "attractions/abc.jpg",
      },
      error: null,
    });

    // ── Content media query (.select().eq("storage_path", ...)) ─────────
    // setContentMediaData configures what the .eq("storage_path") path
    // resolves to. eqMock returns a thenable (Promise) instead of the
    // builder when column="storage_path" and data is configured.
    setContentMediaData({
      data: [
        {
          media_id: 1,
          attraction_id: 42,
          restaurant_id: null,
          story_id: null,
          route_id: null,
          accommodation_id: null,
        },
        {
          media_id: 1,
          attraction_id: null,
          restaurant_id: 7,
          story_id: null,
          route_id: null,
          accommodation_id: null,
        },
        {
          media_id: 1,
          attraction_id: null,
          restaurant_id: null,
          story_id: 99,
          route_id: null,
          accommodation_id: null,
        },
      ],
      error: null,
    });

    // ── Entity lookups (.select().eq(idCol, id).maybeSingle()) ──────────
    // These are called once per non-null entityId from the content_media rows.
    // The entity lookup chains are: from(table).select(...).eq(idCol, id).maybeSingle()
    // The first .from(builder).select(builder).eq(returns builder).maybeSingle()
    // is awaited — we control what maybeSingle returns per call.
    //
    // Since maybeSingle is the same mock on the singleton builder, Vitest's
    // mockResolvedValueOnce resolves in FIFO order.
    mockQueryBuilder.maybeSingle
      .mockResolvedValueOnce({
        data: { attraction_id: 42, name_th: "หาดทรายขาว" },
        error: null,
      })
      .mockResolvedValueOnce({
        data: { restaurant_id: 7, name_th: "ครัวบ้านสวน" },
        error: null,
      })
      .mockResolvedValueOnce({
        data: { story_id: 99, title: "ตำนานเกาะทะเลใต้" },
        error: null,
      });

    const { DELETE } = await import("@/app/api/admin/media/[id]/route");

    const response = await DELETE(createRequest("DELETE"), {
      params: Promise.resolve({ id: "media-1" }),
    });

    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);

    // Verify all 3 references were discovered with correct entity info
    expect(body.references).toEqual([
      {
        entityType: "attraction",
        entityId: 42,
        name: "หาดทรายขาว",
      },
      {
        entityType: "restaurant",
        entityId: 7,
        name: "ครัวบ้านสวน",
      },
      {
        entityType: "story",
        entityId: 99,
        name: "ตำนานเกาะทะเลใต้",
      },
    ]);

    // verify that maybeSingle was called 3 times (once per non-null entity)
    expect(mockQueryBuilder.maybeSingle).toHaveBeenCalledTimes(3);

    // .eq() was called for storage_path (content_media query)
    // This is the conditionally thenable path
    expect(mockQueryBuilder.eq).toHaveBeenCalledWith("storage_path", "attractions/abc.jpg");

    // .eq() was called for each entity lookup
    expect(mockQueryBuilder.eq).toHaveBeenCalledWith("attraction_id", 42);
    expect(mockQueryBuilder.eq).toHaveBeenCalledWith("restaurant_id", 7);
    expect(mockQueryBuilder.eq).toHaveBeenCalledWith("story_id", 99);
  });

  it("skips entity lookups for null entity IDs and resolves mixed content_media rows", async () => {
    mockQueryBuilder.single.mockResolvedValue({
      data: {
        id: "media-1",
        storage_path: "routes/xyz.jpg",
      },
      error: null,
    });

    // Row with mixed null/non-null entity IDs
    setContentMediaData({
      data: [
        {
          media_id: 2,
          attraction_id: null,
          restaurant_id: null,
          story_id: null,
          route_id: 15,
          accommodation_id: 10,
        },
      ],
      error: null,
    });

    // With 1 content_media row → entityMap iterates: attraction(null)->skip,
    // restaurant(null)->skip, story(null)->skip, route(15)->lookup, accommodation(10)->lookup
    mockQueryBuilder.maybeSingle
      .mockResolvedValueOnce({
        data: { route_id: 15, name_th: "เส้นทางสามจังหวัดใต้" },
        error: null,
      })
      .mockResolvedValueOnce({
        data: { accommodation_id: 10, name_th: "รีสอร์ทริมเล" },
        error: null,
      });

    const { DELETE } = await import("@/app/api/admin/media/[id]/route");

    const response = await DELETE(createRequest("DELETE"), {
      params: Promise.resolve({ id: "media-1" }),
    });

    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);

    // Only 2 references (route + accommodation), 3 entity types skipped
    expect(body.references).toEqual([
      {
        entityType: "route",
        entityId: 15,
        name: "เส้นทางสามจังหวัดใต้",
      },
      {
        entityType: "accommodation",
        entityId: 10,
        name: "รีสอร์ทริมเล",
      },
    ]);

    expect(mockQueryBuilder.maybeSingle).toHaveBeenCalledTimes(2);

    // Verify entity lookups for route and accommodation use correct tables
    expect(mockQueryBuilder.eq).toHaveBeenCalledWith("route_id", 15);
    expect(mockQueryBuilder.eq).toHaveBeenCalledWith("accommodation_id", 10);

    // Verify storage_path lookup
    expect(mockQueryBuilder.eq).toHaveBeenCalledWith("storage_path", "routes/xyz.jpg");
  });

  it("returns 403 when user lacks media.deactivate permission", async () => {
    mockRequirePermission.mockRejectedValue(
      new (await import("@/lib/auth/guards")).AdminAuthError(
        "FORBIDDEN",
        "You do not have permission to perform this action."
      )
    );

    const { DELETE } = await import("@/app/api/admin/media/[id]/route");

    const response = await DELETE(createRequest("DELETE"), {
      params: Promise.resolve({ id: "media-1" }),
    });

    expect(response.status).toBe(403);
    const body = await response.json();
    expect(body.error).toContain("permission");
  });

  it("returns 500 when the update operation fails", async () => {
    mockQueryBuilder.single.mockResolvedValue({
      data: {
        id: "media-1",
        storage_path: "attractions/abc.jpg",
      },
      error: null,
    });

    const eqAfterUpdate: Mock = vi.fn().mockResolvedValue({
      error: { message: "Constraint violation", code: "23505" },
      data: null,
    });
    mockQueryBuilder.update.mockReturnValue({ eq: eqAfterUpdate });

    const { DELETE } = await import("@/app/api/admin/media/[id]/route");

    const response = await DELETE(createRequest("DELETE"), {
      params: Promise.resolve({ id: "media-1" }),
    });

    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.error).toContain("Archive failed");
  });
});

// ── Patch (Unarchive) Tests ────────────────────────────────────────────────

describe("PATCH /api/admin/media/[id] — integration flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequirePermission.mockResolvedValue(buildPermissions());
    setContentMediaData(null);
  });

  it("unarchives an asset successfully", async () => {
    const eqAfterUpdate: Mock = vi.fn().mockResolvedValue({ error: null, data: null });
    mockQueryBuilder.update.mockReturnValue({ eq: eqAfterUpdate });

    const { PATCH } = await import("@/app/api/admin/media/[id]/route");

    const response = await PATCH(
      createRequest("PATCH", { action: "unarchive" }),
      { params: Promise.resolve({ id: "media-1" }) }
    );

    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);

    // requirePermission was called with media.activate
    expect(mockRequirePermission).toHaveBeenCalledWith("media.activate");

    // update() was called with the unarchive payload
    expect(mockQueryBuilder.update).toHaveBeenCalledWith({
      lifecycle_status: "active",
      archived_at: null,
    });

    // .eq() was called with the correct id
    expect(eqAfterUpdate).toHaveBeenCalledWith("id", "media-1");
  });

  it("returns 400 for an unknown action", async () => {
    const { PATCH } = await import("@/app/api/admin/media/[id]/route");

    const response = await PATCH(
      createRequest("PATCH", { action: "delete_permanently" }),
      { params: Promise.resolve({ id: "media-1" }) }
    );

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBe("Unknown action");
  });

  it("returns 403 when user lacks media.activate permission", async () => {
    mockRequirePermission.mockRejectedValue(
      new (await import("@/lib/auth/guards")).AdminAuthError(
        "FORBIDDEN",
        "You do not have permission to perform this action."
      )
    );

    const { PATCH } = await import("@/app/api/admin/media/[id]/route");

    const response = await PATCH(
      createRequest("PATCH", { action: "unarchive" }),
      { params: Promise.resolve({ id: "media-1" }) }
    );

    expect(response.status).toBe(403);
    const body = await response.json();
    expect(body.error).toContain("permission");
  });

  it("returns 500 when the update operation fails", async () => {
    const eqAfterUpdate: Mock = vi.fn().mockResolvedValue({
      error: { message: "DB error", code: "23505" },
      data: null,
    });
    mockQueryBuilder.update.mockReturnValue({ eq: eqAfterUpdate });

    const { PATCH } = await import("@/app/api/admin/media/[id]/route");

    const response = await PATCH(
      createRequest("PATCH", { action: "unarchive" }),
      { params: Promise.resolve({ id: "media-1" }) }
    );

    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.error).toContain("Action failed");
  });
});

// ── Real Import Chain Verification ─────────────────────────────────────────
// These tests confirm the real createSupabaseServiceRoleClient is used
// (not mocked at the module level) by verifying its dependencies resolve.

describe("Real service-role client integration", () => {
  it("createSupabaseServiceRoleClient is the real function (not mocked)", async () => {
    const { createSupabaseServiceRoleClient } = await import(
      "@/lib/supabase/service-role"
    );
    // Calling it should not throw (env mocks provide valid config)
    expect(() => createSupabaseServiceRoleClient()).not.toThrow();
  });

  it("route handler imports are live (not stub mocks)", async () => {
    const routeModule = await import("@/app/api/admin/media/[id]/route");
    expect(typeof routeModule.DELETE).toBe("function");
    expect(typeof routeModule.PATCH).toBe("function");
    expect(routeModule.runtime).toBe("nodejs");
  });
});
