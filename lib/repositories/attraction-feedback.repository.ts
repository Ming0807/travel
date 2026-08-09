import "server-only";

import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import type { EvidenceSnapshot } from "@/lib/validation/attraction-feedback";
import type {
  ActionStatus,
  CandidateMetrics,
  FeedbackScope,
  ImprovementAction,
  IssueStatus,
  RawEvidenceRow,
  FeedbackDimension,
  AttractionFeedbackIssue,
} from "@/lib/services/attraction-feedback.service";

const MAX_AGGREGATE_ROWS = 10_000;
const MAX_EVIDENCE_ROWS = 100;

type Period = {
  start: string;
  end: string;
};

type RawSurveyRow = {
  overall_score: number | null;
  facility_score: number | null;
  cleanliness_score: number | null;
  safety_score: number | null;
  accessibility_score: number | null;
  information_score: number | null;
  value_score: number | null;
  comments?: string | null;
  visits?: { visit_date?: string | null } | Array<{ visit_date?: string | null }> | null;
};

type RawIssueRow = {
  feedback_issue_id: string;
  attraction_id: number;
  issue_dimension: FeedbackDimension;
  issue_category: AttractionFeedbackIssue["issueCategory"];
  rule_version: AttractionFeedbackIssue["ruleVersion"];
  status: IssueStatus;
  baseline_start: string;
  baseline_end: string;
  comparison_start: string | null;
  comparison_end: string | null;
  visit_count: number;
  response_count: number;
  response_coverage: number | null;
  current_score: number | null;
  comparison_score: number | null;
  structured_recurrence_count: number;
  evidence_snapshot: EvidenceSnapshot;
  review_note: string | null;
  reviewed_by: string;
  reviewed_at: string;
  closed_by?: string | null;
  closed_at?: string | null;
  created_at?: string;
  updated_at?: string | null;
};

type RawActionRow = {
  improvement_action_id: string;
  feedback_issue_id: string;
  title: string;
  proposed_action: string;
  owner_admin_id: string;
  priority: ImprovementAction["priority"];
  status: ActionStatus;
  due_date: string;
  follow_up_metric: ImprovementAction["followUpMetric"];
  follow_up_start: string;
  follow_up_end: string;
  completion_note?: string | null;
  completion_evidence_note?: string | null;
  completed_at?: string | null;
  verified_by?: string | null;
  verified_at?: string | null;
  created_by?: string;
  created_at?: string;
  updated_at?: string | null;
};

type RawHistoryRow = {
  history_id: string;
  feedback_issue_id: string | null;
  improvement_action_id: string | null;
  from_status: string | null;
  to_status: string;
  changed_by: string;
  note: string | null;
  created_at: string;
};

export type ImprovementOwner = {
  adminId: string;
  displayName: string;
  email: string;
};

export type ImprovementHistory = {
  historyId: string;
  feedbackIssueId: string | null;
  improvementActionId: string | null;
  fromStatus: string | null;
  toStatus: string;
  changedBy: string;
  note: string | null;
  createdAt: string;
};

