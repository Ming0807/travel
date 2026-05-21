import { describe, it, expect, vi } from "vitest";
import { listPublicAttractionCards, listPublicStories, listPublicRoutes } from "@/lib/repositories/public-content.repository";

// Mock Supabase to always throw, so we test the fallback DTOs
vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn().mockImplementation(() => {
    throw new Error("Simulated DB failure");
  })
}));

describe("Public Content DTOs (Fallback mode)", () => {
  it("returns safe attraction cards without private data", async () => {
    const attractions = await listPublicAttractionCards(1);
    expect(attractions.length).toBeGreaterThan(0);
    const card = attractions[0];
    
    // Ensure it only has public fields
    expect(card).toHaveProperty("slug");
    expect(card).toHaveProperty("name");
    expect(card).toHaveProperty("province");
    expect(card).toHaveProperty("category");
    expect(card).toHaveProperty("description");
    expect(card).toHaveProperty("imageUrl");
    expect(card).toHaveProperty("imageAlt");
    expect(card).toHaveProperty("tags");
    
    // Ensure no internal DB fields leaked
    expect(card).not.toHaveProperty("id");
    expect(card).not.toHaveProperty("created_at");
    expect(card).not.toHaveProperty("is_published");
  });

  it("returns safe story cards without private data", async () => {
    const stories = await listPublicStories(1);
    expect(stories.length).toBeGreaterThan(0);
    const story = stories[0];
    
    expect(story).toHaveProperty("id");
    expect(story).toHaveProperty("title");
    expect(story).toHaveProperty("excerpt");
    expect(story).toHaveProperty("province");
    expect(story).toHaveProperty("date");
    expect(story).toHaveProperty("imageUrl");
    expect(story).toHaveProperty("category");
    
    expect(story).not.toHaveProperty("created_at");
  });

  it("returns empty array for routes on fallback (no mock data)", async () => {
    const routes = await listPublicRoutes(1);
    expect(routes).toEqual([]);
  });
});
