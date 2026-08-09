import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migrationPath = resolve(
  process.cwd(),
  "supabase/migrations/20260808002000_add_attraction_improvement_workflow.sql",
);

describe("attraction improvement workflow migration", () => {
  const sql = readFileSync(migrationPath, "utf8");

  it("creates the permanent issue, action, and append-only history tables", () => {
    expect(sql).toContain("CREATE TABLE public.attraction_feedback_issues");
    expect(sql).toContain("CREATE TABLE public.attraction_improvement_actions");
    expect(sql).toContain("CREATE TABLE public.attraction_improvement_action_history");
    expect(sql).toContain("REFERENCES public.attractions(attraction_id) ON DELETE RESTRICT");
    expect(sql).toContain("REFERENCES public.attraction_feedback_issues(feedback_issue_id) ON DELETE RESTRICT");
    expect(sql).toContain("ON DELETE RESTRICT");
    expect(sql).toContain("CREATE TRIGGER attraction_improvement_action_history_append_only");
  });

  it("enforces bounded states, dates, scores, recurrence, and follow-up evidence", () => {
    expect(sql).toContain("status IN ('open', 'dismissed', 'closed')");
    expect(sql.replace(/\s+/g, " ")).toMatch(/status IN \(\s*'planned', 'in_progress', 'completed', 'verified', 'cancelled'\s*\)/);
    expect(sql).toContain("response_count >= 30");
    expect(sql).toContain("structured_recurrence_count >= 3");
    expect(sql).toContain("rule_version varchar(50) NOT NULL");
    expect(sql).toContain("response_count <= visit_count");
    expect(sql).toContain("response_coverage numeric(5,4) NOT NULL");
    expect(sql).toContain("current_score numeric(3,2) NOT NULL");
    expect(sql).toContain("current_score >= 1 AND current_score <= 5");
    expect(sql).toContain("baseline_end >= baseline_start");
    expect(sql).toContain("follow_up_end >= follow_up_start");
    expect(sql).toContain("dismissed' OR length(trim(coalesce(review_note, ''))) > 0");
    expect(sql).toContain("status <> 'verified'");
    expect(sql).toContain("completion_evidence_note");
    expect(sql).toContain("ATTRACTION_FEEDBACK_VERIFIED_ACTION_REQUIRED");
  });

  it("denies direct client access and exposes transition functions only to service_role", () => {
    expect(sql).toContain("ALTER TABLE public.attraction_feedback_issues ENABLE ROW LEVEL SECURITY");
    expect(sql).toContain("ALTER TABLE public.attraction_improvement_actions ENABLE ROW LEVEL SECURITY");
    expect(sql).toContain("ALTER TABLE public.attraction_improvement_action_history ENABLE ROW LEVEL SECURITY");
    expect(sql).toContain("REVOKE ALL ON TABLE public.attraction_feedback_issues FROM PUBLIC, anon, authenticated");
    expect(sql).toContain("REVOKE ALL ON TABLE public.attraction_improvement_actions FROM PUBLIC, anon, authenticated");
    expect(sql).toContain("REVOKE ALL ON TABLE public.attraction_improvement_action_history FROM PUBLIC, anon, authenticated");
    expect(sql).toContain("REVOKE ALL ON FUNCTION public.transition_attraction_feedback_issue");
    expect(sql).toContain("REVOKE ALL ON FUNCTION public.transition_attraction_improvement_action");
    expect(sql).toContain("GRANT EXECUTE ON FUNCTION public.transition_attraction_feedback_issue");
    expect(sql).toContain("GRANT EXECUTE ON FUNCTION public.transition_attraction_improvement_action");
  });

  it("adds the six permissions to admin and only aggregate feedback read to viewer", () => {
    for (const permission of [
      "attraction_feedback.read",
      "attraction_feedback.evidence_read",
      "attraction_feedback.issue_review",
      "attraction_improvement.manage",
      "attraction_improvement.verify",
      "export.attraction_improvements",
    ]) {
      expect(sql).toContain(`'${permission}'`);
    }

    expect(sql).toContain("WHERE role_name IN ('super_admin', 'admin')");
    expect(sql).toContain("WHERE role_name = 'viewer'");
    expect(sql).not.toContain("role_name IN ('province_admin', 'attraction_manager')");
  });
});
