import "server-only";

import {
  ACTION_PRIORITIES,
  ACTION_STATUSES as ACTION_STATUS_VALUES,
  FEEDBACK_DIMENSIONS,
  FOLLOW_UP_METRICS,
  ISSUE_CATEGORIES,
  ISSUE_STATUSES,
  actionTransitionInputSchema,
  evidenceSnapshotSchema,
  feedbackScopeSchema,
  improvementActionInputSchema,
  issueReviewInputSchema,
  redactFeedbackOperationalText,
  type ActionTransitionInput,
  type EvidenceSnapshot,
  type FeedbackScopeInput,
  type ImprovementActionInput,
  type IssueReviewInput,
} from "@/lib/validation/attraction-feedback";
import {
  requirePermission,
  type PermissionKey,
} from "@/lib/auth/guards";
import * as defaultRepository from "@/lib/repositories/attraction-feedback.repository";

export type FeedbackScope = FeedbackScopeInput;
export type FeedbackDimension = (typeof FEEDBACK_DIMENSIONS)[number];
export type IssueCategory = (typeof ISSUE_CATEGORIES)[number];
export type IssueStatus = (typeof ISSUE_STATUSES)[number];
export type ActionStatus = (typeof ACTION_STATUS_VALUES)[number];
export type ActionPriority = (typeof ACTION_PRIORITIES)[number];
export type FollowUpMetric = (typeof FOLLOW_UP_METRICS)[number];
export { ACTION_STATUS_VALUES as ACTION_STATUSES };

export const FEEDBACK_RULES = {
  ruleVersion: "feedback-rules-v1",
  minimumValidResponses: 30,
  minimumVisits: 30,
  lowScoreThreshold: 3,
  structuredLowScoreThreshold: 2,
  comparableDeclineThreshold: 0.25,
  minimumStructuredRecurrence: 3,
} as const;

export type CandidateMetrics = {
  attractionId: number;
  issueDimension?: FeedbackDimension;
  scope: FeedbackScope;
  sourceTypes: Array<"satisfaction_surveys" | "reviews" | "visits">;
  validResponseCount: number;
  visitCount: number;
  currentScore: number | null;
  comparisonScore: number | null;
  structuredLowScoreRecurrence: number;
  isTruncated: boolean;
};

export type RawEvidenceRow = {
  sourceType: "satisfaction_survey" | "approved_review";
  score: number | null;
  occurredAt: string | null;
  comment?: string | null;
} & Record<string, unknown>;

export type PrivacySafeEvidenceRow = {
  sourceType: RawEvidenceRow["sourceType"];
  score: number;
  period: string;
  excerpt?: string;
};

export type AttractionFeedbackIssue = {
  feedbackIssueId: string;
  attractionId: number;
  issueDimension: FeedbackDimension;
  issueCategory: IssueCategory;
  ruleVersion: typeof FEEDBACK_RULES.ruleVersion;
  status: IssueStatus;
  baselineStart: string;
  baselineEnd: string;
  comparisonStart: string | null;
  comparisonEnd: string | null;
  visitCount: number;
  responseCount: number;
  responseCoverage: number | null;
  currentScore: number | null;
  comparisonScore: number | null;
  structuredRecurrenceCount: number;
  evidenceSnapshot: EvidenceSnapshot;
  reviewNote: string | null;
  reviewedBy: string;
  reviewedAt: string;
  closedBy?: string | null;
  closedAt?: string | null;
  createdAt?: string;
  updatedAt?: string | null;
};

export type ImprovementAction = {
  improvementActionId: string;
  feedbackIssueId: string;
  title: string;
  proposedAction: string;
  ownerAdminId: string;
  priority: ActionPriority;
  status: ActionStatus;
  dueDate: string;
  followUpMetric: FollowUpMetric;
  followUpStart: string;
  followUpEnd: string;
  completionNote?: string | null;
  completionEvidenceNote?: string | null;
  completedAt?: string | null;
  verifiedBy?: string | null;
  verifiedAt?: string | null;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string | null;
};

