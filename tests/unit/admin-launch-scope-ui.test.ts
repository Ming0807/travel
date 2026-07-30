import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const newContentPages = [
  "app/(admin)/admin/attractions/new/page.tsx",
  "app/(admin)/admin/restaurants/new/page.tsx",
  "app/(admin)/admin/accommodations/new/page.tsx",
  "app/(admin)/admin/stories/new/page.tsx",
];

describe("Admin destination launch scope", () => {
  it("uses launch destinations for every new destination-content form", () => {
    for (const path of newContentPages) {
      const content = readFileSync(join(process.cwd(), path), "utf8");
      expect(content).toContain("listLiveDestinationProvinces");
    }
  });

  it("does not mutate the historical edit/list province repositories", () => {
    const attractionEdit = readFileSync(
      join(
        process.cwd(),
        "app/(admin)/admin/attractions/[id]/edit/page.tsx",
      ),
      "utf8",
    );
    expect(attractionEdit).toContain("getAdminProvinces");
  });

  it("rejects crafted create requests for hidden destination provinces", () => {
    for (const path of [
      "lib/repositories/admin-attraction.repository.ts",
      "lib/repositories/admin-restaurant.repository.ts",
      "lib/repositories/admin-accommodation.repository.ts",
      "lib/repositories/admin-story.repository.ts",
    ]) {
      const content = readFileSync(join(process.cwd(), path), "utf8");
      expect(content).toContain(
        "assertLiveDestinationProvinceId(input.provinceId)",
      );
    }
  });
});
