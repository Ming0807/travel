export type StoryAuthorType = "admin" | "tourist";
export type EditorialStoryStatus = "draft" | "in_review" | "approved" | "scheduled" | "published" | "archived";
export type TouristStoryStatus =
  | "submitted"
  | "in_review"
  | "changes_requested"
  | "approved"
  | "published"
  | "rejected"
  | "archived";
export type StoryStatus = EditorialStoryStatus | TouristStoryStatus;

export type StoryTransitionCode =
  | "ALLOWED"
  | "INVALID_TRANSITION"
  | "NO_CHANGE"
  | "REVIEW_NOTE_REQUIRED"
  | "SCHEDULE_REQUIRED"
  | "SCHEDULE_MUST_BE_FUTURE";

export type StoryTransitionResult = {
  allowed: boolean;
  code: StoryTransitionCode;
};

const editorialTransitions: Record<EditorialStoryStatus, readonly EditorialStoryStatus[]> = {
  draft: ["in_review", "archived"],
  in_review: ["draft", "approved"],
  approved: ["draft", "scheduled", "published"],
  scheduled: ["draft", "published"],
  published: ["draft", "archived"],
  archived: ["draft"],
};

const touristTransitions: Record<TouristStoryStatus, readonly TouristStoryStatus[]> = {
  submitted: ["in_review", "archived"],
  in_review: ["changes_requested", "approved", "rejected"],
  changes_requested: ["submitted", "archived"],
  approved: ["published", "rejected"],
  published: ["archived"],
  rejected: ["submitted", "archived"],
  archived: ["submitted"],
};

function isEditorialStatus(value: StoryStatus): value is EditorialStoryStatus {
  return value in editorialTransitions;
}

function isTouristStatus(value: StoryStatus): value is TouristStoryStatus {
  return value in touristTransitions;
}

export function getAllowedStoryTransitions(authorType: "admin", status: EditorialStoryStatus): EditorialStoryStatus[];
export function getAllowedStoryTransitions(authorType: "tourist", status: TouristStoryStatus): TouristStoryStatus[];
export function getAllowedStoryTransitions(authorType: StoryAuthorType, status: StoryStatus): StoryStatus[];
export function getAllowedStoryTransitions(authorType: StoryAuthorType, status: StoryStatus): StoryStatus[] {
  if (authorType === "admin" && isEditorialStatus(status)) return [...editorialTransitions[status]];
  if (authorType === "tourist" && isTouristStatus(status)) return [...touristTransitions[status]];
  return [];
}

export function evaluateStoryTransition(input: {
  authorType: StoryAuthorType;
  from: StoryStatus;
  to: StoryStatus;
  reviewNote?: string | null;
  scheduledAt?: string | null;
  now?: Date;
}): StoryTransitionResult {
  if (input.from === input.to) return { allowed: false, code: "NO_CHANGE" };

  const allowed = getAllowedStoryTransitions(input.authorType, input.from);
  if (!allowed.includes(input.to)) return { allowed: false, code: "INVALID_TRANSITION" };

  if (
    input.authorType === "tourist" &&
    (input.to === "rejected" || input.to === "changes_requested") &&
    !input.reviewNote?.trim()
  ) {
    return { allowed: false, code: "REVIEW_NOTE_REQUIRED" };
  }

  if (input.authorType === "admin" && input.to === "scheduled") {
    if (!input.scheduledAt) return { allowed: false, code: "SCHEDULE_REQUIRED" };
    const scheduledAt = new Date(input.scheduledAt);
    if (!Number.isFinite(scheduledAt.getTime()) || scheduledAt.getTime() <= (input.now ?? new Date()).getTime()) {
      return { allowed: false, code: "SCHEDULE_MUST_BE_FUTURE" };
    }
  }

  return { allowed: true, code: "ALLOWED" };
}

export function normalizeLegacyStoryStatus(authorType: StoryAuthorType, status: string): StoryStatus {
  if (authorType === "tourist") {
    if (status === "published") return "published";
    if (status === "rejected") return "rejected";
    return "submitted";
  }

  if (status === "pending") return "in_review";
  if (status === "published") return "published";
  if (status === "rejected") return "archived";
  return "draft";
}
