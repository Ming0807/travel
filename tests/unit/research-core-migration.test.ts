import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migrationPath = resolve(
  process.cwd(),
  "supabase/migrations/20260808000000_add_research_core.sql",
);
const guardsPath = resolve(process.cwd(), "lib/auth/guards.ts");

function loadMigration() {
  return readFileSync(migrationPath, "utf8");
}

describe("Phase 18 research core migration", () => {
  it("creates the versioned research contract without seeding a live study", () => {
    const sql = loadMigration();

    for (const table of [
      "research_studies",
      "research_instruments",
      "research_items",
      "research_sessions",
      "research_consents",
      "research_responses",
      "research_answers",
      "research_operator_tasks",
      "research_operator_task_attempts",
      "research_checkin_codes",
    ]) {
      expect(sql).toMatch(new RegExp(`create table public\\.${table}`, "i"));
    }

    expect(sql).not.toMatch(/insert\s+into\s+public\.research_studies/i);
    expect(sql).toContain("field_observation");
    expect(sql).toContain("simulated_usability");
    expect(sql).toContain("pilot_internal");
  });

  it("uses a separate consent and opaque participant/session identity boundary", () => {
    const sql = loadMigration();

    expect(sql).toMatch(/participant_code\s+uuid[^,]+unique/i);
    expect(sql).toMatch(/public_session_code\s+uuid[^,]+unique/i);
    expect(sql).toMatch(/access_token_hash\s+text[^,]+unique/i);
    expect(sql).toContain("operational_session_hash");
    expect(sql).toMatch(/research_consents[\s\S]+consent_version/i);
    expect(sql).toMatch(/research_consents[\s\S]+notice_version/i);
    expect(sql).toMatch(/research_consents[\s\S]+withdrawn_at/i);
    expect(sql).not.toMatch(/research_consents[\s\S]+provider_user_id/i);
    expect(sql).not.toMatch(/research_consents[\s\S]+display_name/i);
    for (const field of [
      "purpose_th",
      "participation_th",
      "privacy_th",
      "withdrawal_th",
      "contact_email",
    ]) {
      expect(sql).toContain(field);
    }
  });

  it("enforces immutable published versions and one response per session and instrument", () => {
    const sql = loadMigration();

    expect(sql).toMatch(/unique\s*\(study_id,\s*instrument_key,\s*version_number\)/i);
    expect(sql).toMatch(/unique\s*\(research_session_id,\s*instrument_id\)/i);
    expect(sql).toMatch(/unique\s*\(response_id,\s*item_id\)/i);
    expect(sql).toMatch(/function public\.prevent_published_research_instrument_mutation/i);
    expect(sql).toMatch(/function public\.prevent_published_research_item_mutation/i);
    expect(sql).toMatch(/function public\.prevent_frozen_research_study_mutation/i);
    expect(sql).toMatch(/function public\.prevent_published_research_task_mutation/i);
    expect(sql).toMatch(/function public\.validate_research_answer_type/i);
    expect(sql).toMatch(/before update or delete on public\.research_studies/i);
    expect(sql).toMatch(/before update or delete on public\.research_instruments/i);
    expect(sql).toMatch(/before insert or update or delete on public\.research_items/i);
    expect(sql).toMatch(/before update or delete on public\.research_operator_tasks/i);
  });

  it("activates only a complete frozen protocol", () => {
    const sql = loadMigration();

    expect(sql).toMatch(/RESEARCH_STUDY_TOURIST_INSTRUMENT_REQUIRED/i);
    expect(sql).toMatch(/RESEARCH_STUDY_DEPLOYMENT_REQUIRED/i);
    expect(sql).toMatch(/RESEARCH_STUDY_DRAFT_CONFIGURATION_EXISTS/i);
    expect(sql).toMatch(/RESEARCH_STUDY_APPROVAL_REQUIRED/i);
    expect(sql).toMatch(/advisor_approved_at\s+is null/i);
    expect(sql).toMatch(/ethics_review_status\s+not in\s*\(\s*'not_required',\s*'approved'\s*\)/i);
    expect(sql).toMatch(/nullif\(btrim\(new\.approval_reference\),\s*''\)\s+is null/i);
  });

  it("prevents adding protocol configuration after study freeze", () => {
    const sql = loadMigration();

    expect(sql).toMatch(/prevent_frozen_research_instrument_insert/i);
    expect(sql).toMatch(/prevent_frozen_research_task_insert/i);
    expect(sql).toMatch(/prevent_frozen_research_deployment_mutation/i);
    expect(sql).toMatch(/FROZEN_RESEARCH_CONFIGURATION_IMMUTABLE/i);
  });

  it("adds typed research-session funnel correlation and common query indexes", () => {
    const sql = loadMigration();

    expect(sql).toMatch(
      /alter table public\.funnel_events[\s\S]+research_session_id uuid[\s\S]+references public\.research_sessions/i,
    );

    for (const index of [
      "idx_research_sessions_study_mode_status",
      "idx_research_sessions_visit",
      "idx_research_responses_instrument_status",
      "idx_research_operator_attempts_session",
      "idx_funnel_events_research_session_time",
    ]) {
      expect(sql).toContain(index);
    }

    expect(sql).toContain("uq_research_checkin_codes_one_active_study");
    expect(sql).toMatch(/function public\.correlate_research_funnel_event\s*\(/i);
    expect(sql).toMatch(
      /before insert on public\.funnel_events[\s\S]+correlate_research_funnel_event/i,
    );
    expect(sql).toMatch(/session\.consented_at\s*<=\s*new\.event_time/i);
  });

  it("keeps every research table deny-by-default and service-role only", () => {
    const sql = loadMigration();

    for (const table of [
      "research_studies",
      "research_instruments",
      "research_items",
      "research_sessions",
      "research_consents",
      "research_responses",
      "research_answers",
      "research_operator_tasks",
      "research_operator_task_attempts",
      "research_checkin_codes",
    ]) {
      expect(sql).toMatch(
        new RegExp(`alter table public\\.${table} enable row level security`, "i"),
      );
    }

    expect(sql).toMatch(/revoke all on[\s\S]+from public, anon, authenticated/i);
    expect(sql).toMatch(/grant select, insert, update, delete[\s\S]+to service_role/i);
    expect(sql).not.toMatch(/grant\s+(?:select|insert|update|delete)[\s\S]+to\s+(?:anon|authenticated)/i);
  });

  it("adds explicit research permissions and a least-privilege researcher role", () => {
    const sql = loadMigration();
    const guards = readFileSync(guardsPath, "utf8");

    for (const permission of ["research.read", "research.manage", "research.export"]) {
      expect(sql).toContain(`'${permission}'`);
      expect(guards).toContain(`"${permission}"`);
    }

    expect(sql).toContain("'researcher'");
    expect(sql).toMatch(
      /permission_name\s+in\s*\(\s*'research\.read',\s*'research\.export'\s*\)[\s\S]+role_name\s*=\s*'researcher'/i,
    );
    expect(sql).toMatch(
      /permission_name\s+like\s+'research\.%'[\s\S]+role_name\s*=\s*'super_admin'/i,
    );
    expect(sql).not.toMatch(/role_name\s*=\s*'viewer'[\s\S]+research\./i);
  });
});
