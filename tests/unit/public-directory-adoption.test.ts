import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const directoryPages = [
  "app/(public)/stories/page.tsx",
  "app/(public)/routes/page.tsx",
  "app/(public)/360-vista/page.tsx",
];

describe("public directory adoption", () => {
  it.each(directoryPages)("uses the shared compact directory frame in %s", (file) => {
    const source = readFileSync(resolve(process.cwd(), file), "utf8");

    expect(source).toContain("PublicDirectoryIntro");
    expect(source).toContain('variant="directory"');
    expect(source).not.toContain('variant="listing" className="pb-16 pt-8 sm:pt-10"');
  });

  it("keeps the 360 directory honest and action-oriented", () => {
    const source = readFileSync(resolve(process.cwd(), "app/(public)/360-vista/page.tsx"), "utf8");

    expect(source).toContain("PublicResultSummary");
    expect(source).toContain("PublicVistaGrid");
    expect(source).toContain("ผู้ให้บริการภายนอก");
  });

  it("keeps the approved accommodation hero and the dedicated result composition", () => {
    const source = readFileSync(
      resolve(process.cwd(), "app/(public)/accommodations/page.tsx"),
      "utf8",
    );

    expect(source).toContain("AccommodationDirectoryHero");
    expect(source).toContain("AccommodationFeaturedResult");
    expect(source).toContain("AccommodationResultCard");
    expect(source).toContain('variant="listing"');
  });

  it("keeps the approved restaurant hero and the real planning workspace", () => {
    const source = readFileSync(
      resolve(process.cwd(), "app/(public)/restaurants/page.tsx"),
      "utf8",
    );

    expect(source).toContain("RestaurantHero");
    expect(source).toContain("RestaurantDiscoveryFilters");
    expect(source).toContain("RestaurantDirectoryClient");
    expect(source).toContain('variant="directory"');
    expect(source).not.toContain("PublicDirectoryIntro");
  });
});
