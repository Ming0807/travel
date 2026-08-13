import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(
    process.cwd(),
    "supabase/migrations/20260813002000_add_attraction_related_content_settings.sql",
  ),
  "utf8",
);

const compact = migration.replace(/\s+/g, " ");

describe("attraction related-content migration", () => {
  it("creates explicit per-attraction settings with bounded modes and limits", () => {
    expect(migration).toContain("CREATE TABLE public.attraction_related_content_settings");
    expect(migration).toContain("PRIMARY KEY (attraction_id, content_type)");
    expect(compact).toContain(
      "content_type IN ('attractions', 'restaurants', 'accommodations', 'stories')",
    );
    expect(compact).toContain("mode IN ('automatic', 'manual', 'hybrid', 'hidden')");
    expect(compact).toContain("max_items BETWEEN 1 AND 8");
    expect(migration).toContain("created_at timestamptz NOT NULL DEFAULT now()");
    expect(migration).toContain("updated_at timestamptz NOT NULL DEFAULT now()");
  });

  it("backfills all four content types without deleting legacy relations", () => {
    expect(migration).toContain("CROSS JOIN (");
    expect(migration).toContain("FROM public.attractions attraction");
    expect(migration).toContain("ON CONFLICT (attraction_id, content_type) DO NOTHING");
    expect(migration).toContain("attraction_related_attractions relation");
    expect(migration).toContain("attraction_related_restaurants relation");
    expect(migration).toContain("attraction_related_accommodations relation");
    expect(migration).toContain("attraction_related_stories relation");
    expect(migration).not.toMatch(/DELETE\s+FROM\s+public\.attraction_related_/i);
  });

  it("uses live-destination RLS and leaves mutations to the server boundary", () => {
    expect(migration).toContain(
      "ALTER TABLE public.attraction_related_content_settings ENABLE ROW LEVEL SECURITY",
    );
    expect(migration).toContain("public.is_public_attraction(attraction_id)");
    expect(migration).toContain(
      "REVOKE ALL ON TABLE public.attraction_related_content_settings FROM PUBLIC, anon, authenticated",
    );
    expect(migration).toContain("GRANT SELECT ON TABLE public.attraction_related_content_settings TO anon, authenticated");
    expect(migration).not.toMatch(/CREATE POLICY[\s\S]+FOR (INSERT|UPDATE|DELETE)/i);
  });

  it("adds reverse indexes and non-destructive self-link protection", () => {
    for (const indexName of [
      "idx_ara_related_attraction_id",
      "idx_arr_restaurant_id",
      "idx_arac_accommodation_id",
      "idx_ars_story_id",
    ]) {
      expect(migration).toContain(indexName);
    }

    expect(compact).toContain("CHECK (attraction_id <> related_attraction_id) NOT VALID");
    expect(migration).toContain("does not delete content or relation rows");
  });

  it("adds a versioned RPC that validates, deduplicates, orders, and commits settings with relations", () => {
    expect(migration).toContain("FUNCTION public.sync_attraction_related_content_v2");
    expect(migration).toContain("SECURITY DEFINER");
    expect(migration).toContain("SET search_path = pg_catalog, public");
    expect(migration).toContain("GROUP BY item.id");
    expect(migration).toContain("min(item.ordinality) AS first_position");
    expect(migration).toContain("An attraction cannot relate to itself");
    expect(migration).toContain("Related attraction does not exist");
    expect(migration).toContain("Related restaurant does not exist");
    expect(migration).toContain("Related accommodation does not exist");
    expect(migration).toContain("Related story does not exist");
    expect(migration).toContain("display_order");
    expect(migration).toContain("ON CONFLICT (attraction_id, content_type) DO UPDATE");
    expect(migration).toContain("Hidden controls public");
    expect(migration).not.toContain("IF p_mode <> 'hidden'");
    expect(migration).not.toMatch(/EXCEPTION\s+WHEN\s+OTHERS/i);
    expect(migration).toMatch(/REVOKE ALL ON FUNCTION public\.sync_attraction_related_content_v2[\s\S]+FROM PUBLIC, anon, authenticated/i);
    expect(migration).toMatch(/GRANT EXECUTE ON FUNCTION public\.sync_attraction_related_content_v2[\s\S]+TO service_role/i);
    expect(migration).not.toContain("CREATE OR REPLACE FUNCTION public.sync_attraction_related_content(");
  });
});
