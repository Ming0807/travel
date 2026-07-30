import { beforeEach, describe, expect, it, vi } from "vitest";
import type { StoryEditorialState } from "@/lib/services/story-editorial.service";

const {
  requirePermission,
  getAdminStoryById,
  toStoryEditorialState,
  applyChange,
  logAdminMutation,
  revalidatePath,
  listRecommendations,
  replaceRecommendations,
} = vi.hoisted(() => ({
  requirePermission: vi.fn(),
  getAdminStoryById: vi.fn(),
  toStoryEditorialState: vi.fn(),
  applyChange: vi.fn(),
  logAdminMutation: vi.fn(),
  revalidatePath: vi.fn(),
  listRecommendations: vi.fn(),
  replaceRecommendations: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath }));
vi.mock("@/lib/auth/guards", () => ({
  requirePermission,
  AdminAuthError: class AdminAuthError extends Error {},
}));
vi.mock("@/lib/services/audit-log.service", () => ({ logAdminMutation }));
vi.mock("@/lib/repositories/admin-media.repository", () => ({
  clearCoverMediaForEntity: vi.fn(),
  linkMediaToEntity: vi.fn(),
  linkMediaToEntityByStoragePath: vi.fn(),
}));
vi.mock("@/lib/repositories/admin-story.repository", () => ({
  createAdminStory: vi.fn(),
  updateAdminStory: vi.fn(),
  updateAdminStoryStatus: vi.fn(),
  findStoryBySlug: vi.fn(),
  getAdminStoryById,
  toStoryEditorialState,
}));
vi.mock("@/lib/repositories/story-revision.repository", () => ({
  storyEditorialChangeStore: { applyChange },
}));
vi.mock("@/lib/repositories/story-recommendation.repository", () => ({
  listAdminStoryRecommendations: listRecommendations,
  replaceStoryRecommendations: replaceRecommendations,
  searchStoryRecommendationCandidates: vi.fn(),
}));

import {
  saveStoryEditorialChangeAction,
  saveStoryRecommendationsAction,
} from "@/app/actions/admin-story-actions";

const current: StoryEditorialState = {
  storyId: 12,
  authorType: "admin",
  status: "draft",
  updatedAt: "2026-07-17T00:00:00.000Z",
  title: "เรื่องเดิม",
  slug: "original-story",
  excerpt: null,
  legacyContent: null,
  contentDocument: null,
  contentSchemaVersion: 1,
  provinceId: 2,
  geographicScope: "province",
  topicIds: [],
  seoTitle: null,
  seoDescription: null,
  usesGeneratedSeo: false,
  primaryLanguage: "th",
  scheduledAt: null,
  readingMinutes: null,
  contentQualityScore: null,
  cover: null,
};

describe("saveStoryEditorialChangeAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requirePermission.mockResolvedValue({ actor: { adminId: "admin-id" } });
    getAdminStoryById.mockResolvedValue({ story_id: 12, slug: "original-story" });
    toStoryEditorialState.mockReturnValue(current);
    applyChange.mockResolvedValue({
      kind: "updated",
      updatedAt: "2026-07-17T01:00:00.000Z",
      revisionNumber: 4,
    });
  });

  it("validates, authorizes, saves one atomic revision, and audits metadata only", async () => {
    const result = await saveStoryEditorialChangeAction({
      storyId: 12,
      expectedUpdatedAt: current.updatedAt,
      change: { title: "เรื่องใหม่", changeSummary: "ปรับชื่อเรื่อง" },
    });

    expect(result).toEqual({
      success: true,
      data: { updatedAt: "2026-07-17T01:00:00.000Z", revisionNumber: 4 },
    });
    expect(requirePermission).toHaveBeenNthCalledWith(1, "story.read");
    expect(requirePermission).toHaveBeenNthCalledWith(2, "story.update");
    expect(applyChange).toHaveBeenCalledOnce();
    expect(logAdminMutation).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "story.editorial.save",
        entityId: 12,
        oldValues: { status: "draft", updatedAt: current.updatedAt },
        newValues: expect.objectContaining({
          status: "draft",
          revisionNumber: 4,
          changedFields: ["title", "changeSummary"],
        }),
      })
    );
    expect(logAdminMutation.mock.calls[0]?.[0]).not.toHaveProperty("contentDocument");
    expect(revalidatePath).toHaveBeenCalledWith("/stories", "layout");
    expect(revalidatePath).toHaveBeenCalledWith("/stories/original-story");
    expect(revalidatePath).toHaveBeenCalledWith("/attractions", "layout");
  });

  it("returns a stable validation error without reading the story", async () => {
    const result = await saveStoryEditorialChangeAction({ storyId: 0, expectedUpdatedAt: "bad", change: {} });

    expect(result).toMatchObject({ success: false, error: "ข้อมูลการแก้ไขไม่ถูกต้อง" });
    expect(requirePermission).not.toHaveBeenCalled();
    expect(getAdminStoryById).not.toHaveBeenCalled();
  });

  it("protects and atomically replaces curated recommendations with an audit record", async () => {
    const before = [
      {
        targetStoryId: 20,
        title: "เรื่องเดิม",
        slug: "old-story",
        provinceName: "ยะลา",
        displayOrder: 0,
        reason: null,
      },
    ];
    const after = [
      {
        targetStoryId: 21,
        title: "เรื่องใหม่",
        slug: "new-story",
        provinceName: "ปัตตานี",
        displayOrder: 0,
        reason: "อ่านต่อในหัวข้อเดียวกัน",
      },
    ];
    listRecommendations
      .mockResolvedValueOnce(before)
      .mockResolvedValueOnce(after);

    const result = await saveStoryRecommendationsAction({
      sourceStoryId: 12,
      items: [
        {
          targetStoryId: 21,
          displayOrder: 0,
          reason: "อ่านต่อในหัวข้อเดียวกัน",
        },
      ],
    });

    expect(requirePermission).toHaveBeenCalledWith("story.recommend_manage");
    expect(replaceRecommendations).toHaveBeenCalledWith(
      expect.objectContaining({ sourceStoryId: 12 }),
      "admin-id"
    );
    expect(logAdminMutation).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "story.recommendations.update",
        entityId: 12,
      })
    );
    expect(revalidatePath).toHaveBeenCalledWith("/stories", "layout");
    expect(result).toEqual({ success: true, data: after });
  });
});
