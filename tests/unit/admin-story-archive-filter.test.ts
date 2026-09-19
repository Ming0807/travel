import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => {
  const query: Record<string, ReturnType<typeof vi.fn>> = {};
  for (const method of ["select", "order", "range", "eq", "neq", "in", "or", "is", "gte", "lte"]) {
    query[method] = vi.fn().mockReturnValue(query);
  }
  query.then = vi.fn((resolve: (value: unknown) => unknown) => resolve({ data: [], error: null, count: 0 }));
  return { query, from: vi.fn(() => query) };
});

vi.mock("@/lib/supabase/service-role", () => ({
  createSupabaseServiceRoleClient: () => ({ from: mocks.from }),
}));

import { listAdminStories } from "@/lib/repositories/admin-story.repository";

describe("admin story archive filter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    for (const method of ["select", "order", "range", "eq", "neq", "in", "or", "is", "gte", "lte"]) {
      mocks.query[method].mockReturnValue(mocks.query);
    }
  });

  it("excludes archived stories from the default library", async () => {
    await listAdminStories({ page: 1, pageSize: 20, authorType: "admin" });
    expect(mocks.query.neq).toHaveBeenCalledWith("status", "archived");
  });

  it("shows archived stories when the filter explicitly requests them", async () => {
    await listAdminStories({ page: 1, pageSize: 20, authorType: "admin", status: "archived" });
    expect(mocks.query.eq).toHaveBeenCalledWith("status", "archived");
    expect(mocks.query.neq).not.toHaveBeenCalledWith("status", "archived");
  });
});