function mapIssue(row: RawIssueRow): AttractionFeedbackIssue {
  return {
    feedbackIssueId: row.feedback_issue_id,
    attractionId: row.attraction_id,
    issueDimension: row.issue_dimension,
    issueCategory: row.issue_category,
    ruleVersion: row.rule_version,
    status: row.status,
    baselineStart: row.baseline_start,
    baselineEnd: row.baseline_end,
    comparisonStart: row.comparison_start,
    comparisonEnd: row.comparison_end,
    visitCount: row.visit_count,
    responseCount: row.response_count,
    responseCoverage: row.response_coverage,
    currentScore: row.current_score,
    comparisonScore: row.comparison_score,
    structuredRecurrenceCount: row.structured_recurrence_count,
    evidenceSnapshot: row.evidence_snapshot,
    reviewNote: row.review_note,
    reviewedBy: row.reviewed_by,
    reviewedAt: row.reviewed_at,
    closedBy: row.closed_by,
    closedAt: row.closed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapAction(row: RawActionRow): ImprovementAction {
  return {
    improvementActionId: row.improvement_action_id,
    feedbackIssueId: row.feedback_issue_id,
    title: row.title,
    proposedAction: row.proposed_action,
    ownerAdminId: row.owner_admin_id,
    priority: row.priority,
    status: row.status,
    dueDate: row.due_date,
    followUpMetric: row.follow_up_metric,
    followUpStart: row.follow_up_start,
    followUpEnd: row.follow_up_end,
    completionNote: row.completion_note,
    completionEvidenceNote: row.completion_evidence_note,
    completedAt: row.completed_at,
    verifiedBy: row.verified_by,
    verifiedAt: row.verified_at,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function dimensionColumn(dimension: FeedbackDimension): keyof RawSurveyRow {
  return `${dimension}_score` as keyof RawSurveyRow;
}

function firstVisitDate(row: RawSurveyRow): string | null {
  if (Array.isArray(row.visits)) return row.visits[0]?.visit_date ?? null;
  return row.visits?.visit_date ?? null;
}

async function readSurveyPeriod(attractionId: number, dimension: FeedbackDimension, period: Period) {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("satisfaction_surveys")
    .select(`
      overall_score,
      facility_score,
      cleanliness_score,
      safety_score,
      accessibility_score,
      information_score,
      value_score,
      visits!inner (visit_date)
    `, { count: "exact" })
    .eq("attraction_id", attractionId)
    .gte("visits.visit_date", period.start)
    .lte("visits.visit_date", period.end)
    .limit(MAX_AGGREGATE_ROWS);

  if (error) throw new Error("ATTRACTION_FEEDBACK_METRICS_READ_FAILED");

  const column = dimensionColumn(dimension);
  const scores = ((data ?? []) as RawSurveyRow[])
    .map((row) => row[column])
    .filter((value): value is number => typeof value === "number" && Number.isFinite(value));

  return {
    scores,
    isTruncated: (data ?? []).length >= MAX_AGGREGATE_ROWS,
  };
}

async function readVisitCount(attractionId: number, period: Period): Promise<number> {
  const supabase = createSupabaseServiceRoleClient();
  const { count, error } = await supabase
    .from("visits")
    .select("visit_id", { count: "exact", head: true })
    .eq("attraction_id", attractionId)
    .gte("visit_date", period.start)
    .lte("visit_date", period.end);

  if (error) throw new Error("ATTRACTION_FEEDBACK_VISIT_COUNT_FAILED");
  return count ?? 0;
}

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export async function readCandidateMetrics(
  scope: FeedbackScope,
  issueDimension: FeedbackDimension,
): Promise<CandidateMetrics> {
  const currentPeriod = { start: scope.dateStart, end: scope.dateEnd };
  const comparisonPeriod = scope.comparisonStart && scope.comparisonEnd
    ? { start: scope.comparisonStart, end: scope.comparisonEnd }
    : null;

  const [current, currentVisits, comparison] = await Promise.all([
    readSurveyPeriod(scope.attractionId, issueDimension, currentPeriod),
    readVisitCount(scope.attractionId, currentPeriod),
    comparisonPeriod ? readSurveyPeriod(scope.attractionId, issueDimension, comparisonPeriod) : Promise.resolve(null),
  ]);

  return {
    attractionId: scope.attractionId,
    issueDimension,
    scope,
    sourceTypes: ["satisfaction_surveys", "visits"],
    validResponseCount: current.scores.length,
    visitCount: currentVisits,
    currentScore: average(current.scores),
    comparisonScore: comparison ? average(comparison.scores) : null,
    structuredLowScoreRecurrence: current.scores.filter((score) => score <= 2).length,
    isTruncated: current.isTruncated || Boolean(comparison?.isTruncated),
  };
}

export async function listEvidenceRows(
  scope: FeedbackScope,
  issueDimension: FeedbackDimension,
): Promise<RawEvidenceRow[]> {
  const supabase = createSupabaseServiceRoleClient();
  const column = dimensionColumn(issueDimension);
  const { data: surveys, error: surveyError } = await supabase
    .from("satisfaction_surveys")
    .select(`
      ${column},
      comments,
      visits!inner (visit_date)
    `)
    .eq("attraction_id", scope.attractionId)
    .gte("visits.visit_date", scope.dateStart)
    .lte("visits.visit_date", scope.dateEnd)
    .order("submitted_at", { ascending: false })
    .limit(MAX_EVIDENCE_ROWS);

  if (surveyError) throw new Error("ATTRACTION_FEEDBACK_EVIDENCE_READ_FAILED");

  const { data: reviews, error: reviewError } = await supabase
    .from("reviews")
    .select("rating, comment, created_at")
    .eq("attraction_id", scope.attractionId)
    .eq("is_approved", true)
    .eq("is_published", true)
    .is("deleted_at", null)
    .gte("created_at", `${scope.dateStart}T00:00:00.000Z`)
    .lte("created_at", `${scope.dateEnd}T23:59:59.999Z`)
    .order("created_at", { ascending: false })
    .limit(MAX_EVIDENCE_ROWS);

  if (reviewError) throw new Error("ATTRACTION_FEEDBACK_EVIDENCE_READ_FAILED");

  const surveyRows = ((surveys ?? []) as RawSurveyRow[]).map((row) => ({
    sourceType: "satisfaction_survey" as const,
    score: typeof row[column] === "number" ? row[column] : null,
    occurredAt: firstVisitDate(row),
    comment: row.comments ?? null,
  }));

  const reviewRows = (reviews ?? []).map((row) => ({
    sourceType: "approved_review" as const,
    score: typeof row.rating === "number" ? row.rating : Number(row.rating),
    occurredAt: typeof row.created_at === "string" ? row.created_at : null,
    comment: typeof row.comment === "string" ? row.comment : null,
  }));

  return [...surveyRows, ...reviewRows].filter((row) => row.score !== null);
}

export async function findIssue(issueId: string): Promise<AttractionFeedbackIssue | null> {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("attraction_feedback_issues")
    .select("*")
    .eq("feedback_issue_id", issueId)
    .maybeSingle();
  if (error) throw new Error("ATTRACTION_FEEDBACK_ISSUE_READ_FAILED");
  return data ? mapIssue(data as RawIssueRow) : null;
}

export async function insertIssue(input: Omit<AttractionFeedbackIssue, "feedbackIssueId" | "createdAt" | "updatedAt">) {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("attraction_feedback_issues")
    .insert({
      attraction_id: input.attractionId,
      issue_dimension: input.issueDimension,
      issue_category: input.issueCategory,
      rule_version: input.ruleVersion,
      status: input.status,
      baseline_start: input.baselineStart,
      baseline_end: input.baselineEnd,
      comparison_start: input.comparisonStart,
      comparison_end: input.comparisonEnd,
      visit_count: input.visitCount,
      response_count: input.responseCount,
      response_coverage: input.responseCoverage,
      current_score: input.currentScore,
      comparison_score: input.comparisonScore,
      structured_recurrence_count: input.structuredRecurrenceCount,
      evidence_snapshot: input.evidenceSnapshot,
      review_note: input.reviewNote,
      reviewed_by: input.reviewedBy,
      reviewed_at: input.reviewedAt,
    })
    .select("*")
    .single();
  if (error) throw new Error("ATTRACTION_FEEDBACK_ISSUE_CREATE_FAILED");
  return mapIssue(data as RawIssueRow);
}

export async function transitionIssue(
  issueId: string,
  expectedFromStatus: IssueStatus,
  toStatus: IssueStatus,
  changedBy: string,
  note: string | null,
) {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase.rpc("transition_attraction_feedback_issue", {
    p_issue_id: issueId,
    p_expected_from_status: expectedFromStatus,
    p_to_status: toStatus,
    p_changed_by: changedBy,
    p_note: note,
  });
  if (error) throw new Error("ATTRACTION_FEEDBACK_ISSUE_TRANSITION_FAILED");
  return mapIssue(data as RawIssueRow);
}

export async function insertAction(input: Omit<ImprovementAction, "improvementActionId" | "createdAt" | "updatedAt" | "status">) {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("attraction_improvement_actions")
    .insert({
      feedback_issue_id: input.feedbackIssueId,
      title: input.title,
      proposed_action: input.proposedAction,
      owner_admin_id: input.ownerAdminId,
      priority: input.priority,
      status: "planned",
      due_date: input.dueDate,
      follow_up_metric: input.followUpMetric,
      follow_up_start: input.followUpStart,
      follow_up_end: input.followUpEnd,
      created_by: input.createdBy,
    })
    .select("*")
    .single();
  if (error) throw new Error("ATTRACTION_IMPROVEMENT_ACTION_CREATE_FAILED");
  return mapAction(data as RawActionRow);
}

export async function findAction(actionId: string): Promise<ImprovementAction | null> {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("attraction_improvement_actions")
    .select("*")
    .eq("improvement_action_id", actionId)
    .maybeSingle();
  if (error) throw new Error("ATTRACTION_IMPROVEMENT_ACTION_READ_FAILED");
  return data ? mapAction(data as RawActionRow) : null;
}

export async function transitionAction(
  actionId: string,
  expectedFromStatus: ActionStatus,
  toStatus: ActionStatus,
  changedBy: string,
  note: string | null,
  completionEvidenceNote: string | null,
) {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase.rpc("transition_attraction_improvement_action", {
    p_action_id: actionId,
    p_expected_from_status: expectedFromStatus,
    p_to_status: toStatus,
    p_changed_by: changedBy,
    p_note: note,
    p_completion_evidence_note: completionEvidenceNote,
  });
  if (error) throw new Error("ATTRACTION_IMPROVEMENT_ACTION_TRANSITION_FAILED");
  return mapAction(data as RawActionRow);
}

export async function isActiveAdmin(adminId: string): Promise<boolean> {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("admin_users")
    .select("admin_id")
    .eq("admin_id", adminId)
    .eq("is_active", true)
    .maybeSingle();
  if (error) throw new Error("ATTRACTION_IMPROVEMENT_OWNER_READ_FAILED");
  return Boolean(data);
}

export async function hasVerifiedAction(issueId: string): Promise<boolean> {
  const supabase = createSupabaseServiceRoleClient();
  const { count, error } = await supabase
    .from("attraction_improvement_actions")
    .select("improvement_action_id", { count: "exact", head: true })
    .eq("feedback_issue_id", issueId)
    .eq("status", "verified");
  if (error) throw new Error("ATTRACTION_IMPROVEMENT_VERIFICATION_READ_FAILED");
  return (count ?? 0) > 0;
}

export async function listIssuesForAttraction(
  attractionId: number,
  status?: IssueStatus,
): Promise<AttractionFeedbackIssue[]> {
  const supabase = createSupabaseServiceRoleClient();
  let query = supabase
    .from("attraction_feedback_issues")
    .select("*")
    .eq("attraction_id", attractionId)
    .order("baseline_end", { ascending: false })
    .limit(100);
  if (status) query = query.eq("status", status);
  const { data, error } = await query;
  if (error) throw new Error("ATTRACTION_FEEDBACK_ISSUES_READ_FAILED");
  return ((data ?? []) as RawIssueRow[]).map(mapIssue);
}

export async function listActionsForIssues(issueIds: string[]): Promise<ImprovementAction[]> {
  if (issueIds.length === 0) return [];
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("attraction_improvement_actions")
    .select("*")
    .in("feedback_issue_id", issueIds.slice(0, 100))
    .order("due_date", { ascending: true })
    .limit(200);
  if (error) throw new Error("ATTRACTION_IMPROVEMENT_ACTIONS_READ_FAILED");
  return ((data ?? []) as RawActionRow[]).map(mapAction);
}

export async function listImprovementHistory(
  issueIds: string[],
  actionIds: string[],
): Promise<ImprovementHistory[]> {
  if (issueIds.length === 0 && actionIds.length === 0) return [];
  const supabase = createSupabaseServiceRoleClient();
  const issueQuery = issueIds.length > 0
    ? supabase
      .from("attraction_improvement_action_history")
      .select("history_id, feedback_issue_id, improvement_action_id, from_status, to_status, changed_by, note, created_at")
      .in("feedback_issue_id", issueIds.slice(0, 100))
      .limit(300)
    : Promise.resolve({ data: [], error: null });
  const actionQuery = actionIds.length > 0
    ? supabase
      .from("attraction_improvement_action_history")
      .select("history_id, feedback_issue_id, improvement_action_id, from_status, to_status, changed_by, note, created_at")
      .in("improvement_action_id", actionIds.slice(0, 200))
      .limit(500)
    : Promise.resolve({ data: [], error: null });
  const [issueResult, actionResult] = await Promise.all([issueQuery, actionQuery]);
  if (issueResult.error || actionResult.error) throw new Error("ATTRACTION_IMPROVEMENT_HISTORY_READ_FAILED");
  const rows = [
    ...((issueResult.data ?? []) as RawHistoryRow[]),
    ...((actionResult.data ?? []) as RawHistoryRow[]),
  ].sort((a, b) => b.created_at.localeCompare(a.created_at));
  return rows.map((row) => ({
    historyId: row.history_id,
    feedbackIssueId: row.feedback_issue_id,
    improvementActionId: row.improvement_action_id,
    fromStatus: row.from_status,
    toStatus: row.to_status,
    changedBy: row.changed_by,
    note: row.note,
    createdAt: row.created_at,
  }));
}

export async function listActiveImprovementOwners(): Promise<ImprovementOwner[]> {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("admin_users")
    .select("admin_id, display_name, email")
    .eq("is_active", true)
    .order("display_name", { ascending: true })
    .limit(200);
  if (error) throw new Error("ATTRACTION_IMPROVEMENT_OWNERS_READ_FAILED");
  return (data ?? []).map((row) => ({
    adminId: String(row.admin_id),
    displayName: String(row.display_name ?? row.email ?? "ผู้ดูแลระบบ"),
    email: String(row.email ?? ""),
  }));
}
