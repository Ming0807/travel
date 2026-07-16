import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migrationPath = resolve(
  process.cwd(),
  "supabase/migrations/20260717000000_add_story_editorial_platform.sql"
);
const migration = readFileSync(migrationPath, "utf8");
const seed = readFileSync(resolve(process.cwd(), "supabase/seed.sql"), "utf8");
const guards = readFileSync(resolve(process.cwd(), "lib/auth/guards.ts"), "utf8");

describe("story editorial platform migration", () => {
  it("extends travel stories without replacing the existing table or public URL identity", () => {
    expect(migration).toContain("ALTER TABLE public.travel_stories");
    expect(migration).not.toMatch(/DROP TABLE\s+(?:public\.)?travel_stories/i);
    expect(migration).toMatch(/content_document\s+jsonb/i);
    expect(migration).toMatch(/content_schema_version\s+integer/i);
    expect(migration).toMatch(/primary_language\s+varchar/i);
    expect(migration).toMatch(/seo_title\s+varchar/i);
    expect(migration).toMatch(/seo_description\s+varchar/i);
    expect(migration).toMatch(/scheduled_at\s+timestamptz/i);
    expect(migration).toMatch(/first_published_at\s+timestamptz/i);
    expect(migration).toMatch(/archived_at\s+timestamptz/i);
    expect(migration).toMatch(/reading_minutes\s+integer/i);
    expect(migration).toMatch(/content_quality_score\s+integer/i);
  });

  it("migrates legacy statuses and enforces the editorial and UGC state sets", () => {
    const legacyConstraintDrop = migration.indexOf("DROP CONSTRAINT IF EXISTS travel_stories_status_check");
    const firstNewStatusWrite = migration.indexOf("SET status = 'submitted'");

    expect(legacyConstraintDrop).toBeGreaterThan(-1);
    expect(firstNewStatusWrite).toBeGreaterThan(-1);
    expect(legacyConstraintDrop).toBeLessThan(firstNewStatusWrite);
    expect(migration).toMatch(/author_type\s*=\s*'tourist'.+status\s+in\s*\('draft',\s*'pending'\)/is);
    expect(migration).toContain("'in_review'");
    expect(migration).toContain("'changes_requested'");
    expect(migration).toContain("'scheduled'");
    expect(migration).toContain("'archived'");
    expect(migration).toMatch(/CHECK\s*\(status\s+IN/is);
    expect(migration).toContain("travel_stories_author_workflow_check");
    expect(migration).toMatch(/author_type\s*=\s*'admin'[\s\S]+status\s+IN\s*\([\s\S]+scheduled/is);
    expect(migration).toMatch(/author_type\s*=\s*'tourist'[\s\S]+status\s+IN\s*\([\s\S]+changes_requested/is);
  });

  it("keeps status and legacy is_published synchronized in the database", () => {
    expect(migration).toMatch(/FUNCTION public\.sync_travel_story_publication_state/i);
    expect(migration).toMatch(/BEFORE INSERT OR UPDATE OF status, is_published, scheduled_at/i);
    expect(migration).toMatch(/NEW\.is_published\s*:=\s*\(NEW\.status\s*=\s*'published'\)/i);
    expect(migration).toMatch(/NEW\.first_published_at\s*:=/i);
    expect(migration).toMatch(/NEW\.status\s*=\s*'pending'[\s\S]+NEW\.author_type\s*=\s*'tourist'[\s\S]+NEW\.status\s*:=\s*'submitted'/i);
  });

  it("creates normalized taxonomy, revision, moderation, and curated recommendation tables", () => {
    for (const table of [
      "story_topics",
      "story_tags",
      "story_topic_links",
      "story_tag_links",
      "story_revisions",
      "story_review_events",
      "story_recommendations",
    ]) {
      expect(migration).toContain(`CREATE TABLE public.${table}`);
      expect(migration).toContain(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY`);
    }
    expect(migration).toMatch(/UNIQUE\s*\(story_id,\s*revision_number\)/i);
    expect(migration).toMatch(/UNIQUE\s*\(source_story_id,\s*target_story_id\)/i);
    expect(migration).toMatch(/CHECK\s*\(source_story_id\s*<>\s*target_story_id\)/i);
    for (const topicKey of ["nature", "culture", "food", "community", "travel-guide"]) {
      expect(migration).toContain(`'${topicKey}'`);
      expect(seed).toContain(`'${topicKey}'`);
    }
    expect(migration).toMatch(/INSERT INTO public\.story_topic_links[\s\S]+ON CONFLICT/is);
  });

  it("exposes only active taxonomy and published recommendation relationships publicly", () => {
    expect(migration).toMatch(/Public can read active story topics[\s\S]+is_active\s*=\s*true/i);
    expect(migration).toMatch(/Public can read active story tags[\s\S]+is_active\s*=\s*true/i);
    expect(migration).toMatch(
      /Public can read published story recommendations[\s\S]+source_story[\s\S]+target_story[\s\S]+status\s*=\s*'published'/i
    );
    expect(migration).not.toMatch(/Public can read story revisions/i);
    expect(migration).not.toMatch(/Public can read story review events/i);
  });

  it("adds indexes for workflow, scheduling, taxonomy, revisions, and recommendation queries", () => {
    for (const index of [
      "idx_travel_stories_workflow",
      "idx_travel_stories_scheduled",
      "idx_travel_stories_public_feed",
      "idx_story_topic_links_topic",
      "idx_story_tag_links_tag",
      "idx_story_revisions_story_created",
      "idx_story_recommendations_source_order",
    ]) {
      expect(migration).toContain(index);
    }
  });

  it("seeds and types the full editorial permission set without granting it to viewers", () => {
    const permissionKeys = [
      "story.review",
      "story.schedule",
      "story.revision_read",
      "story.revision_restore",
      "story.taxonomy_manage",
      "story.recommend_manage",
    ];

    for (const permissionKey of permissionKeys) {
      expect(migration).toContain(`'${permissionKey}'`);
      expect(seed).toContain(`'${permissionKey}'`);
      expect(guards).toContain(`"${permissionKey}"`);
    }
    expect(migration).toContain("WHERE r.role_name IN ('super_admin', 'admin')");
  });
});
