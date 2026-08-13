import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

type ExportParityCase = {
  module: string;
  schema: string;
  requiredClauses: string[];
};

const cases: ExportParityCase[] = [
  {
    module: "attractions",
    schema: "adminAttractionFiltersSchema",
    requiredClauses: [
      "filters.search",
      'eq("province_id", filters.provinceId)',
      'eq("district_id", filters.districtId)',
      "listAttractionIdsByType(filters.attractionTypeId)",
      'in("attraction_id", categoryAttractionIds)',
      'eq("is_published", filters.isPublished)',
      'eq("is_active", filters.isActive)',
    ],
  },
  {
    module: "stories",
    schema: "adminStoryFiltersSchema",
    requiredClauses: [
      "filters.search",
      'eq("province_id", filters.provinceId)',
      'eq("status", filters.status)',
      'eq("is_published", filters.isPublished)',
    ],
  },
  {
    module: "routes",
    schema: "adminRouteFiltersSchema",
    requiredClauses: [
      "filters.search",
      'eq("is_published", filters.isPublished)',
      'eq("is_active", filters.isActive)',
    ],
  },
  {
    module: "restaurants",
    schema: "adminRestaurantFiltersSchema",
    requiredClauses: [
      "filters.search",
      'eq("province_id", filters.provinceId)',
      'ilike("food_type"',
      'eq("is_published", filters.isPublished)',
    ],
  },
  {
    module: "accommodations",
    schema: "adminAccommodationFiltersSchema",
    requiredClauses: [
      "filters.search",
      'eq("province_id", filters.provinceId)',
      'ilike("accommodation_type"',
      'eq("is_published", filters.isPublished)',
    ],
  },
  {
    module: "badges",
    schema: "adminBadgeFiltersSchema",
    requiredClauses: [
      "filters.search",
      'eq("category", filters.category)',
      'eq("is_active", filters.isActive === "true")',
    ],
  },
];

describe("admin content export filter parity", () => {
  it.each(cases)("validates and applies every $module list filter", ({ module, schema, requiredClauses }) => {
    const source = readFileSync(`app/api/admin/export/${module}/route.ts`, "utf8");

    expect(source).toContain(`${schema}.safeParse`);
    expect(source).toContain('status: 400');
    expect(source).toContain("maxRows + 1");
    for (const clause of requiredClauses) expect(source).toContain(clause);
  });

  it("escapes LIKE wildcards before applying text filters", () => {
    for (const { module } of cases) {
      const source = readFileSync(`app/api/admin/export/${module}/route.ts`, "utf8");
      expect(source).toContain('replace(/%/g, "\\\\%")');
      expect(source).toContain('replace(/_/g, "\\\\_")');
    }
  });
});