export type AttractionFeedbackRepository = {
  readCandidateMetrics: (scope: FeedbackScope, issueDimension: FeedbackDimension) => Promise<CandidateMetrics>;
  listEvidenceRows: (scope: FeedbackScope, issueDimension: FeedbackDimension) => Promise<RawEvidenceRow[]>;
  insertIssue: (input: Omit<AttractionFeedbackIssue, "feedbackIssueId" | "createdAt" | "updatedAt">) => Promise<AttractionFeedbackIssue>;
  findIssue: (issueId: string) => Promise<AttractionFeedbackIssue | null>;
  transitionIssue: (issueId: string, from: IssueStatus, to: IssueStatus, changedBy: string, note: string | null) => Promise<AttractionFeedbackIssue>;
  insertAction: (input: Omit<ImprovementAction, "improvementActionId" | "createdAt" | "updatedAt" | "status">) => Promise<ImprovementAction>;
  findAction: (actionId: string) => Promise<ImprovementAction | null>;
  transitionAction: (actionId: string, from: ActionStatus, to: ActionStatus, changedBy: string, note: string | null, completionEvidenceNote: string | null) => Promise<ImprovementAction>;
  isActiveAdmin: (adminId: string) => Promise<boolean>;
  hasVerifiedAction: (issueId: string) => Promise<boolean>;
};

type PermissionAuthorizer = (permission: PermissionKey) => Promise<{ actor: { adminId: string } }>;

export class AttractionFeedbackServiceError extends Error {
  constructor(public readonly code: string, message: string) {
    super(message);
    this.name = "AttractionFeedbackServiceError";
  }
}

function fail(code: string, message: string): never {
  throw new AttractionFeedbackServiceError(code, message);
}

export function qualifyFeedbackCandidate(metrics: CandidateMetrics) {
  const reasons: string[] = [];
  const validMinimum = metrics.validResponseCount >= FEEDBACK_RULES.minimumValidResponses;
  const visitMinimum = metrics.visitCount >= FEEDBACK_RULES.minimumVisits;
  const lowScore = metrics.currentScore !== null && metrics.currentScore <= FEEDBACK_RULES.lowScoreThreshold;
  const comparableDecline = metrics.currentScore !== null
    && metrics.comparisonScore !== null
    && metrics.comparisonScore - metrics.currentScore >= FEEDBACK_RULES.comparableDeclineThreshold;
  const recurrence = metrics.structuredLowScoreRecurrence >= FEEDBACK_RULES.minimumStructuredRecurrence;

  if (metrics.isTruncated) reasons.push("source_data_truncated");
  if (!validMinimum) reasons.push("minimum_valid_response_threshold_not_met");
  if (!visitMinimum) reasons.push("minimum_visit_threshold_not_met");
  if (metrics.currentScore === null) reasons.push("current_score_missing");
  if (!lowScore && !comparableDecline) reasons.push("score_or_comparable_decline_threshold_not_met");
  if (!recurrence) reasons.push("structured_recurrence_threshold_not_met");
  if (lowScore) reasons.push("current_score_at_or_below_threshold");
  if (comparableDecline) reasons.push("comparable_decline_at_or_above_threshold");
  if (recurrence) reasons.push("structured_recurrence_threshold_met");

  return {
    qualifies: !metrics.isTruncated && validMinimum && visitMinimum && (lowScore || comparableDecline) && recurrence,
    reasons,
    metrics,
  };
}

function forbiddenEvidenceKey(key: string): boolean {
  return new Set([
    "touristId", "tourist_id", "visitId", "visit_id", "displayName", "name", "photo", "photoPath",
    "storagePath", "privatePath", "comment", "comments", "excerpt", "path", "identity", "providerUserId",
    "email", "phone", "token", "signedUrl", "rawComment",
  ]).has(key);
}

