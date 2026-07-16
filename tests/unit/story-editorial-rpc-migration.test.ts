import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(process.cwd(), "supabase/migrations/20260717010000_add_story_editorial_change_rpc.sql"),
  "utf8"
);

describe("atomic story editorial change RPC", () => {
  it("locks the story and rejects stale editor versions", () => {
    expect(migration).toMatch(/FUNCTION public\.apply_story_editorial_change/i);
    expect(migration).toMatch(/FROM public\.travel_stories[\s\S]+FOR UPDATE/i);
    expect(migration).toMatch(/COALESCE\(v_current\.updated_at,\s*v_current\.created_at\)\s+IS DISTINCT FROM p_expected_updated_at/i);
    expect(migration).toContain("EDIT_CONFLICT");
    expect(migration).toContain("STORY_NOT_FOUND");
  });

  it("updates explicit story fields without dynamic SQL", () => {
    expect(migration).toMatch(/UPDATE public\.travel_stories[\s\S]+title\s*=\s*p_title/i);
    expect(migration).toMatch(/content_document\s*=\s*p_content_document/i);
    expect(migration).toMatch(/status\s*=\s*p_status/i);
    expect(migration).toMatch(/scheduled_at\s*=\s*CASE[\s\S]+p_status\s*=\s*'scheduled'/i);
    expect(migration).not.toMatch(/EXECUTE\s+format/i);
  });

  it("replaces taxonomy, writes a canonical revision, and records workflow changes in the same function", () => {
    expect(migration).toMatch(/DELETE FROM public\.story_topic_links/i);
    expect(migration).toMatch(/INSERT INTO public\.story_topic_links/i);
    expect(migration).toMatch(/INSERT INTO public\.story_revisions/i);
    expect(migration).toMatch(/jsonb_build_object\([\s\S]+contentDocument/is);
    expect(migration).toMatch(/INSERT INTO public\.story_review_events/i);
    expect(migration).toMatch(/v_current\.status IS DISTINCT FROM v_updated\.status/i);
  });

  it("serializes revision numbers and returns the committed version", () => {
    expect(migration).toMatch(/COALESCE\(MAX\(revision_number\),\s*0\)\s*\+\s*1/i);
    expect(migration).toContain("revision_number");
    expect(migration).toContain("updated_at");
  });

  it("returns stable error codes from an exception block so partial writes roll back", () => {
    expect(migration).toMatch(/EXCEPTION[\s\S]+WHEN unique_violation[\s\S]+DUPLICATE_SLUG/i);
    expect(migration).toMatch(/WHEN foreign_key_violation[\s\S]+INVALID_REFERENCE/i);
    expect(migration).toMatch(/WHEN check_violation[\s\S]+INVALID_EDITORIAL_DATA/i);
    expect(migration).toMatch(/WHEN OTHERS[\s\S]+EDITORIAL_CHANGE_FAILED/i);
  });

  it("allows execution only through the server-side service role", () => {
    expect(migration).toMatch(/REVOKE ALL ON FUNCTION public\.apply_story_editorial_change[\s\S]+FROM PUBLIC, anon, authenticated/i);
    expect(migration).toMatch(/GRANT EXECUTE ON FUNCTION public\.apply_story_editorial_change[\s\S]+TO service_role/i);
  });
});
