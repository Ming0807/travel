import { describe, expect, it, vi } from "vitest";
import {
  applyStoryEditorialChange,
  StoryEditorialServiceError,
  type StoryEditorialChangeStore,
  type StoryEditorialState,
} from "@/lib/services/story-editorial.service";

const completeState: StoryEditorialState = {
  storyId: 12,
  authorType: "admin",
  status: "draft",
  updatedAt: "2026-07-17T00:00:00.000Z",
  title: "เสน่ห์เมืองเก่าปัตตานี",
  slug: "pattani-old-town-guide",
  excerpt: "คู่มือเดินเที่ยวเมืองเก่าปัตตานี",
  legacyContent: null,
  contentDocument: {
    type: "doc",
    version: 1,
    content: [{ type: "paragraph", content: [{ type: "text", text: "เนื้อหาฉบับเต็ม" }] }],
  },
  contentSchemaVersion: 1,
  provinceId: 2,
  geographicScope: "province",
  topicIds: [1],
  seoTitle: "เที่ยวเมืองเก่าปัตตานี",
  seoDescription: "คู่มือเที่ยวเมืองเก่าปัตตานี พร้อมประวัติศาสตร์และจุดแวะสำคัญ",
  usesGeneratedSeo: false,
  primaryLanguage: "th",
  scheduledAt: null,
  readingMinutes: 5,
  contentQualityScore: 100,
  cover: { mediaId: 20, isActive: true, altText: "อาคารเมืองเก่าปัตตานี" },
};

function createStore(result: Awaited<ReturnType<StoryEditorialChangeStore["applyChange"]>> = {
  kind: "updated",
  updatedAt: "2026-07-17T01:00:00.000Z",
  revisionNumber: 3,
}) {
  return {
    applyChange: vi.fn().mockResolvedValue(result),
  } satisfies StoryEditorialChangeStore;
}

describe("story editorial service", () => {
  it("saves an ordinary draft edit as one atomic revision", async () => {
    const store = createStore();
    const result = await applyStoryEditorialChange({
      actorId: "01000000-0000-4000-8000-000000000001",
      current: completeState,
      change: { title: "เสน่ห์เมืองเก่าปัตตานี ฉบับสมบูรณ์", changeSummary: "ปรับชื่อเรื่อง" },
      store,
    });

    expect(result).toEqual({
      updatedAt: "2026-07-17T01:00:00.000Z",
      revisionNumber: 3,
    });
    expect(store.applyChange).toHaveBeenCalledOnce();
    expect(store.applyChange).toHaveBeenCalledWith(
      expect.objectContaining({
        storyId: 12,
        expectedUpdatedAt: completeState.updatedAt,
        actorId: "01000000-0000-4000-8000-000000000001",
        sourceAction: "save",
        patch: expect.objectContaining({ title: "เสน่ห์เมืองเก่าปัตตานี ฉบับสมบูรณ์", status: "draft" }),
        snapshot: expect.objectContaining({ title: "เสน่ห์เมืองเก่าปัตตานี ฉบับสมบูรณ์", status: "draft" }),
      })
    );
  });

  it("blocks an invalid transition before calling persistence", async () => {
    const store = createStore();

    await expect(
      applyStoryEditorialChange({
        actorId: "admin-id",
        current: completeState,
        change: { targetStatus: "published" },
        store,
      })
    ).rejects.toMatchObject({ code: "INVALID_TRANSITION" });
    expect(store.applyChange).not.toHaveBeenCalled();
  });

  it("requires review-ready core content before submission", async () => {
    const store = createStore();
    const incomplete = { ...completeState, excerpt: "", contentDocument: null };

    await expect(
      applyStoryEditorialChange({
        actorId: "admin-id",
        current: incomplete,
        change: { targetStatus: "in_review" },
        store,
      })
    ).rejects.toMatchObject({ code: "NOT_READY_FOR_REVIEW", details: expect.arrayContaining(["excerpt", "content"]) });
    expect(store.applyChange).not.toHaveBeenCalled();
  });

  it("requires publish readiness before approval, scheduling, or publishing", async () => {
    const store = createStore();
    const incomplete = { ...completeState, status: "in_review" as const, cover: null, topicIds: [] };

    await expect(
      applyStoryEditorialChange({
        actorId: "admin-id",
        current: incomplete,
        change: { targetStatus: "approved" },
        store,
      })
    ).rejects.toMatchObject({ code: "NOT_READY_FOR_PUBLISH", details: expect.arrayContaining(["cover", "topic"]) });
    expect(store.applyChange).not.toHaveBeenCalled();
  });

  it("validates a future schedule and records a schedule revision", async () => {
    const store = createStore();
    const approved = { ...completeState, status: "approved" as const };

    await applyStoryEditorialChange({
      actorId: "admin-id",
      current: approved,
      change: { targetStatus: "scheduled", scheduledAt: "2026-07-20T09:00:00.000Z" },
      now: new Date("2026-07-17T09:00:00.000Z"),
      store,
    });

    expect(store.applyChange).toHaveBeenCalledWith(
      expect.objectContaining({
        sourceAction: "schedule",
        patch: expect.objectContaining({ status: "scheduled", scheduledAt: "2026-07-20T09:00:00.000Z" }),
      })
    );
  });

  it("clears a stale schedule when a scheduled story returns to draft", async () => {
    const store = createStore();
    const scheduled = {
      ...completeState,
      status: "scheduled" as const,
      scheduledAt: "2026-07-20T09:00:00.000Z",
    };

    await applyStoryEditorialChange({
      actorId: "admin-id",
      current: scheduled,
      change: { targetStatus: "draft" },
      store,
    });

    expect(store.applyChange).toHaveBeenCalledWith(
      expect.objectContaining({
        sourceAction: "moderate",
        patch: expect.objectContaining({ status: "draft", scheduledAt: null }),
        snapshot: expect.objectContaining({ status: "draft", scheduledAt: null }),
      })
    );
  });

  it("requires a reason when rejecting or requesting changes for traveler content", async () => {
    const store = createStore();
    const traveler = { ...completeState, authorType: "tourist" as const, status: "in_review" as const };

    await expect(
      applyStoryEditorialChange({
        actorId: "admin-id",
        current: traveler,
        change: { targetStatus: "rejected", reviewNote: "" },
        store,
      })
    ).rejects.toMatchObject({ code: "REVIEW_NOTE_REQUIRED" });
    expect(store.applyChange).not.toHaveBeenCalled();
  });

  it("turns optimistic-lock and missing-row results into stable service errors", async () => {
    for (const [kind, code] of [
      ["conflict", "EDIT_CONFLICT"],
      ["not_found", "STORY_NOT_FOUND"],
    ] as const) {
      const store = createStore({ kind });
      const operation = applyStoryEditorialChange({
        actorId: "admin-id",
        current: completeState,
        change: { title: "ชื่อใหม่" },
        store,
      });

      await expect(operation).rejects.toBeInstanceOf(StoryEditorialServiceError);
      await expect(operation).rejects.toMatchObject({ code });
    }
  });
});
