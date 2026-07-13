import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(process.cwd(), "supabase/migrations/20260713000000_atomic_survey_submission.sql"),
  "utf8"
);
const seed = readFileSync(resolve(process.cwd(), "supabase/seed.sql"), "utf8");

describe("atomic survey migration contract", () => {
  it("deduplicates expenses before enforcing one row per visit", () => {
    expect(migration).toMatch(/row_number\(\)\s+over\s*\(\s*partition by visit_id/i);
    expect(migration).toMatch(/create unique index[^;]+visit_expenses\s*\(\s*visit_id\s*\)/i);
  });

  it("upserts expense and satisfaction data inside one PostgreSQL function", () => {
    expect(migration).toMatch(/function public\.submit_post_certificate_survey/i);
    expect(migration).toMatch(/insert into public\.visit_expenses/i);
    expect(migration).toMatch(/on conflict \(visit_id\) do update/i);
    expect(migration).toMatch(/insert into public\.satisfaction_surveys/i);
    expect(migration).toMatch(/exception\s+when others/i);
  });

  it("limits RPC execution to the service role", () => {
    expect(migration).toMatch(/revoke all on function[^;]+from public, anon, authenticated/i);
    expect(migration).toMatch(/grant execute on function[^;]+to service_role/i);
  });

  it("keeps the first survey completion event when a response is edited", () => {
    expect(migration).toMatch(/uq_funnel_events_survey_completed_visit/i);
    expect(migration).toMatch(
      /on conflict \(visit_id\)[\s\S]+event_type = 'survey_completed'[\s\S]+do nothing/i
    );
  });

  it("keeps seed data compatible with one expense row per visit", () => {
    expect(seed).toMatch(/select distinct on \(visit_id\)[\s\S]+from expense_seed/i);
    expect(seed).toMatch(/on conflict \(visit_id\) do update/i);
  });
});
