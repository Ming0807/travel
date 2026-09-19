import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(process.cwd(), "supabase/migrations/20260919000000_sync_restaurant_attractions.sql"),
  "utf8",
);

describe("restaurant attraction relationship migration", () => {
  it("creates a service-role-only transactional sync function", () => {
    expect(migration).toMatch(/FUNCTION public\.sync_restaurant_attractions/i);
    expect(migration).toMatch(/SECURITY DEFINER/i);
    expect(migration).toMatch(/REVOKE ALL ON FUNCTION public\.sync_restaurant_attractions[^;]+FROM PUBLIC, anon, authenticated/i);
    expect(migration).toMatch(/GRANT EXECUTE ON FUNCTION public\.sync_restaurant_attractions[^;]+TO service_role/i);
    expect(migration).not.toMatch(/EXCEPTION\s+WHEN/i);
  });

  it("deduplicates ordered ids and rejects inactive attraction records before mutation", () => {
    expect(migration).toMatch(/WITH ORDINALITY/i);
    expect(migration).toMatch(/MIN\(requested\.ordinality\)/i);
    expect(migration).toContain("RESTAURANT_ATTRACTION_LIMIT_EXCEEDED");
    expect(migration).toContain("RESTAURANT_ATTRACTION_INVALID");

    const validationIndex = migration.indexOf("RESTAURANT_ATTRACTION_INVALID");
    const deleteIndex = migration.indexOf("DELETE FROM public.restaurant_attractions");
    expect(validationIndex).toBeGreaterThan(-1);
    expect(deleteIndex).toBeGreaterThan(validationIndex);
  });

  it("replaces both public relationship directions in the same function", () => {
    expect(migration).toMatch(/DELETE FROM public\.restaurant_attractions/i);
    expect(migration).toMatch(/INSERT INTO public\.restaurant_attractions/i);
    expect(migration).toMatch(/DELETE FROM public\.attraction_related_restaurants/i);
    expect(migration).toMatch(/INSERT INTO public\.attraction_related_restaurants/i);
    expect(migration).toMatch(/display_order/i);
    expect(migration).toMatch(/FUNCTION public\.create_restaurant_with_categories_and_attractions/i);
    expect(migration).toMatch(/FUNCTION public\.update_restaurant_with_categories_and_attractions/i);
    expect(migration).toMatch(/PERFORM public\.sync_restaurant_attractions/i);
  });
});
