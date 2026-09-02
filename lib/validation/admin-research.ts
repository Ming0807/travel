import { z } from "zod";

import { uuidSchema } from "@/lib/validation/common";

const isoDateSchema = z.iso.date();
const isoDateTimeSchema = z.iso.datetime({ offset: true });

const optionalDateTimeSchema = z.preprocess(
  (value) => (value === "" || value === null || value === undefined ? undefined : value),
  isoDateTimeSchema.optional(),
);

const slugSchema = z
  .string()
  .trim()
  .min(1)
  .max(80)
  .regex(/^[a-z0-9]+(?:_[a-z0-9]+)*$/);

const studyCodeSchema = z
  .string()
  .trim()
  .min(1)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

const itemCodeSchema = z
  .string()
  .trim()
  .regex(/^[A-Z][A-Z0-9_]{1,29}$/);

const instrumentKeySchema = slugSchema;
const taskCodeSchema = slugSchema.max(50);

export const adminResearchStudyStatusSchema = z.enum(["draft", "paused", "closed"]);
export const adminResearchInstrumentAudienceSchema = z.enum([
  "tourist",
  "operator",
  "attraction_manager",
]);
export const adminResearchCollectionModeSchema = z.enum([
  "field_observation",
  "simulated_usability",
  "pilot_internal",
]);
export const adminResearchStudyKindSchema = z.enum(["pilot", "final_collection"]);
export const adminResearchParticipantTypeSchema = z.enum([
  "tourist",
  "operator",
  "attraction_manager",
]);
export const adminResearchAnswerTypeSchema = z.enum([
  "agreement_5",
  "rating_5",
  "boolean",
  "integer",
  "single_choice",
  "short_text",
  "long_text",
]);

// These are the constructs in the current protocol. Validation intentionally
// accepts any slug so an advisor-approved future construct remains possible.
export const knownResearchConstructKeys = [
  "system_quality",
  "information_quality",
  "perceived_ease_of_use",
  "perceived_usefulness",
  "privacy_trust",
  "user_satisfaction",
  "behavioral_intention",
  "incentive_engagement",
] as const;

export const researchConstructKeySchema = slugSchema;

export const adminResearchStudyDraftCreateSchema = z
  .object({
    studyCode: studyCodeSchema,
    titleTh: z.string().trim().min(1).max(255),
    titleEn: z.string().trim().max(255).optional(),
    protocolVersion: z.string().trim().min(1).max(50),
    consentVersion: z.string().trim().min(1).max(50),
    noticeVersion: z.string().trim().min(1).max(50),
    purposeTh: z.string().trim().min(1),
    participationTh: z.string().trim().min(1),
    privacyTh: z.string().trim().min(1),
    withdrawalTh: z.string().trim().min(1),
    contactEmail: z.email().max(320),
    scopeCode: z.string().trim().min(1).max(100),
    studyKind: adminResearchStudyKindSchema.default("pilot"),
    sourcePilotStudyId: uuidSchema.nullable().optional(),
    status: z.literal("draft").default("draft"),
    startsAt: optionalDateTimeSchema,
    endsAt: optionalDateTimeSchema,
    retentionUntil: optionalDateTimeSchema,
  })
  .strict()
  .superRefine((value, context) => {
    addDateOrderingIssue(value.startsAt, value.endsAt, context, "endsAt", "Study end must be after study start.");
    addRetentionIssue(value.endsAt, value.retentionUntil, context);
    if (value.studyKind === "final_collection" && !value.sourcePilotStudyId) {
      context.addIssue({ code: "custom", path: ["sourcePilotStudyId"], message: "Final collection must reference its source Pilot." });
    }
    if (value.studyKind === "pilot" && value.sourcePilotStudyId) {
      context.addIssue({ code: "custom", path: ["sourcePilotStudyId"], message: "A Pilot cannot reference another Pilot as its source." });
    }
  });

export const adminResearchActivationEvidenceSchema = z.object({
  studyId: uuidSchema,
  evidenceType: z.enum(["expert_review", "cognitive_pretest", "mobile_flow_qa"]),
  versionNumber: z.number().int().positive(),
  status: z.enum(["passed", "failed", "not_required"]),
  evidenceDate: isoDateSchema,
  reference: z.string().trim().min(1).max(500),
  summary: z.string().trim().min(1).max(4000),
  participantCount: z.number().int().min(0).max(10000).nullable().optional(),
  medianCompletionSeconds: z.number().int().min(0).max(86400).nullable().optional(),
  abandonmentRate: z.number().min(0).max(100).nullable().optional(),
  missingnessRate: z.number().min(0).max(100).nullable().optional(),
}).strict();

