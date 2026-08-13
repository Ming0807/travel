import { describe, expect, it } from "vitest";
import {
  isMissingRelatedContentSettingsError,
  resolveRelatedContentSettings,
} from "@/lib/content/attraction-related-settings";

describe("attraction related-content settings compatibility", () => {
  it("derives manual for legacy relations and automatic for empty legacy sections", () => {
    const settings = resolveRelatedContentSettings([], {
      attractions: 2,
      restaurants: 0,
      accommodations: 0,
      stories: 1,
    });

    expect(settings).toEqual({
      attractions: { contentType: "attractions", mode: "manual", maxItems: 4 },
      restaurants: { contentType: "restaurants", mode: "automatic", maxItems: 4 },
      accommodations: { contentType: "accommodations", mode: "automatic", maxItems: 4 },
      stories: { contentType: "stories", mode: "manual", maxItems: 3 },
    });
  });

  it("uses valid persisted values and repairs malformed rows with safe defaults", () => {
    const settings = resolveRelatedContentSettings(
      [
        { content_type: "attractions", mode: "hybrid", max_items: 6 },
        { content_type: "restaurants", mode: "not-a-mode", max_items: 100 },
        { content_type: "stories", mode: "hidden", max_items: 2 },
      ],
      { attractions: 0, restaurants: 2, accommodations: 0, stories: 0 },
    );

    expect(settings.attractions).toMatchObject({ mode: "hybrid", maxItems: 6 });
    expect(settings.restaurants).toMatchObject({ mode: "manual", maxItems: 4 });
    expect(settings.accommodations).toMatchObject({ mode: "automatic", maxItems: 4 });
    expect(settings.stories).toMatchObject({ mode: "hidden", maxItems: 2 });
  });

  it("recognizes only missing-table and schema-cache errors as migration compatibility cases", () => {
    expect(isMissingRelatedContentSettingsError({ code: "42P01", message: "relation does not exist" })).toBe(true);
    expect(isMissingRelatedContentSettingsError({ code: "PGRST205", message: "table not in schema cache" })).toBe(true);
    expect(isMissingRelatedContentSettingsError({ code: "42501", message: "permission denied" })).toBe(false);
    expect(isMissingRelatedContentSettingsError(null)).toBe(false);
  });
});
