import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const sql = readFileSync(
  resolve(process.cwd(), "supabase/migrations/20260808000000_add_research_core.sql"),
  "utf8",
);

describe("research consent and session transaction contract", () => {
  it("creates a session and separate research consent in one server-only function", () => {
    expect(sql).toMatch(/function public\.accept_research_invitation\s*\(/i);
    expect(sql).toMatch(
      /accept_research_invitation[\s\S]+insert into public\.research_sessions[\s\S]+insert into public\.research_consents/i,
    );
    expect(sql).toContain("'research_evaluation'");
    expect(sql).toContain("'research_behavioral_correlation'");
    expect(sql).toMatch(
      /revoke all on function public\.accept_research_invitation[\s\S]+from public, anon, authenticated/i,
    );
    expect(sql).toMatch(
      /grant execute on function public\.accept_research_invitation[\s\S]+to service_role/i,
    );
  });

  it("accepts only a frozen active study and an active study-linked check-in deployment", () => {
    expect(sql).toMatch(/study\.status\s*=\s*'active'/i);
    expect(sql).toMatch(/study\.frozen_at\s+is not null/i);
    expect(sql).toMatch(/deployment\.is_active\s*=\s*true/i);
    expect(sql).toMatch(/code\.is_active\s*=\s*true/i);
    expect(sql).toMatch(/study\.starts_at\s+is null[\s\S]+study\.starts_at\s*<=\s*now\(\)/i);
    expect(sql).toMatch(/study\.ends_at\s+is null[\s\S]+study\.ends_at\s*>\s*now\(\)/i);
  });

  it("is idempotent for one study and operational check-in session", () => {
    expect(sql).toContain("uq_research_sessions_study_operational_session");
    expect(sql).toMatch(
      /where study_id\s*=\s*v_study_id[\s\S]+operational_session_hash\s*=\s*p_operational_session_hash[\s\S]+for update/i,
    );
    expect(sql).toMatch(/'already_exists',\s*true/i);
  });

  it("uses a facilitator idempotency key for stakeholder invitation retries", () => {
    expect(sql).toMatch(/facilitator_invitation_key\s+uuid\s+unique/i);
    expect(sql).toMatch(/accept_research_operator_invitation[\s\S]+p_idempotency_key\s+uuid/i);
    expect(sql).toMatch(/on conflict\s*\(facilitator_invitation_key\)\s*do update/i);
    expect(sql).toMatch(/operator_evaluation[\s\S]+on conflict\s*\(research_session_id,\s*purpose_key\)\s*do nothing/i);
  });

  it("links a consented session to a matching owned visit without reclassifying earlier events", () => {
    expect(sql).toMatch(/function public\.link_research_session_visit\s*\(/i);
    expect(sql).toMatch(/visit\.tourist_id\s*=\s*p_tourist_id/i);
    expect(sql).toMatch(/visit\.checkin_code_id\s*=\s*session\.checkin_code_id/i);
    expect(sql).not.toMatch(
      /link_research_session_visit[\s\S]+update public\.funnel_events[\s\S]+event_time\s*<\s*session\.consented_at/i,
    );
  });

  it("withdraws consent, excludes the session and responses, and preserves evidence", () => {
    const withdrawalFunction = sql.match(
      /CREATE OR REPLACE FUNCTION public\.withdraw_research_session[\s\S]+?\n\$\$;/i,
    )?.[0];

    expect(withdrawalFunction).toBeDefined();
    expect(sql).toMatch(/function public\.withdraw_research_session\s*\(/i);
    expect(sql).toMatch(
      /withdraw_research_session[\s\S]+status\s*=\s*'withdrawn'[\s\S]+inclusion_status\s*=\s*'excluded'/i,
    );
    expect(sql).toMatch(
      /withdraw_research_session[\s\S]+update public\.research_consents[\s\S]+withdrawn_at/i,
    );
    expect(sql).toMatch(
      /withdraw_research_session[\s\S]+update public\.research_responses[\s\S]+status\s*=\s*'withdrawn'/i,
    );
    expect(withdrawalFunction).not.toMatch(
      /delete from public\.research_(?:sessions|consents|responses|answers)/i,
    );
  });
});
