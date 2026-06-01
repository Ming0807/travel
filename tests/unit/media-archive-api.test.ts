import { describe, expect, it, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";
import { NextRequest } from "next/server";

// Local copy of AdminAuthError to avoid importing server-only guarded module in test environment
class AdminAuthError extends Error {
  constructor(
    public readonly code: string,
    message: string
  ) {
    super(message);
    this.name = "AdminAuthError";
  }
}

// ── Mocks ──────────────────────────────────────────────────────────────────

const mockRequirePermission = vi.fn<(...args: unknown[]) => Promise<Record<string, unknown>>>();
const mockFromChain: Mock = vi.fn();

function mockDbChain(returns: Record<string, unknown>) {
  // A proper Supabase query chain: each method returns `chain`, and `.single()`/`.maybeSingle()` resolve with { data, error }
  const eqMock: Mock = vi.fn(() => chain);
  const selectMock: Mock = vi.fn(() => chain);
  const orderMock: Mock = vi.fn(() => chain);
  const updateMock: Mock = vi.fn(() => ({ eq: eqMock }));
  const insertMock: Mock = vi.fn(() => ({
    select: vi.fn(() => ({ single: vi.fn().mockResolvedValue({ data: null, error: null }) })),
  }));

  const chain = {
    select: selectMock,
    eq: eqMock,
    single: vi.fn().mockResolvedValue({ data: returns, error: null }),
    maybeSingle: vi.fn().mockResolvedValue({ data: returns, error: null }),
    order: orderMock,
    update: updateMock,
    insert: insertMock,
  };

  mockFromChain.mockReturnValue(chain);

  return chain;
}

vi.mock("@/lib/auth/guards", () => ({
  AdminAuthError,
  requirePermission: mockRequirePermission,
}));

vi.mock("@/lib/supabase/service-role", () => ({
  createSupabaseServiceRoleClient: () => ({
    from: mockFromChain,
  }),
}));

// ── Helpers ─────────────────────────────────────────────────────────────────

function createRequest(method: string, body?: unknown): NextRequest {
  const url = new URL("http://localhost:3000/api/admin/media/test-id");
  const req = new NextRequest(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  return req;
}

// ── Suite ──────────────────────────────────────────────────────────────────

describe("Media archive API (DELETE /api/admin/media/[id])", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequirePermission.mockResolvedValue({
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
    });
  });

  it("archives an asset successfully", async () => {
    mockDbChain({
      id: "media-1",
      file_name: "photo.jpg",
      storage_path: "attractions/uuid.jpg",
      mime_type: "image/jpeg",
      size_bytes: 102400,
      category: "General",
      lifecycle_status: "active",
      created_at: new Date().toISOString(),
    });

    const { DELETE } = await import("@/app/api/admin/media/[id]/route");

    const response = await DELETE(createRequest("DELETE"), {
      params: Promise.resolve({ id: "media-1" }),
    });

    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.references).toEqual([]);

    // Should have used requirePermission with media.deactivate
    expect(mockRequirePermission).toHaveBeenCalledWith("media.deactivate");

    // Should have performed the update (archive)
    const chain = mockFromChain();
    expect(chain.update).toHaveBeenCalledWith(
      expect.objectContaining({
        lifecycle_status: "archived",
        archived_by: "auth-user-1",
      })
    );
  });

  it("returns 404 when asset is not found", async () => {
    const chain = mockDbChain({} as Record<string, unknown>);
    // Override single to return null data (asset not found)
    chain.single.mockResolvedValue({ data: null, error: { message: "Not found", details: "", hint: "", code: "PGRST116" } });

    const { DELETE } = await import("@/app/api/admin/media/[id]/route");

    const response = await DELETE(createRequest("DELETE"), {
      params: Promise.resolve({ id: "nonexistent" }),
    });

    expect(response.status).toBe(404);
  });

  it("returns 403 when user lacks media.deactivate permission", async () => {
    mockDbChain({} as Record<string, unknown>);
    mockRequirePermission.mockRejectedValue(
      new AdminAuthError("FORBIDDEN", "You do not have permission to perform this action.")
    );

    const { DELETE } = await import("@/app/api/admin/media/[id]/route");

    const response = await DELETE(createRequest("DELETE"), {
      params: Promise.resolve({ id: "media-1" }),
    });

    expect(response.status).toBe(403);
    const body = await response.json();
    expect(body.error).toContain("permission");
  });
});

describe("Media references API (GET /api/admin/media/references)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequirePermission.mockResolvedValue({
      actorId: "admin-1",
      authUserId: "auth-user-1",
      adminId: "admin-1",
      email: "admin@test.com",
      displayName: "Test Admin",
      roleNames: ["admin"],
      permissions: ["media.read"],
    });
  });

  it("requires storagePath", async () => {
    const { GET } = await import("@/app/api/admin/media/references/route");

    const response = await GET(new NextRequest("http://localhost:3000/api/admin/media/references"));

    expect(response.status).toBe(400);
    expect(mockRequirePermission).toHaveBeenCalledWith("media.read");
  });

  it("returns references for a storage path", async () => {
    mockDbChain({} as Record<string, unknown>);
    const { GET } = await import("@/app/api/admin/media/references/route");

    const response = await GET(
      new NextRequest("http://localhost:3000/api/admin/media/references?storagePath=attractions%2Fphoto.jpg")
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.references).toEqual([]);
    expect(mockRequirePermission).toHaveBeenCalledWith("media.read");
  });
});

describe("Media unarchive API (PATCH /api/admin/media/[id])", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequirePermission.mockResolvedValue({
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
    });
  });

  it("unarchives an asset successfully", async () => {
    const chain = mockDbChain({} as Record<string, unknown>);

    const { PATCH } = await import("@/app/api/admin/media/[id]/route");

    const response = await PATCH(
      createRequest("PATCH", { action: "unarchive" }),
      { params: Promise.resolve({ id: "media-1" }) }
    );

    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);

    // Should have used requirePermission with media.activate
    expect(mockRequirePermission).toHaveBeenCalledWith("media.activate");

    // Should have performed the update (unarchive)
    expect(chain.update).toHaveBeenCalledWith(
      expect.objectContaining({
        lifecycle_status: "active",
        archived_at: null,
      })
    );
  });

  it("returns 400 for unknown action", async () => {
    mockDbChain({} as Record<string, unknown>);

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
    mockDbChain({} as Record<string, unknown>);
    mockRequirePermission.mockRejectedValue(
      new AdminAuthError("FORBIDDEN", "You do not have permission to perform this action.")
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
});
