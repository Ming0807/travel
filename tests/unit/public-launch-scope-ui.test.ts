import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function source(path: string) {
  return readFileSync(join(process.cwd(), path), "utf8");
}

describe("Public Yala launch scope UI", () => {
  it("loads destination options where public flows still expose province choice", () => {
    for (const path of [
      "app/(public)/stories/page.tsx",
      "app/(public)/stories/share/page.tsx",
    ]) {
      expect(source(path)).toContain("listLiveDestinationProvinces");
    }
  });

  it("locks attraction discovery to Yala and removes stale province queries", () => {
    const content = source("app/(public)/attractions/page.tsx");

    expect(content).toContain("requestedProvince");
    expect(content).toContain("ขอบเขตข้อมูลปัจจุบัน: จังหวัดยะลา");
    expect(content).not.toContain("listLiveDestinationProvinces");
  });

  it("does not hardcode hidden destination options in public filters", () => {
    for (const path of [
      "app/(public)/attractions/page.tsx",
      "app/(public)/stories/page.tsx",
      "components/restaurants/RestaurantFilterBar.tsx",
      "components/accommodations/AccommodationFilterBar.tsx",
    ]) {
      const content = source(path);
      expect(content).not.toContain('{ value: "Pattani"');
      expect(content).not.toContain('{ value: "Narathiwat"');
    }
  });

  it("hides the province selector when only one destination is live", () => {
    expect(source("components/attractions/AttractionDiscoveryFilters.tsx")).not.toContain(
      'name="province"',
    );
    expect(source("app/(public)/stories/page.tsx")).toContain(
      "provinceOptions.length > 1",
    );
  });
});
