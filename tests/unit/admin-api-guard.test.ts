import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ user: vi.fn(), admin: vi.fn(), service: vi.fn(), redirect: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createSupabaseServerClient: async () => ({ auth: { getUser: mocks.user } }) }));
vi.mock("@/lib/supabase/service-role", () => ({ createSupabaseServiceRoleClient: mocks.service }));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));

import { requirePermission } from "@/lib/auth/guards";

describe("admin API authentication boundary", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.redirect.mockImplementation(() => { throw new Error("NEXT_REDIRECT"); });
    mocks.user.mockResolvedValue({ data: { user: null }, error: null });
    mocks.service.mockReturnValue({ from: () => ({ select: () => ({ eq: () => ({ maybeSingle: mocks.admin }) }) }) });
  });

  it("throws UNAUTHORIZED for an API without querying admin records or redirecting", async () => {
    await expect(requirePermission("dashboard.read", { unauthenticated: "throw" })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    expect(mocks.redirect).not.toHaveBeenCalled();
    expect(mocks.service).not.toHaveBeenCalled();
  });

  it("retains the existing login redirect for page callers", async () => {
    await expect(requirePermission("dashboard.read")).rejects.toThrow("NEXT_REDIRECT");
    expect(mocks.redirect).toHaveBeenCalledWith("/admin/login");
  });

  it("does not weaken role checks in API mode", async () => {
    mocks.user.mockResolvedValue({ data: { user: { id: "test-user", email: "admin@example.test" } }, error: null });
    mocks.admin.mockResolvedValue({ data: { admin_id: 1, email: "admin@example.test", is_active: true, admin_user_roles: [] }, error: null });
    await expect(requirePermission("dashboard.read", { unauthenticated: "throw" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(mocks.redirect).not.toHaveBeenCalled();
  });

  it("continues to reject inactive administrators", async () => {
    mocks.user.mockResolvedValue({ data: { user: { id: "test-user" } }, error: null });
    mocks.admin.mockResolvedValue({ data: { admin_id: 1, is_active: false }, error: null });
    await expect(requirePermission("dashboard.read", { unauthenticated: "throw" })).rejects.toMatchObject({ code: "ADMIN_INACTIVE" });
  });
});