function assertNoForbiddenEvidenceKeys(value: unknown): void {
  if (!value || typeof value !== "object") return;
  if (Array.isArray(value)) {
    value.forEach(assertNoForbiddenEvidenceKeys);
    return;
  }
  Object.entries(value).forEach(([key, child]) => {
    if (forbiddenEvidenceKey(key)) fail("EVIDENCE_SNAPSHOT_FORBIDDEN_FIELD", `Evidence snapshot contains forbidden field: ${key}`);
    assertNoForbiddenEvidenceKeys(child);
  });
}

export function buildEvidenceSnapshot(metrics: CandidateMetrics): EvidenceSnapshot {
  const snapshot = {
    schemaVersion: 1 as const,
    ruleVersion: FEEDBACK_RULES.ruleVersion,
    sourceTypes: metrics.sourceTypes,
    dateScope: {
      attractionId: metrics.attractionId,
      dateStart: metrics.scope.dateStart,
      dateEnd: metrics.scope.dateEnd,
      comparisonStart: metrics.scope.comparisonStart,
      comparisonEnd: metrics.scope.comparisonEnd,
    },
    denominators: {
      validResponses: metrics.validResponseCount,
      visits: metrics.visitCount,
      scoredResponses: metrics.validResponseCount,
    },
    metrics: {
      currentScore: metrics.currentScore,
      comparisonScore: metrics.comparisonScore,
      responseCoverage: metrics.visitCount > 0 ? metrics.validResponseCount / metrics.visitCount : null,
      structuredLowScoreRecurrence: metrics.structuredLowScoreRecurrence,
    },
    thresholds: {
      minimumValidResponses: FEEDBACK_RULES.minimumValidResponses,
      minimumVisits: FEEDBACK_RULES.minimumVisits,
      lowScoreThreshold: FEEDBACK_RULES.lowScoreThreshold,
      structuredLowScoreThreshold: FEEDBACK_RULES.structuredLowScoreThreshold,
      comparableDeclineThreshold: FEEDBACK_RULES.comparableDeclineThreshold,
      minimumStructuredRecurrence: FEEDBACK_RULES.minimumStructuredRecurrence,
    },
  };
  return sanitizeEvidenceSnapshot(snapshot);
}

export function sanitizeEvidenceSnapshot(input: unknown): EvidenceSnapshot {
  assertNoForbiddenEvidenceKeys(input);
  const parsed = evidenceSnapshotSchema.safeParse(input);
  if (!parsed.success) fail("EVIDENCE_SNAPSHOT_INVALID", "Evidence snapshot is invalid.");
  return parsed.data;
}

function redactExcerpt(value: string): string {
  return value
    .replace(/https?:\/\/\S+/gi, "[redacted]")
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[redacted]")
    .replace(/\+?\d[\d\s().-]{7,}\d/g, "[redacted]")
    .trim()
    .slice(0, 240);
}

export function toPrivacySafeEvidence(
  rows: RawEvidenceRow[],
  validResponseCount: number,
  includeComments: boolean,
): PrivacySafeEvidenceRow[] {
  if (validResponseCount < FEEDBACK_RULES.minimumValidResponses) return [];

  return rows
    .filter((row): row is RawEvidenceRow & { score: number; occurredAt: string } => (
      typeof row.score === "number" && Number.isFinite(row.score) && typeof row.occurredAt === "string"
    ))
    .slice(0, 100)
    .map((row) => {
      const safe: PrivacySafeEvidenceRow = {
        sourceType: row.sourceType,
        score: row.score,
        period: row.occurredAt.slice(0, 7),
      };
      if (includeComments && row.comment?.trim()) safe.excerpt = redactExcerpt(row.comment);
      return safe;
    });
}

function validateScope(input: unknown): FeedbackScope {
  const parsed = feedbackScopeSchema.safeParse(input);
  if (!parsed.success) fail("VALIDATION_FAILED", "Feedback scope is invalid.");
  return parsed.data;
}

