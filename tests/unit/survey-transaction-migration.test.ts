import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(process.cwd(), "supabase/migrations/20260713000000_atomic_survey_submission.sql"),
  "utf8"
);
const hardeningMigration = readFileSync(
  resolve(process.cwd(), "supabase/migrations/20260808001000_harden_research_data_quality.sql"),
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

  it("replaces the RPC with facility and nullable survey-version arguments", () => {
    expect(hardeningMigration).toMatch(
      /create or replace function public\.submit_post_certificate_survey\([\s\S]+p_facility_score\s+integer[\s\S]+p_survey_instrument_version\s+varchar\(50\)\s+default\s+null/i,
    );
    expect(hardeningMigration).toMatch(
      /insert into public\.satisfaction_surveys\s*\([\s\S]+facility_score[\s\S]+survey_instrument_version/i,
    );
    expect(hardeningMigration).toMatch(/p_facility_score/);
    expect(hardeningMigration).toMatch(/p_survey_instrument_version/);
    expect(hardeningMigration).toMatch(/survey_instrument_version\s+varchar\(50\)/i);
    expect(hardeningMigration).toMatch(/btrim\(survey_instrument_version\)\s*<>\s*''[\s\S]+length\(survey_instrument_version\)\s*<=\s*50/i);
    expect(hardeningMigration).toMatch(/grant execute on function[^;]+varchar\s*\)\s+to service_role/i);
  });

  it("keeps preferred-language provenance controlled and nullable", () => {
    expect(hardeningMigration).toMatch(/preferred_language_source/);
    expect(hardeningMigration).toMatch(/check\s*\([^)]*preferred_language_source[^)]*detected[^)]*selected/i);
    expect(hardeningMigration).toMatch(/alter column preferred_language type varchar\(10\)[\s\S]+drop not null/i);
  });
});
