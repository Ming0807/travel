import { z } from "zod";

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected an ISO date.");
const uuid = z.string().uuid();

export function redactFeedbackOperationalText(value: string): string {
  return value
    .replace(/https?:\/\/\S+/gi, "[ปกปิดลิงก์]")
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[ปกปิดอีเมล]")
    .replace(/\+?\d[\d\s().-]{7,}\d/g, "[ปกปิดเบอร์โทร]")
    .replace(/\b(?:visitor|tourist)\s*(?:name|id)?\b[^;\n,]*/gi, "[ปกปิดข้อมูลผู้ใช้]")
    .replace(/\b(?:storage|private|tourist|visit)[\\/][^\s;,]+/gi, "[ปกปิดพาธส่วนตัว]")
    .trim();
}

export const FEEDBACK_DIMENSIONS = [
  "overall",
  "facility",
  "cleanliness",
  "safety",
  "accessibility",
  "information",
  "value",
] as const;

export const ISSUE_CATEGORIES = [
  "facilities",
  "cleanliness",
  "safety",
  "accessibility",
  "information_signage",
  "value",
  "service",
  "maintenance",
  "other",
] as const;

export const ISSUE_STATUSES = ["open", "dismissed", "closed"] as const;
export const ACTION_STATUSES = ["planned", "in_progress", "completed", "verified", "cancelled"] as const;
export const ACTION_PRIORITIES = ["low", "medium", "high"] as const;
export const FOLLOW_UP_METRICS = [
  "overall_score",
  "facility_score",
  "cleanliness_score",
  "safety_score",
  "accessibility_score",
  "information_score",
  "value_score",
  "response_coverage",
  "structured_recurrence_count",
] as const;

export const feedbackScopeSchema = z.object({
  attractionId: z.number().int().positive(),
  dateStart: isoDate,
  dateEnd: isoDate,
  comparisonStart: isoDate.optional(),
  comparisonEnd: isoDate.optional(),
}).superRefine((value, context) => {
  if (value.dateEnd < value.dateStart) {
    context.addIssue({ code: "custom", path: ["dateEnd"], message: "End date must not precede start date." });
  }
  if ((value.comparisonStart && !value.comparisonEnd) || (!value.comparisonStart && value.comparisonEnd)) {
    context.addIssue({ code: "custom", path: ["comparisonEnd"], message: "Comparison dates must be supplied together." });
  }
  if (value.comparisonStart && value.comparisonEnd && value.comparisonEnd < value.comparisonStart) {
    context.addIssue({ code: "custom", path: ["comparisonEnd"], message: "Comparison end date must not precede start date." });
  }
});

export const issueReviewInputSchema = feedbackScopeSchema.extend({
  issueDimension: z.enum(FEEDBACK_DIMENSIONS),
  issueCategory: z.enum(ISSUE_CATEGORIES),
  decision: z.enum(["accept", "dismiss"]),
  reviewNote: z.string().trim().max(2000),
});

export const improvementActionInputSchema = z.object({
  issueId: uuid,
  title: z.string().trim().min(1).max(160),
  proposedAction: z.string().trim().min(1).max(4000),
  ownerAdminId: uuid,
  priority: z.enum(ACTION_PRIORITIES),
  dueDate: isoDate,
  followUpMetric: z.enum(FOLLOW_UP_METRICS),
  followUpStart: isoDate,
  followUpEnd: isoDate,
}).superRefine((value, context) => {
  if (value.followUpEnd < value.followUpStart) {
    context.addIssue({ code: "custom", path: ["followUpEnd"], message: "Follow-up end must not precede start." });
  }
  if (value.followUpStart < value.dueDate) {
    context.addIssue({ code: "custom", path: ["followUpStart"], message: "Follow-up must start on or after the due date." });
  }
});

export const actionTransitionInputSchema = z.object({
  actionId: uuid,
  toStatus: z.enum(ACTION_STATUSES),
  note: z.string().trim().max(2000).optional(),
  completionEvidenceNote: z.string().trim().max(4000).optional(),
});

export const evidenceSnapshotSchema = z.object({
  schemaVersion: z.literal(1),
  ruleVersion: z.literal("feedback-rules-v1"),
  sourceTypes: z.array(z.enum(["satisfaction_surveys", "reviews", "visits"])).min(1),
  dateScope: z.object({
    attractionId: z.number().int().positive(),
    dateStart: isoDate,
    dateEnd: isoDate,
    comparisonStart: isoDate.optional(),
    comparisonEnd: isoDate.optional(),
  }).strict(),
  denominators: z.object({
    validResponses: z.number().int().nonnegative(),
    visits: z.number().int().nonnegative(),
    scoredResponses: z.number().int().nonnegative(),
  }).strict(),
  metrics: z.object({
    currentScore: z.number().min(1).max(5).nullable(),
    comparisonScore: z.number().min(1).max(5).nullable(),
    responseCoverage: z.number().min(0).max(1).nullable(),
    structuredLowScoreRecurrence: z.number().int().nonnegative(),
  }).strict(),
  thresholds: z.object({
    minimumValidResponses: z.literal(30),
    minimumVisits: z.literal(30),
    lowScoreThreshold: z.literal(3),
    structuredLowScoreThreshold: z.literal(2),
    comparableDeclineThreshold: z.literal(0.25),
    minimumStructuredRecurrence: z.literal(3),
  }).strict(),
}).strict();

export type FeedbackScopeInput = z.infer<typeof feedbackScopeSchema>;
export type IssueReviewInput = z.infer<typeof issueReviewInputSchema>;
export type ImprovementActionInput = z.infer<typeof improvementActionInputSchema>;
export type ActionTransitionInput = z.infer<typeof actionTransitionInputSchema>;
export type EvidenceSnapshot = z.infer<typeof evidenceSnapshotSchema>;
