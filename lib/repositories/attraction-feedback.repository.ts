import "server-only";

import { getCheckinEntryConfig } from "@/lib/config/checkin-entry";
import { visitMatchesDashboardEvidenceScope } from "@/lib/dashboard/evidence-scope";
import { asRecord } from "@/lib/utils/record";
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

const MAX_AGGREGATE_ROWS = 5_000;
const VISIT_PAGE_SIZE = 1_000;
const MAX_EVIDENCE_ROWS = 100;

type Period = {
  start: string;
  end: string;
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

function dimensionColumn(dimension: FeedbackDimension) {
  return `${dimension}_score`;
}

function relations(row: Record<string, unknown>, key: string): Record<string, unknown>[] {
  const value = row[key];
  if (Array.isArray(value)) return value.map(asRecord);
  return value && typeof value === "object" ? [asRecord(value)] : [];
}

async function allowedCheckinCodeIds(scope: FeedbackScope): Promise<number[] | null> {
  if (!scope.campaignId && !scope.checkinCodeId) return null;
  const supabase = createSupabaseServiceRoleClient();
  let query = supabase.from("checkin_codes")
    .select("checkin_code_id, campaign_id", { count: "exact" })
    .eq("attraction_id", scope.attractionId)
    .limit(501);
  if (scope.campaignId) query = query.eq("campaign_id", scope.campaignId);
  if (scope.checkinCodeId) query = query.eq("checkin_code_id", scope.checkinCodeId);
  const { data, error, count } = await query;
  if (error || count === null || count > 500 || count > (data?.length ?? 0)) {
    throw new Error("ATTRACTION_FEEDBACK_CHECKIN_CODES_READ_FAILED");
  }
  return (data ?? []).map((row) => Number(row.checkin_code_id));
}

async function readEligibleVisits(
  scope: FeedbackScope,
  dimension: FeedbackDimension,
  period: Period,
  codeIds: number[] | null,
  includeComments = false,
) {
  const supabase = createSupabaseServiceRoleClient();
  const surveyColumns = `${dimensionColumn(dimension)}${includeComments ? ", comments" : ""}`;
  const entrySelection = getCheckinEntryConfig().sessionsEnabled
    ? "checkin_entry_sessions(evidence_scope),"
    : "";
  const selection = `visit_id, visit_date, entry_channel, checkin_code_id,
    ${entrySelection}
    research_sessions(collection_mode, status, inclusion_status, research_studies(study_kind)),
    satisfaction_surveys(${surveyColumns})`;
  const readPage = async (offset: number) => {
    let query = supabase.from("visits")
      .select(selection, { count: "exact" })
      .eq("attraction_id", scope.attractionId)
      .gte("visit_date", period.start)
      .lte("visit_date", period.end)
      .order("visit_id")
      .range(offset, offset + VISIT_PAGE_SIZE - 1);
    if (scope.entryChannel) query = query.eq("entry_channel", scope.entryChannel);
    if (codeIds !== null) {
      query = codeIds.length === 0
        ? query.eq("checkin_code_id", -1)
        : query.in("checkin_code_id", codeIds);
    }
    const { data, error, count } = await query;
    if (error || count === null) throw new Error("ATTRACTION_FEEDBACK_VISITS_READ_FAILED");
    return { rows: (data ?? []).map(asRecord), count };
  };
  const firstPage = await readPage(0);
  const rawRows = [...firstPage.rows];
  const boundedCount = Math.min(firstPage.count, MAX_AGGREGATE_ROWS);
  for (let offset = VISIT_PAGE_SIZE; offset < boundedCount; offset += VISIT_PAGE_SIZE) {
    const page = await readPage(offset);
    if (page.count !== firstPage.count) throw new Error("ATTRACTION_FEEDBACK_VISITS_CHANGED_DURING_READ");
    rawRows.push(...page.rows);
  }
  const uniqueVisitIds = new Set(rawRows.map((row) => row.visit_id));
  const isTruncated = firstPage.count > MAX_AGGREGATE_ROWS
    || rawRows.length !== boundedCount
    || uniqueVisitIds.size !== rawRows.length;
  const visits = rawRows
    .filter((row) => visitMatchesDashboardEvidenceScope(row, scope.evidenceScope));
  return { visits, isTruncated };
}

function surveyScores(visits: Record<string, unknown>[], dimension: FeedbackDimension) {
  const column = dimensionColumn(dimension);
  return visits.flatMap((visit) => relations(visit, "satisfaction_surveys"))
    .map((survey) => survey[column])
    .filter((score): score is number => typeof score === "number" && Number.isFinite(score) && score >= 1 && score <= 5);
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

  const codeIds = await allowedCheckinCodeIds(scope);
  const [current, comparison] = await Promise.all([
    readEligibleVisits(scope, issueDimension, currentPeriod, codeIds),
    comparisonPeriod ? readEligibleVisits(scope, issueDimension, comparisonPeriod, codeIds) : Promise.resolve(null),
  ]);
  const scores = surveyScores(current.visits, issueDimension);
  const comparisonScores = comparison ? surveyScores(comparison.visits, issueDimension) : [];

  return {
    attractionId: scope.attractionId,
    issueDimension,
    scope,
    sourceTypes: ["satisfaction_surveys", "visits"],
    validResponseCount: scores.length,
    visitCount: current.visits.length,
    currentScore: average(scores),
    comparisonScore: comparison ? average(comparisonScores) : null,
    structuredLowScoreRecurrence: scores.filter((score) => score <= 2).length,
    isTruncated: current.isTruncated || Boolean(comparison?.isTruncated),
  };
}

export async function listEvidenceRows(
  scope: FeedbackScope,
  issueDimension: FeedbackDimension,
): Promise<RawEvidenceRow[]> {
  const codeIds = await allowedCheckinCodeIds(scope);
  const selected = await readEligibleVisits(
    scope,
    issueDimension,
    { start: scope.dateStart, end: scope.dateEnd },
    codeIds,
    true,
  );
  if (selected.isTruncated) throw new Error("ATTRACTION_FEEDBACK_EVIDENCE_INCOMPLETE");
  const column = dimensionColumn(issueDimension);
  const surveyRows = selected.visits.flatMap((visit) => relations(visit, "satisfaction_surveys").map((survey) => ({
    sourceType: "satisfaction_survey" as const,
    score: typeof survey[column] === "number" ? survey[column] as number : null,
    occurredAt: typeof visit.visit_date === "string" ? visit.visit_date : null,
    comment: typeof survey.comments === "string" ? survey.comments : null,
  }))).filter((row) => row.score !== null)
    .sort((left, right) => (right.occurredAt ?? "").localeCompare(left.occurredAt ?? ""))
    .slice(0, MAX_EVIDENCE_ROWS);

  if (scope.evidenceScope !== "all_records" || scope.entryChannel || scope.campaignId || scope.checkinCodeId || issueDimension !== "overall") {
    return surveyRows;
  }

  const supabase = createSupabaseServiceRoleClient();
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