function assertActionTransition(from: ActionStatus, to: ActionStatus, evidence: string | null | undefined, note: string | null | undefined) {
  const allowed = (
    (from === "planned" && ["in_progress", "cancelled"].includes(to))
    || (from === "in_progress" && ["completed", "cancelled"].includes(to))
    || (from === "completed" && to === "verified")
  );
  if (!allowed) fail("INVALID_ACTION_TRANSITION", `Cannot transition action from ${from} to ${to}.`);
  if (to === "completed" && !evidence?.trim()) fail("COMPLETION_EVIDENCE_REQUIRED", "Completion evidence is required.");
  if (to === "cancelled" && !note?.trim()) fail("CANCELLATION_NOTE_REQUIRED", "Cancellation note is required.");
}

export class AttractionFeedbackService {
  constructor(
    private readonly repository: AttractionFeedbackRepository = defaultRepository,
    private readonly authorize: PermissionAuthorizer = requirePermission,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async getCandidate(scopeInput: unknown, issueDimension: FeedbackDimension = "overall") {
    const scope = validateScope(scopeInput);
    await this.authorize("attraction_feedback.read");
    const metrics = await this.repository.readCandidateMetrics(scope, issueDimension);
    if (metrics.attractionId !== scope.attractionId) fail("FEEDBACK_SCOPE_MISMATCH", "Feedback data does not match the requested attraction.");
    return qualifyFeedbackCandidate(metrics);
  }

  async getEvidence(scopeInput: unknown, issueDimension: FeedbackDimension = "overall", includeComments = false) {
    const scope = validateScope(scopeInput);
    await this.authorize("attraction_feedback.evidence_read");
    const rows = await this.repository.listEvidenceRows(scope, issueDimension);
    const metrics = await this.repository.readCandidateMetrics(scope, issueDimension);
    return toPrivacySafeEvidence(rows, metrics.validResponseCount, includeComments);
  }

  async reviewCandidate(input: IssueReviewInput) {
    const parsed = issueReviewInputSchema.safeParse(input);
    if (!parsed.success) fail("VALIDATION_FAILED", "Issue review input is invalid.");
    if (parsed.data.decision === "dismiss" && !parsed.data.reviewNote.trim()) {
      fail("DISMISS_NOTE_REQUIRED", "A note is required when dismissing a candidate.");
    }
    const guard = await this.authorize("attraction_feedback.issue_review");
    const metrics = await this.repository.readCandidateMetrics(parsed.data, parsed.data.issueDimension);
    const qualification = qualifyFeedbackCandidate(metrics);
    if (!qualification.qualifies) fail("CANDIDATE_NOT_QUALIFIED", "This feedback candidate does not meet the approved qualification rules.");

    const snapshot = buildEvidenceSnapshot(metrics);
    return this.repository.insertIssue({
      attractionId: parsed.data.attractionId,
      issueDimension: parsed.data.issueDimension,
      issueCategory: parsed.data.issueCategory,
      ruleVersion: FEEDBACK_RULES.ruleVersion,
      status: parsed.data.decision === "accept" ? "open" : "dismissed",
      baselineStart: parsed.data.dateStart,
      baselineEnd: parsed.data.dateEnd,
      comparisonStart: parsed.data.comparisonStart ?? null,
      comparisonEnd: parsed.data.comparisonEnd ?? null,
      visitCount: metrics.visitCount,
      responseCount: metrics.validResponseCount,
      responseCoverage: metrics.visitCount > 0 ? metrics.validResponseCount / metrics.visitCount : null,
      currentScore: metrics.currentScore,
      comparisonScore: metrics.comparisonScore,
      structuredRecurrenceCount: metrics.structuredLowScoreRecurrence,
      evidenceSnapshot: snapshot,
      reviewNote: parsed.data.reviewNote.trim() || null,
      reviewedBy: guard.actor.adminId,
      reviewedAt: this.now().toISOString(),
    });
  }

  async createAction(input: ImprovementActionInput) {
    const parsed = improvementActionInputSchema.safeParse(input);
    if (!parsed.success) fail("VALIDATION_FAILED", "Improvement action input is invalid.");
    const guard = await this.authorize("attraction_improvement.manage");
    const issue = await this.repository.findIssue(parsed.data.issueId);
    if (!issue) fail("ISSUE_NOT_FOUND", "The feedback issue was not found.");
    if (issue.status !== "open") fail("ISSUE_NOT_OPEN", "An action can only be created for an open issue.");
    if (!await this.repository.isActiveAdmin(parsed.data.ownerAdminId)) {
      fail("ACTION_OWNER_INACTIVE", "The selected action owner is not an active administrator.");
    }

    return this.repository.insertAction({
      feedbackIssueId: issue.feedbackIssueId,
      title: parsed.data.title,
      proposedAction: parsed.data.proposedAction,
      ownerAdminId: parsed.data.ownerAdminId,
      priority: parsed.data.priority,
      dueDate: parsed.data.dueDate,
      followUpMetric: parsed.data.followUpMetric,
      followUpStart: parsed.data.followUpStart,
      followUpEnd: parsed.data.followUpEnd,
      createdBy: guard.actor.adminId,
    });
  }

  async transitionAction(input: ActionTransitionInput) {
    const parsed = actionTransitionInputSchema.safeParse(input);
    if (!parsed.success) fail("VALIDATION_FAILED", "Action transition input is invalid.");
    const action = await this.repository.findAction(parsed.data.actionId);
    if (!action) fail("ACTION_NOT_FOUND", "The improvement action was not found.");

    const permission = parsed.data.toStatus === "verified"
      ? "attraction_improvement.verify"
      : "attraction_improvement.manage";
    const guard = await this.authorize(permission);
    const rawEvidence = parsed.data.completionEvidenceNote ?? action.completionEvidenceNote ?? null;
    const evidence = rawEvidence ? redactFeedbackOperationalText(rawEvidence) : null;
    assertActionTransition(action.status, parsed.data.toStatus, evidence, parsed.data.note);
    if (parsed.data.toStatus === "verified" && this.now().toISOString().slice(0, 10) <= action.followUpEnd) {
      fail("FOLLOW_UP_NOT_COMPLETE", "The follow-up period has not ended.");
    }

    return this.repository.transitionAction(
      action.improvementActionId,
      action.status,
      parsed.data.toStatus,
      guard.actor.adminId,
      parsed.data.note?.trim() || null,
      evidence,
    );
  }

  async closeIssue(issueId: string, note: string) {
    const guard = await this.authorize("attraction_feedback.issue_review");
    const issue = await this.repository.findIssue(issueId);
    if (!issue) fail("ISSUE_NOT_FOUND", "The feedback issue was not found.");
    if (issue.status !== "open") fail("ISSUE_NOT_OPEN", "Only an open issue can be closed.");
    if (!note.trim()) fail("CLOSE_NOTE_REQUIRED", "A closing note is required.");
    if (!await this.repository.hasVerifiedAction(issueId)) {
      fail("VERIFIED_ACTION_REQUIRED", "A verified improvement action is required before closing the issue.");
    }
    return this.repository.transitionIssue(issueId, "open", "closed", guard.actor.adminId, note.trim());
  }
}

export { assertActionTransition };

export async function getAttractionImprovementWorkspace(input: {
  scope: FeedbackScopeInput;
  dimension: FeedbackDimension;
  issueStatus?: IssueStatus;
}) {
  const scope = validateScope(input.scope);
  await requirePermission("attraction_feedback.read");
  const [metrics, issues, owners] = await Promise.all([
    defaultRepository.readCandidateMetrics(scope, input.dimension),
    defaultRepository.listIssuesForAttraction(scope.attractionId, input.issueStatus),
    defaultRepository.listActiveImprovementOwners(),
  ]);
  const issueIds = issues.map((issue) => issue.feedbackIssueId);
  const actions = await defaultRepository.listActionsForIssues(issueIds);
  const history = await defaultRepository.listImprovementHistory(
    issueIds,
    actions.map((action) => action.improvementActionId),
  );

  return {
    candidate: qualifyFeedbackCandidate(metrics),
    issues,
    actions,
    history,
    owners,
    rules: FEEDBACK_RULES,
  };
}
