import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(process.cwd(), "supabase/migrations/20260812000000_create_restaurant_categories.sql"),
  "utf8",
);

describe("restaurant category migration", () => {
  it("creates normalized category and assignment tables with constraints", () => {
    expect(migration).toMatch(/CREATE TABLE public\.restaurant_categories/i);
    expect(migration).toMatch(/CREATE TABLE public\.restaurant_category_assignments/i);
    expect(migration).toMatch(/UNIQUE\s*\(slug\)/i);
    expect(migration).toMatch(/CHECK\s*\(section_key IN \('local', 'meals', 'cafes', 'other'\)\)/i);
    expect(migration).toMatch(/PRIMARY KEY \(restaurant_id, category_id\)/i);
    expect(migration).toContain("idx_restaurant_category_assignments_category_id");
  });

  it("seeds the controlled categories and backfills legacy food types", () => {
    for (const slug of [
      "thai",
      "malay",
      "thai-chinese",
      "halal",
      "street-food",
      "dimsum",
      "dessert-cafe",
      "coffee",
      "bakery",
      "international",
    ]) {
      expect(migration).toContain(`'${slug}'`);
    }
    expect(migration).toMatch(/INSERT INTO public\.restaurant_category_assignments[\s\S]+FROM public\.restaurants/i);
    expect(migration).not.toMatch(/DROP COLUMN\s+food_type/i);
  });

  it("syncs assignments transactionally and protects published restaurants", () => {
    expect(migration).toMatch(/FUNCTION public\.sync_restaurant_categories/i);
    expect(migration).toMatch(/DELETE FROM public\.restaurant_category_assignments/i);
    expect(migration).toMatch(/INSERT INTO public\.restaurant_category_assignments/i);
    expect(migration).toMatch(/is_published[\s\S]+RESTAURANT_CATEGORY_REQUIRED/i);
    expect(migration).toMatch(/p_is_published boolean DEFAULT NULL/i);
    expect(migration).toMatch(/REVOKE ALL ON FUNCTION public\.sync_restaurant_categories[^;]+FROM PUBLIC, anon, authenticated/i);
    expect(migration).toMatch(/GRANT EXECUTE ON FUNCTION public\.sync_restaurant_categories[^;]+TO service_role/i);
    expect(migration).toMatch(/FUNCTION public\.create_restaurant_with_categories/i);
    expect(migration).toMatch(/FUNCTION public\.update_restaurant_with_categories/i);
    expect(migration).toMatch(/PERFORM public\.sync_restaurant_categories/i);
    expect(migration).toMatch(/FUNCTION public\.set_restaurant_category_active/i);
    expect(migration).toContain("RESTAURANT_CATEGORY_LAST_ACTIVE");
  });

  it("enables RLS and limits public assignment visibility to public restaurants", () => {
    expect(migration).toMatch(/ALTER TABLE public\.restaurant_categories ENABLE ROW LEVEL SECURITY/i);
    expect(migration).toMatch(/ALTER TABLE public\.restaurant_category_assignments ENABLE ROW LEVEL SECURITY/i);
    expect(migration).toMatch(/is_active\s*=\s*true/i);
    expect(migration).toMatch(/public\.is_public_restaurant\(restaurant_id\)/i);
    expect(migration).toMatch(/public\.is_public_restaurant_category\(category_id\)/i);
    expect(migration).toMatch(/FUNCTION public\.list_public_restaurant_categories/i);
  });
});
