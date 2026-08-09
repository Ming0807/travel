import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const sql = readFileSync(
  resolve(process.cwd(), "supabase/migrations/20260808000000_add_research_core.sql"),
  "utf8",
);

describe("research response transaction contract", () => {
  it("exposes one server-only atomic response function", () => {
    expect(sql).toMatch(/function public\.save_research_response\s*\(/i);
    expect(sql).toMatch(
      /save_research_response[\s\S]+insert into public\.research_responses[\s\S]+insert into public\.research_answers/i,
    );
    expect(sql).toMatch(
      /revoke all on function public\.save_research_response[\s\S]+from public, anon, authenticated/i,
    );
    expect(sql).toMatch(
      /grant execute on function public\.save_research_response[\s\S]+to service_role/i,
    );
  });

  it("authenticates the session and accepts only its published frozen instrument", () => {
    expect(sql).toMatch(/session\.access_token_hash\s*=\s*p_access_token_hash/i);
    expect(sql).toMatch(/instrument\.status\s*=\s*'published'/i);
    expect(sql).toMatch(/instrument\.frozen_at\s+is not null/i);
    expect(sql).toMatch(/instrument\.audience\s*=\s*session\.participant_type/i);
    expect(sql).toMatch(/when session\.participant_type\s*=\s*'tourist'\s+then\s+'research_evaluation'/i);
    expect(sql).toMatch(/else\s+'operator_evaluation'/i);
    expect(sql).toMatch(/consent\.withdrawn_at\s+is null/i);
    expect(sql).toMatch(/study\.status\s+in\s*\(\s*'active',\s*'paused',\s*'closed'\s*\)/i);
    expect(sql).toMatch(
      /session\.participant_type\s*<>\s*'tourist'[\s\S]+session\.visit_id\s+is not null/i,
    );
  });

  it("completes stakeholder sessions only after published tasks and evaluation are complete", () => {
    expect(sql).toMatch(/function public\.accept_research_operator_invitation/i);
    expect(sql).toMatch(/function public\.save_research_operator_attempt/i);
    expect(sql).toMatch(/research_operator_task_attempts[\s\S]+attempt\.status\s+in\s*\(\s*'completed',\s*'skipped'\s*\)/i);
    expect(sql).toMatch(
      /save_research_operator_attempt[\s\S]+research_instruments[\s\S]+research_responses[\s\S]+status\s*=\s*'completed'/i,
    );
  });

  it("validates a full answer snapshot and rejects duplicate or unknown items", () => {
    expect(sql).toMatch(/jsonb_typeof\(p_answers\)\s*<>\s*'array'/i);
    expect(sql).toMatch(/RESEARCH_ANSWER_DUPLICATE/i);
    expect(sql).toMatch(/RESEARCH_ANSWER_ITEM_INVALID/i);
    expect(sql).toMatch(/delete from public\.research_answers[\s\S]+where response_id\s*=\s*v_response_id/i);
    expect(sql).toMatch(/trunc\(\(answer\.value->>'integer_value'\)::numeric\)/i);
  });

  it("keeps completed, skipped, and abandoned operator attempts immutable", () => {
    expect(sql).toMatch(/v_existing_attempt_status\s+in\s*\(\s*'completed',\s*'skipped',\s*'abandoned'\s*\)/i);
    expect(sql).toMatch(/RESEARCH_OPERATOR_ATTEMPT_FINALIZED/i);
  });

  it("requires all required items before submission and makes submitted responses immutable", () => {
    expect(sql).toMatch(/item\.is_required\s*=\s*true/i);
    expect(sql).toMatch(/RESEARCH_REQUIRED_ANSWER_MISSING/i);
    expect(sql).toMatch(/RESEARCH_RESPONSE_ALREADY_SUBMITTED/i);
    expect(sql).toMatch(/prevent_final_research_response_mutation/i);
  });

  it("completes the session only after all published audience instruments are submitted", () => {
    expect(sql).toMatch(
      /not exists\s*\([\s\S]+from public\.research_instruments[\s\S]+not exists\s*\([\s\S]+from public\.research_responses/i,
    );
    expect(sql).toMatch(/status\s*=\s*'completed'/i);
    expect(sql).toMatch(/inclusion_status\s*=\s*'included'/i);
  });
});
