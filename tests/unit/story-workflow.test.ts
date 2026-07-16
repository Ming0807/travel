import { describe, expect, it } from "vitest";
import {
  evaluateStoryTransition,
  getAllowedStoryTransitions,
  normalizeLegacyStoryStatus,
} from "@/lib/content/story-workflow";

describe("story workflow", () => {
  it("supports the editorial review, schedule, publish, and archive path", () => {
    expect(getAllowedStoryTransitions("admin", "draft")).toEqual(["in_review", "archived"]);
    expect(evaluateStoryTransition({ authorType: "admin", from: "in_review", to: "approved" })).toEqual({
      allowed: true,
      code: "ALLOWED",
    });
    expect(
      evaluateStoryTransition({
        authorType: "admin",
        from: "approved",
        to: "scheduled",
        scheduledAt: "2026-07-20T09:00:00.000Z",
        now: new Date("2026-07-16T09:00:00.000Z"),
      })
    ).toEqual({ allowed: true, code: "ALLOWED" });
    expect(evaluateStoryTransition({ authorType: "admin", from: "approved", to: "published" }).allowed).toBe(true);
    expect(evaluateStoryTransition({ authorType: "admin", from: "published", to: "archived" }).allowed).toBe(true);
  });

  it("supports a separate tourist moderation path", () => {
    expect(getAllowedStoryTransitions("tourist", "submitted")).toEqual(["in_review", "archived"]);
    expect(evaluateStoryTransition({ authorType: "tourist", from: "in_review", to: "approved" }).allowed).toBe(true);
    expect(evaluateStoryTransition({ authorType: "tourist", from: "approved", to: "published" }).allowed).toBe(true);
    expect(evaluateStoryTransition({ authorType: "tourist", from: "submitted", to: "published" })).toEqual({
      allowed: false,
      code: "INVALID_TRANSITION",
    });
  });

  it("requires a moderation reason for rejection or change request", () => {
    expect(
      evaluateStoryTransition({ authorType: "tourist", from: "in_review", to: "rejected", reviewNote: "" })
    ).toEqual({ allowed: false, code: "REVIEW_NOTE_REQUIRED" });
    expect(
      evaluateStoryTransition({
        authorType: "tourist",
        from: "in_review",
        to: "changes_requested",
        reviewNote: "กรุณาระบุแหล่งที่มาของรูปภาพ",
      }).allowed
    ).toBe(true);
  });

  it("requires a valid future time for scheduled publishing", () => {
    const now = new Date("2026-07-16T09:00:00.000Z");
    expect(
      evaluateStoryTransition({ authorType: "admin", from: "approved", to: "scheduled", now })
    ).toEqual({ allowed: false, code: "SCHEDULE_REQUIRED" });
    expect(
      evaluateStoryTransition({
        authorType: "admin",
        from: "approved",
        to: "scheduled",
        scheduledAt: "2026-07-15T09:00:00.000Z",
        now,
      })
    ).toEqual({ allowed: false, code: "SCHEDULE_MUST_BE_FUTURE" });
  });

  it("normalizes existing production statuses without losing author context", () => {
    expect(normalizeLegacyStoryStatus("admin", "draft")).toBe("draft");
    expect(normalizeLegacyStoryStatus("admin", "pending")).toBe("in_review");
    expect(normalizeLegacyStoryStatus("tourist", "draft")).toBe("submitted");
    expect(normalizeLegacyStoryStatus("tourist", "pending")).toBe("submitted");
    expect(normalizeLegacyStoryStatus("tourist", "rejected")).toBe("rejected");
    expect(normalizeLegacyStoryStatus("admin", "published")).toBe("published");
  });
});
