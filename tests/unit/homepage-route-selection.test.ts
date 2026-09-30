import { describe, expect, it, vi } from "vitest";
import { loadHomepageRoutes } from "@/lib/services/homepage-routes.service";
import type { PublicRouteCard } from "@/lib/repositories/public-content.repository";

const card = (slug: string): PublicRouteCard => ({ slug, name: slug, description: "", days: 1, stopCount: 3, imageUrl: null, imageAlt: "" });

describe("Home public route selection", () => {
  it("fills stale CMS selections with eligible published routes without losing priority", async () => {
    const list = vi.fn().mockResolvedValueOnce([card("selected")]).mockResolvedValueOnce([card("selected"), card("live-a"), card("live-b")]);
    const result = await loadHomepageRoutes(3, ["selected", "hidden"], list);
    expect(result.items.map((item) => item.slug)).toEqual(["selected", "live-a", "live-b"]);
    expect(list).toHaveBeenLastCalledWith(12);
    expect(result.unavailable).toBe(false);
  });
  it("does not add a fallback query when selected routes already fill the section", async () => {
    const list = vi.fn().mockResolvedValue([card("a"), card("b"), card("c")]);
    await loadHomepageRoutes(3, ["a", "b", "c"], list);
    expect(list).toHaveBeenCalledTimes(1);
  });
  it("preserves available recent routes if the broader lookup fails", async () => {
    const list = vi.fn().mockResolvedValueOnce([card("live-a")]).mockRejectedValueOnce(new Error("offline"));
    expect(await loadHomepageRoutes(3, [], list)).toEqual({ items: [card("live-a")], unavailable: false });
  });
  it("distinguishes a failed lookup from a genuinely empty public directory", async () => {
    expect(await loadHomepageRoutes(3, [], vi.fn().mockRejectedValue(new Error("offline"))))
      .toEqual({ items: [], unavailable: true });
    expect(await loadHomepageRoutes(3, [], vi.fn().mockResolvedValue([])))
      .toEqual({ items: [], unavailable: false });
  });
});
