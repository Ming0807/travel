import { storyDocumentSchema } from "@/lib/content/story-document";
import { evaluateStoryReadiness, type StoryReadinessKey } from "@/lib/content/story-readiness";
import {
  evaluateStoryTransition,
  type StoryAuthorType,
  type StoryStatus,
  type StoryTransitionCode,
} from "@/lib/content/story-workflow";

export type StoryEditorialState = {
  storyId: number;
  authorType: StoryAuthorType;
  status: StoryStatus;
  updatedAt: string | null;
  title: string;
  slug: string;
  excerpt: string | null;
  legacyContent: string | null;
  contentDocument: unknown;
  contentSchemaVersion: number;
  provinceId: number | null;
  geographicScope: "province" | "cross_province";
  topicIds: number[];
  seoTitle: string | null;
  seoDescription: string | null;
  usesGeneratedSeo: boolean;
  primaryLanguage: "th" | "en" | "ms";
  scheduledAt: string | null;
  readingMinutes: number | null;
  contentQualityScore: number | null;
  cover: { mediaId: number; isActive: boolean; altText: string | null } | null;
};

export type StoryEditorialChange = Partial<
  Pick<
    StoryEditorialState,
    | "title"
    | "slug"
    | "excerpt"
    | "legacyContent"
    | "contentDocument"
    | "contentSchemaVersion"
    | "provinceId"
    | "geographicScope"
    | "topicIds"
    | "seoTitle"
    | "seoDescription"
    | "usesGeneratedSeo"
    | "primaryLanguage"
    | "scheduledAt"
    | "readingMinutes"
    | "contentQualityScore"
    | "cover"
  >
> & {
  targetStatus?: StoryStatus;
  reviewNote?: string | null;
  changeSummary?: string | null;
};

export type StoryEditorialPersistedPatch = Omit<
  StoryEditorialState,
  "storyId" | "authorType" | "updatedAt" | "cover"
>;

export type StoryRevisionSnapshot = StoryEditorialPersistedPatch & {
  authorType: StoryAuthorType;
  topicIds: number[];
  coverMediaId: number | null;
};

export type AtomicStoryEditorialChange = {
  storyId: number;
  expectedUpdatedAt: string | null;
  actorId: string;
  patch: StoryEditorialPersistedPatch;
  snapshot: StoryRevisionSnapshot;
  sourceAction:
    | "save"
    | "submit_review"
    | "approve"
    | "schedule"
    | "publish"
    | "unpublish"
    | "archive"
    | "moderate";
  reviewNote: string | null;
  changeSummary: string | null;
};

export type StoryEditorialChangeStoreResult =
  | { kind: "updated"; updatedAt: string; revisionNumber: number }
  | { kind: "conflict" }
  | { kind: "not_found" };

export type StoryEditorialChangeStore = {
  applyChange(input: AtomicStoryEditorialChange): Promise<StoryEditorialChangeStoreResult>;
};

export type StoryEditorialServiceErrorCode =
  | StoryTransitionCode
  | "INVALID_DOCUMENT"
  | "NOT_READY_FOR_REVIEW"
  | "NOT_READY_FOR_PUBLISH"
  | "EDIT_CONFLICT"
  | "STORY_NOT_FOUND"
  | "EDITORIAL_CHANGE_FAILED";

export class StoryEditorialServiceError extends Error {
  constructor(
    public readonly code: StoryEditorialServiceErrorCode,
    public readonly details: StoryReadinessKey[] = []
  ) {
    super(code);
    this.name = "StoryEditorialServiceError";
  }
}

function sourceActionFor(from: StoryStatus, to: StoryStatus): AtomicStoryEditorialChange["sourceAction"] {
  if (from === to) return "save";
  if (to === "in_review" || to === "submitted") return "submit_review";
  if (to === "approved") return "approve";
  if (to === "scheduled") return "schedule";
  if (to === "published") return "publish";
  if (to === "archived") return "archive";
  if (from === "published" && to === "draft") return "unpublish";
  return "moderate";
}

function mergeState(current: StoryEditorialState, change: StoryEditorialChange): StoryEditorialState {
  const targetStatus = change.targetStatus ?? current.status;
  return {
    ...current,
    ...change,
    status: targetStatus,
    scheduledAt:
      targetStatus === "scheduled"
        ? (change.scheduledAt ?? current.scheduledAt)
        : (change.scheduledAt ?? null),
    topicIds: change.topicIds ? [...change.topicIds] : [...current.topicIds],
  };
}

