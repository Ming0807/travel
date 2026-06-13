import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Hoisted mocks (safe for vi.mock factories) ────────────────────────────

const { mockRequirePermission, mockSupabaseChain } = vi.hoisted(() => {
  // Build a chainable query builder mock
  const chain: Record<string, ReturnType<typeof vi.fn>> = {};
  const methods = ["select", "or", "in", "order", "limit"];
  for (const m of methods) {
    chain[m] = vi.fn();
  }

  const requirePerm = vi.fn<(...args: unknown[]) => Promise<Record<string, unknown>>>();

  return { mockRequirePermission: requirePerm, mockSupabaseChain: chain };
});

vi.mock("@/lib/auth/guards", async () => {
  const actual = await vi.importActual<typeof import("@/lib/auth/guards")>("@/lib/auth/guards");
  return {
    ...actual,
    requirePermission: mockRequirePermission,
  };
});

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn().mockResolvedValue({
    from: vi.fn().mockReturnValue(mockSupabaseChain),
  }),
}));

import { searchRoutesAction, getRoutesBySlugsAction } from "@/app/actions/admin-content-actions";
import { AdminAuthError } from "@/lib/auth/guards";

// ── Helpers ────────────────────────────────────────────────────────────────

const actorResult = {
  actorId: "admin-1",
  adminId: "admin-1",
  authUserId: "auth-user-1",
  email: "admin@test.com",
  displayName: "Admin",
  roleNames: ["admin"],
  permissions: ["route.read"],
  actor: {
    adminId: "admin-1",
    authUserId: "auth-user-1",
    email: "admin@test.com",
    displayName: "Admin",
    roleNames: ["admin"],
    permissions: ["route.read"],
  },
};

function setupChain() {
  // Restore builder pattern: all chain methods return the chain
  const methods = ["select", "or", "in", "order", "limit"];
  for (const m of methods) {
    mockSupabaseChain[m].mockReturnValue(mockSupabaseChain);
  }
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe("admin-content-actions — route picker", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupChain();
  });

  describe("searchRoutesAction", () => {
    it("requires route.read (not attraction.read)", async () => {
      mockRequirePermission.mockRejectedValue(
        new AdminAuthError("FORBIDDEN", "You do not have permission to perform this action.")
      );

      const result = await searchRoutesAction("test-query");

      expect(mockRequirePermission).toHaveBeenCalledTimes(1);
      expect(mockRequirePermission).toHaveBeenCalledWith("route.read");
      expect(mockRequirePermission).not.toHaveBeenCalledWith("attraction.read");
      expect(result).toEqual({ success: false, error: "Internal server error" });
    });

    it("proceeds when route.read is granted", async () => {
      mockRequirePermission.mockResolvedValue(actorResult);
      mockSupabaseChain.limit.mockResolvedValue({ data: [], error: null });

      const result = await searchRoutesAction("test");

      expect(mockRequirePermission).toHaveBeenCalledWith("route.read");
      expect(result).toEqual({ success: true, data: [] });
    });
  });

  describe("getRoutesBySlugsAction", () => {
    it("requires route.read (not attraction.read)", async () => {
      mockRequirePermission.mockRejectedValue(
        new AdminAuthError("FORBIDDEN", "You do not have permission to perform this action.")
      );

      const result = await getRoutesBySlugsAction(["route-1"]);

      expect(mockRequirePermission).toHaveBeenCalledTimes(1);
      expect(mockRequirePermission).toHaveBeenCalledWith("route.read");
      expect(mockRequirePermission).not.toHaveBeenCalledWith("attraction.read");
      expect(result).toEqual({ success: false, error: "Internal server error" });
    });

    it("returns empty array for empty slugs without calling requirePermission", async () => {
      const result = await getRoutesBySlugsAction([]);
      expect(result).toEqual({ success: true, data: [] });
    });

    it("preserves admin-specified slug order", async () => {
      mockRequirePermission.mockResolvedValue(actorResult);
      mockSupabaseChain.limit.mockResolvedValue({
        data: [
          { route_id: 1, name_th: "เส้นทาง ก", name_en: null, slug: "route-a", is_published: true, is_active: true },
          { route_id: 3, name_th: "เส้นทาง ค", name_en: null, slug: "route-c", is_published: false, is_active: true },
        ],
        error: null,
      });

      const result = await getRoutesBySlugsAction(["route-c", "route-a"]);

      expect(mockRequirePermission).toHaveBeenCalledWith("route.read");
      expect(result.success).toBe(true);
      const data = result.data as Array<{ slug: string }>;
      expect(data).toHaveLength(2);
      expect(data[0].slug).toBe("route-c");
      expect(data[1].slug).toBe("route-a");
    });
  });

  describe("searchRoutesAction — wildcard hardening", () => {
    it("escapes % wildcard in search queries", async () => {
      mockRequirePermission.mockResolvedValue(actorResult);
      mockSupabaseChain.limit.mockResolvedValue({ data: [], error: null });

      await searchRoutesAction("100%");

      const orCall = mockSupabaseChain.or.mock.calls[0]?.[0] as string;
      // The user's "%" should be escaped to "\%", so "100\%" appears in the query
      expect(orCall).toContain("100\\%");
      // The unescaped form "100%" (where % acts as wildcard) should NOT appear
      expect(orCall).not.toContain("100%%");
    });

    it("escapes _ wildcard in search queries", async () => {
      mockRequirePermission.mockResolvedValue(actorResult);
      mockSupabaseChain.limit.mockResolvedValue({ data: [], error: null });

      await searchRoutesAction("test_name");

      const orCall = mockSupabaseChain.or.mock.calls[0]?.[0] as string;
      expect(orCall).toContain("\\_");
    });
  });
});