export const adminResearchFreezeSnapshotSchema = z.object({
  studyId: uuidSchema,
  scoringVersion: z.string().trim().min(1).max(50),
  retentionVersion: z.string().trim().min(1).max(50),
  withdrawalVersion: z.string().trim().min(1).max(50),
  languageVersion: z.string().trim().min(1).max(50),
  inclusionVersion: z.string().trim().min(1).max(50),
  applicationRevision: z.string().trim().min(1).max(100),
  databaseRevision: z.string().trim().min(1).max(100),
  confirmImmutable: z.literal(true),
}).strict();

export const adminResearchPilotReviewSchema = z.object({
  studyId: uuidSchema,
  decision: z.enum(["revise", "repeat_pilot", "ready_for_field"]),
  reviewedSessionCount: z.number().int().min(0).max(10000),
  medianCompletionSeconds: z.number().int().min(0).max(86400).nullable().optional(),
  abandonmentRate: z.number().min(0).max(100).nullable().optional(),
  missingnessRate: z.number().min(0).max(100).nullable().optional(),
  reliabilityNote: z.string().trim().min(1).max(4000),
  decisionRationale: z.string().trim().min(1).max(4000),
}).strict().superRefine((value, context) => {
  if (value.decision !== "ready_for_field") return;
  if (value.reviewedSessionCount < 1) {
    context.addIssue({ code: "custom", path: ["reviewedSessionCount"], message: "A field-ready decision requires at least one reviewed session." });
  }
  for (const key of ["medianCompletionSeconds", "abandonmentRate", "missingnessRate"] as const) {
    if (value[key] === null || value[key] === undefined) {
      context.addIssue({ code: "custom", path: [key], message: "A field-ready decision requires the complete pilot quality summary." });
    }
  }
});

export const adminResearchStudyDraftUpdateSchema = z
  .object({
    studyId: uuidSchema,
    studyCode: studyCodeSchema.optional(),
    titleTh: z.string().trim().min(1).max(255).optional(),
    titleEn: z.string().trim().max(255).nullable().optional(),
    protocolVersion: z.string().trim().min(1).max(50).optional(),
    consentVersion: z.string().trim().min(1).max(50).optional(),
    noticeVersion: z.string().trim().min(1).max(50).optional(),
    purposeTh: z.string().trim().min(1).optional(),
    participationTh: z.string().trim().min(1).optional(),
    privacyTh: z.string().trim().min(1).optional(),
    withdrawalTh: z.string().trim().min(1).optional(),
    contactEmail: z.email().max(320).optional(),
    scopeCode: z.string().trim().min(1).max(100).optional(),
    status: adminResearchStudyStatusSchema.optional(),
    startsAt: optionalDateTimeSchema,
    endsAt: optionalDateTimeSchema,
    retentionUntil: optionalDateTimeSchema,
  })
  .strict()
  .superRefine((value, context) => {
    addDateOrderingIssue(value.startsAt, value.endsAt, context, "endsAt", "Study end must be after study start.");
    addRetentionIssue(value.endsAt, value.retentionUntil, context);
  });

export const adminResearchInstrumentDraftSchema = z
  .object({
    studyId: uuidSchema,
    instrumentKey: instrumentKeySchema,
    versionNumber: z.number().int().positive(),
    audience: adminResearchInstrumentAudienceSchema,
    status: z.literal("draft").default("draft"),
    titleTh: z.string().trim().min(1).max(255),
    titleEn: z.string().trim().max(255).optional(),
    descriptionTh: z.string().trim().optional(),
    descriptionEn: z.string().trim().optional(),
    estimatedMinutes: z.number().int().min(1).max(60).optional(),
  })
  .strict();

const itemBaseShape = {
  instrumentId: uuidSchema,
  itemCode: itemCodeSchema,
  constructKey: researchConstructKeySchema,
  promptTh: z.string().trim().min(1),
  promptEn: z.string().trim().optional(),
  displayOrder: z.number().int().positive(),
  isRequired: z.boolean().default(true),
  reverseScore: z.boolean().default(false),
};

const itemWithoutOptionsSchema = z.object({
  ...itemBaseShape,
  answerType: z.enum([
    "agreement_5",
    "rating_5",
    "boolean",
    "integer",
    "short_text",
    "long_text",
  ]),
  options: z.never().optional(),
}).strict();

const itemOptionsSchema = z
  .array(z.string().trim().min(1).max(100))
  .min(2)
  .max(50)
  .superRefine((options, context) => {
    if (new Set(options).size !== options.length) {
      context.addIssue({ code: "custom", message: "Choice options must be unique." });
    }
  });