function toPersistedPatch(state: StoryEditorialState): StoryEditorialPersistedPatch {
  return {
    status: state.status,
    title: state.title,
    slug: state.slug,
    excerpt: state.excerpt,
    legacyContent: state.legacyContent,
    contentDocument: state.contentDocument,
    contentSchemaVersion: state.contentSchemaVersion,
    provinceId: state.provinceId,
    geographicScope: state.geographicScope,
    topicIds: [...state.topicIds],
    seoTitle: state.seoTitle,
    seoDescription: state.seoDescription,
    usesGeneratedSeo: state.usesGeneratedSeo,
    primaryLanguage: state.primaryLanguage,
    scheduledAt: state.scheduledAt,
    readingMinutes: state.readingMinutes,
    contentQualityScore: state.contentQualityScore,
  };
}

function validateRequestedTransition(
  current: StoryEditorialState,
  merged: StoryEditorialState,
  change: StoryEditorialChange,
  now: Date
): void {
  if (current.status === merged.status) return;
  const transition = evaluateStoryTransition({
    authorType: current.authorType,
    from: current.status,
    to: merged.status,
    reviewNote: change.reviewNote,
    scheduledAt: merged.scheduledAt,
    now,
  });
  if (!transition.allowed) throw new StoryEditorialServiceError(transition.code);
}

function validateReadiness(merged: StoryEditorialState): void {
  const readiness = evaluateStoryReadiness({
    title: merged.title,
    slug: merged.slug,
    excerpt: merged.excerpt,
    contentDocument: merged.contentDocument,
    legacyContent: merged.legacyContent,
    cover: merged.cover,
    provinceId: merged.provinceId,
    geographicScope: merged.geographicScope,
    topicIds: merged.topicIds,
    seoDescription: merged.seoDescription,
    usesGeneratedSeo: merged.usesGeneratedSeo,
  });

  if ((merged.status === "in_review" || merged.status === "submitted") && !readiness.readyForReview) {
    const reviewBlocking = readiness.items
      .filter((item) => item.requiredForReview && !item.complete)
      .map((item) => item.key);
    throw new StoryEditorialServiceError("NOT_READY_FOR_REVIEW", reviewBlocking);
  }

  if (["approved", "scheduled", "published"].includes(merged.status) && !readiness.readyForPublish) {
    throw new StoryEditorialServiceError("NOT_READY_FOR_PUBLISH", readiness.blocking);
  }
}

export async function applyStoryEditorialChange(params: {
  actorId: string;
  current: StoryEditorialState;
  change: StoryEditorialChange;
  store: StoryEditorialChangeStore;
  now?: Date;
}): Promise<{ updatedAt: string; revisionNumber: number }> {
  if (
    params.change.contentDocument !== undefined &&
    params.change.contentDocument !== null &&
    !storyDocumentSchema.safeParse(params.change.contentDocument).success
  ) {
    throw new StoryEditorialServiceError("INVALID_DOCUMENT");
  }

  const merged = mergeState(params.current, params.change);
  validateRequestedTransition(params.current, merged, params.change, params.now ?? new Date());
  validateReadiness(merged);

  const patch = toPersistedPatch(merged);
  const result = await params.store.applyChange({
    storyId: merged.storyId,
    expectedUpdatedAt: params.current.updatedAt,
    actorId: params.actorId,
    patch,
    snapshot: {
      ...patch,
      authorType: merged.authorType,
      topicIds: [...merged.topicIds],
      coverMediaId: merged.cover?.mediaId ?? null,
    },
    sourceAction: sourceActionFor(params.current.status, merged.status),
    reviewNote: params.change.reviewNote?.trim() || null,
    changeSummary: params.change.changeSummary?.trim() || null,
  });

  if (result.kind === "conflict") throw new StoryEditorialServiceError("EDIT_CONFLICT");
  if (result.kind === "not_found") throw new StoryEditorialServiceError("STORY_NOT_FOUND");
  if (result.kind !== "updated") throw new StoryEditorialServiceError("EDITORIAL_CHANGE_FAILED");

  return { updatedAt: result.updatedAt, revisionNumber: result.revisionNumber };
}
