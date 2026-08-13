import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(process.cwd(), "supabase/migrations/20260813000000_add_attraction_type_assignments.sql"),
  "utf8",
);

describe("attraction multi-category migration", () => {
  it("creates a constrained assignment table and useful indexes", () => {
    expect(migration).toMatch(/CREATE TABLE public\.attraction_type_assignments/i);
    expect(migration).toMatch(/PRIMARY KEY \(attraction_id, attraction_type_id\)/i);
    expect(migration).toMatch(/CHECK \(display_order >= 0\)/i);
    expect(migration).toContain("uq_attraction_type_assignments_primary");
    expect(migration).toMatch(/WHERE is_primary = true/i);
    expect(migration).toContain("idx_attraction_type_assignments_type_attraction");
  });

  it("backfills existing primary categories without dropping the compatibility column", () => {
    expect(migration).toMatch(/INSERT INTO public\.attraction_type_assignments[\s\S]+FROM public\.attractions/i);
    expect(migration).toMatch(/attraction\.attraction_type_id IS NOT NULL/i);
    expect(migration).not.toMatch(/DROP COLUMN\s+attraction_type_id/i);
  });

  it("atomically validates and synchronizes at most four active categories", () => {
    expect(migration).toMatch(/FUNCTION public\.sync_attraction_types/i);
    expect(migration).toContain("ATTRACTION_CATEGORY_LIMIT_EXCEEDED");
    expect(migration).toContain("ATTRACTION_PRIMARY_CATEGORY_REQUIRED");
    expect(migration).toContain("ATTRACTION_PRIMARY_CATEGORY_INVALID");
    expect(migration).toContain("ATTRACTION_CATEGORY_INVALID");
    expect(migration).toMatch(/DELETE FROM public\.attraction_type_assignments/i);
    expect(migration).toMatch(/INSERT INTO public\.attraction_type_assignments/i);
    expect(migration).toMatch(/UPDATE public\.attractions[\s\S]+attraction_type_id = p_primary_attraction_type_id/i);
  });

  it("keeps direct compatibility-column updates mirrored", () => {
    expect(migration).toMatch(/FUNCTION public\.mirror_primary_attraction_type/i);
    expect(migration).toMatch(/AFTER INSERT OR UPDATE OF attraction_type_id ON public\.attractions/i);
  });

  it("protects writes and permits reads only for public attractions", () => {
    expect(migration).toMatch(/ENABLE ROW LEVEL SECURITY/i);
    expect(migration).toMatch(/public\.is_public_attraction\(attraction_id\)/i);
    expect(migration).toMatch(/REVOKE ALL ON FUNCTION public\.sync_attraction_types[^;]+FROM PUBLIC, anon, authenticated/i);
    expect(migration).toMatch(/GRANT EXECUTE ON FUNCTION public\.sync_attraction_types[^;]+TO service_role/i);
  });
});
