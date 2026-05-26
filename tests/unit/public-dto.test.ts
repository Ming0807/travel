import { describe, it, expect, vi } from "vitest";

// Mock server-only to prevent import errors in test environment
vi.mock("server-only", () => ({}));

import { listPublicAttractionCards, listPublicStories, listPublicRoutes } from "@/lib/repositories/public-content.repository";

// Mock Supabase to always throw, so we test the fallback DTOs
vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn().mockImplementation(() => {
    throw new Error("Simulated DB failure");
  })
}));

describe("Public Content DTOs (empty DB/error states)", () => {
  it("returns an empty attraction list when the public DB query fails", async () => {
    const attractions = await listPublicAttractionCards(1);
    expect(attractions).toEqual([]);
  });

  it("returns an empty story list when the public DB query fails", async () => {
    const stories = await listPublicStories({ limit: 1 });
    expect(stories).toEqual([]);
  });

  it("returns empty array for routes on fallback (no mock data)", async () => {
    const routes = await listPublicRoutes(1);
    expect(routes).toEqual([]);
  });
});