const singleChoiceItemSchema = z.object({
  ...itemBaseShape,
  answerType: z.literal("single_choice"),
  options: itemOptionsSchema,
}).strict();

export const adminResearchItemCreateSchema = z.discriminatedUnion("answerType", [
  itemWithoutOptionsSchema,
  singleChoiceItemSchema,
]);

export const adminResearchDeploymentSchema = z
  .object({
    studyId: uuidSchema,
    checkinCodeId: z.coerce.number().int().positive(),
    collectionMode: adminResearchCollectionModeSchema,
    isActive: z.boolean().default(false),
    startsAt: optionalDateTimeSchema,
    endsAt: optionalDateTimeSchema,
  })
  .strict()
  .superRefine((value, context) => {
    addDateOrderingIssue(value.startsAt, value.endsAt, context, "endsAt", "Deployment end must be after deployment start.");
  });

export const adminResearchStudyActivationSchema = z
  .object({
    studyId: uuidSchema,
    confirmFreeze: z.literal(true),
    frozenAt: isoDateTimeSchema.optional(),
  })
  .strict();

export const adminResearchStudyFreezeSchema = adminResearchStudyActivationSchema;

export const adminResearchApprovalSchema = z
  .object({
    studyId: uuidSchema,
    advisorApprovedAt: isoDateTimeSchema,
    ethicsReviewStatus: z.enum(["not_required", "approved"]),
    ethicsApprovedAt: optionalDateTimeSchema,
    approvalReference: z.string().trim().min(3).max(500),
    approvedTitleTh: z.string().trim().min(1).max(255),
    approvedGeographicBoundary: z.string().trim().min(1).max(1000),
    approvedObjectives: z.array(z.string().trim().min(1).max(1000)).min(1).max(20),
    approvedResearchQuestions: z.array(z.string().trim().min(1).max(1000)).min(1).max(20),
    analysisWording: z.enum(["exploratory", "descriptive_associational", "confirmatory"]),
    confirmRecordedEvidence: z.literal(true),
  })
  .strict()
  .superRefine((value, context) => {
    if (value.ethicsReviewStatus === "approved" && !value.ethicsApprovedAt) {
      context.addIssue({ code: "custom", path: ["ethicsApprovedAt"], message: "Approved ethics review requires an approval date." });
    }
    if (value.ethicsReviewStatus === "not_required" && value.ethicsApprovedAt) {
      context.addIssue({ code: "custom", path: ["ethicsApprovedAt"], message: "Do not record an ethics approval date when review is not required." });
    }
  });

const analyticsFilterShape = {
  studyId: uuidSchema,
  dateFrom: isoDateSchema,
  dateTo: isoDateSchema,
  participantType: adminResearchParticipantTypeSchema.optional(),
  collectionModes: z.array(adminResearchCollectionModeSchema).min(1).max(3).default(["field_observation"]),
  minCellThreshold: z.literal(10).default(10),
};

export const adminResearchAnalyticsFiltersSchema = z
  .object(analyticsFilterShape)
  .strict()
  .superRefine((value, context) => {
    addDateOrderingIssue(value.dateFrom, value.dateTo, context, "dateTo", "Analytics end date must not precede start date.");
    if (new Set(value.collectionModes).size !== value.collectionModes.length) {
      context.addIssue({ code: "custom", path: ["collectionModes"], message: "Collection modes must be unique." });
    }
  });

export const adminResearchOperatorTaskDraftSchema = z
  .object({
    studyId: uuidSchema,
    taskCode: taskCodeSchema,
    versionNumber: z.number().int().positive(),
    audience: z.enum(["operator", "attraction_manager"]),
    status: z.literal("draft").default("draft"),
    titleTh: z.string().trim().min(1).max(255),
    titleEn: z.string().trim().max(255).optional(),
    instructionTh: z.string().trim().min(1),
    instructionEn: z.string().trim().optional(),
    expectedEvidence: z.string().trim().min(1),
    scoringRule: z.record(z.string(), z.unknown()),
    displayOrder: z.number().int().positive(),
    maximumMinutes: z.number().int().min(1).max(120).optional(),
  })
  .strict();

