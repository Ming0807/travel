import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("public story search migration", () => {
  const sql = readFileSync(
    join(
      process.cwd(),
      "supabase/migrations/20260730000000_harden_public_story_search.sql"
    ),
    "utf8"
  );

  it("adds partial trigram and deterministic feed indexes", () => {
    expect(sql).toContain("gin_trgm_ops");
    expect(sql).toContain("published_at DESC, story_id DESC");
    expect(sql).toContain(
      "WHERE status = 'published' AND is_published = true"
    );
  });

  it("removes the legacy OR publication policy", () => {
    expect(sql).toContain(
      "USING (status = 'published' AND is_published = true)"
    );
    expect(sql).not.toContain("status = 'published' OR is_published = true");
  });
});
