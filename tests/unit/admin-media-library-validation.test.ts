import { describe, expect, it } from "vitest";
import { adminMediaLibraryFiltersSchema } from "@/lib/validation/media-library";

describe("adminMediaLibraryFiltersSchema", () => {
  it("defaults to the active first page", () => {
    expect(adminMediaLibraryFiltersSchema.parse({})).toEqual({
      page: 1,
      pageSize: 20,
      lifecycleStatus: "active",
    });
  });

  it("normalizes every URL-backed media library filter", () => {
    expect(
      adminMediaLibraryFiltersSchema.parse({
        page: "2",
        pageSize: "40",
        search: "  beach hero  ",
        category: "Attractions",
        lifecycleStatus: "archived",
        mediaType: "webp",
      }),
    ).toEqual({
      page: 2,
      pageSize: 40,
      search: "beach hero",
      category: "Attractions",
      lifecycleStatus: "archived",
      mediaType: "webp",
    });
  });

  it.each([
    { category: "Tourist Photos" },
    { lifecycleStatus: "deleted" },
    { mediaType: "svg" },
    { search: "x".repeat(121) },
  ])("rejects unsupported filter values: %o", (input) => {
    expect(adminMediaLibraryFiltersSchema.safeParse(input).success).toBe(false);
  });
});