export const adminResearchOperatorAttemptSchema = z
  .object({
    researchSessionId: uuidSchema,
    researchOperatorTaskId: uuidSchema,
    sequenceNumber: z.number().int().min(1).max(100),
    status: z.enum(["not_started", "in_progress", "completed", "skipped", "abandoned"]).default("not_started"),
    outcome: z.enum(["passed", "partial", "failed", "not_assessed"]).optional(),
    confidence: z.number().int().min(1).max(5).optional(),
    evidenceQuality: z.number().int().min(1).max(5).optional(),
    rationale: z.string().trim().max(4000).optional(),
    codedNotes: z.record(z.string(), z.unknown()).optional(),
    startedAt: optionalDateTimeSchema,
    completedAt: optionalDateTimeSchema,
  })
  .strict()
  .superRefine((value, context) => {
    addDateOrderingIssue(value.startedAt, value.completedAt, context, "completedAt", "Completion cannot precede start.");
    if (value.status === "completed" && (!value.completedAt || !value.outcome)) {
      context.addIssue({ code: "custom", path: ["status"], message: "Completed attempts require completion time and outcome." });
    }
  });

export const adminResearchExportDatasetSchema = z.enum([
  "participants",
  "responses",
  "answers",
  "funnel",
  "tourism",
  "operator_tasks",
  "codebook",
]);

export const adminResearchOperatorAssessmentSchema = z.object({
  studyId: uuidSchema,
  attemptId: uuidSchema,
  outcome: z.enum(["passed", "partial", "failed"]),
  evidenceQuality: z.coerce.number().int().min(1).max(5),
  reviewNote: z.string().trim().max(2000).optional(),
}).strict();

export const adminResearchExportFiltersSchema = z
  .object({
    studyId: uuidSchema,
    dataset: adminResearchExportDatasetSchema,
    dateFrom: isoDateSchema.optional(),
    dateTo: isoDateSchema.optional(),
    participantType: adminResearchParticipantTypeSchema.optional(),
    collectionModes: z.array(adminResearchCollectionModeSchema).min(1).max(3).default(["field_observation"]),
    minCellThreshold: z.literal(10).default(10),
    deidentified: z.literal(true).default(true),
  })
  .strict()
  .superRefine((value, context) => {
    if (value.dateFrom && value.dateTo) {
      addDateOrderingIssue(value.dateFrom, value.dateTo, context, "dateTo", "Export end date must not precede start date.");
    }
    if (new Set(value.collectionModes).size !== value.collectionModes.length) {
      context.addIssue({ code: "custom", path: ["collectionModes"], message: "Collection modes must be unique." });
    }
  });

function addDateOrderingIssue(
  start: string | undefined,
  end: string | undefined,
  context: z.RefinementCtx,
  path: string,
  message: string,
) {
  if (start && end && Date.parse(start) >= Date.parse(end)) {
    context.addIssue({ code: "custom", path: [path], message });
  }
}

function addRetentionIssue(
  endsAt: string | undefined,
  retentionUntil: string | undefined,
  context: z.RefinementCtx,
) {
  if (endsAt && retentionUntil && Date.parse(retentionUntil) < Date.parse(endsAt)) {
    context.addIssue({
      code: "custom",
      path: ["retentionUntil"],
      message: "Retention must end on or after the study end date.",
    });
  }
}

export type AdminResearchStudyDraftCreateInput = z.infer<typeof adminResearchStudyDraftCreateSchema>;
export type AdminResearchActivationEvidenceInput = z.infer<typeof adminResearchActivationEvidenceSchema>;
export type AdminResearchFreezeSnapshotInput = z.infer<typeof adminResearchFreezeSnapshotSchema>;
export type AdminResearchPilotReviewInput = z.infer<typeof adminResearchPilotReviewSchema>;
export type AdminResearchStudyDraftUpdateInput = z.infer<typeof adminResearchStudyDraftUpdateSchema>;
export type AdminResearchInstrumentDraftInput = z.infer<typeof adminResearchInstrumentDraftSchema>;
export type AdminResearchItemCreateInput = z.infer<typeof adminResearchItemCreateSchema>;
export type AdminResearchDeploymentInput = z.infer<typeof adminResearchDeploymentSchema>;
export type AdminResearchStudyActivationInput = z.infer<typeof adminResearchStudyActivationSchema>;
export type AdminResearchApprovalInput = z.infer<typeof adminResearchApprovalSchema>;
export type AdminResearchAnalyticsFilters = z.infer<typeof adminResearchAnalyticsFiltersSchema>;
export type AdminResearchOperatorTaskDraftInput = z.infer<typeof adminResearchOperatorTaskDraftSchema>;
export type AdminResearchOperatorAttemptInput = z.infer<typeof adminResearchOperatorAttemptSchema>;
export type AdminResearchOperatorAssessmentInput = z.infer<typeof adminResearchOperatorAssessmentSchema>;
export type AdminResearchExportFilters = z.infer<typeof adminResearchExportFiltersSchema>;
