import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AtomicStoryEditorialChange } from "@/lib/services/story-editorial.service";

const rpc = vi.fn();

vi.mock("@/lib/supabase/service-role", () => ({
  createSupabaseServiceRoleClient: () => ({ rpc }),
}));

import { applyStoryEditorialChangeTransaction } from "@/lib/repositories/story-revision.repository";

const input: AtomicStoryEditorialChange = {
  storyId: 12,
  expectedUpdatedAt: "2026-07-17T00:00:00.000Z",
  actorId: "01000000-0000-4000-8000-000000000001",
  patch: {
    title: "เมืองเก่าปัตตานี",
    slug: "pattani-old-town",
    excerpt: "คู่มือเที่ยวเมืองเก่า",
    legacyContent: null,
    contentDocument: { type: "doc", version: 1, content: [] },
    contentSchemaVersion: 1,
    provinceId: 2,
    geographicScope: "province",
    topicIds: [4, 2],
    seoTitle: "เที่ยวเมืองเก่าปัตตานี",
    seoDescription: "ข้อมูลสำหรับวางแผนเที่ยวเมืองเก่าปัตตานี",
    usesGeneratedSeo: false,
    primaryLanguage: "th",
    scheduledAt: null,
    readingMinutes: 4,
    contentQualityScore: 90,
    status: "draft",
  },
  snapshot: {
    title: "เมืองเก่าปัตตานี",
    slug: "pattani-old-town",
    excerpt: "คู่มือเที่ยวเมืองเก่า",
    legacyContent: null,
    contentDocument: { type: "doc", version: 1, content: [] },
    contentSchemaVersion: 1,
    provinceId: 2,
    geographicScope: "province",
    topicIds: [4, 2],
    seoTitle: "เที่ยวเมืองเก่าปัตตานี",
    seoDescription: "ข้อมูลสำหรับวางแผนเที่ยวเมืองเก่าปัตตานี",
    usesGeneratedSeo: false,
    primaryLanguage: "th",
    scheduledAt: null,
    readingMinutes: 4,
    contentQualityScore: 90,
    status: "draft",
    authorType: "admin",
    coverMediaId: 20,
  },
  sourceAction: "save",
  reviewNote: null,
  changeSummary: "ปรับชื่อเรื่อง",
};

describe("story revision repository", () => {
  beforeEach(() => vi.clearAllMocks());

  it("maps a complete change to explicit RPC parameters", async () => {
    rpc.mockResolvedValue({
      data: {
        success: true,
        updated_at: "2026-07-17T01:00:00.000Z",
        revision_number: 3,
      },
      error: null,
    });

    await expect(applyStoryEditorialChangeTransaction(input)).resolves.toEqual({
      kind: "updated",
      updatedAt: "2026-07-17T01:00:00.000Z",
      revisionNumber: 3,
    });
    expect(rpc).toHaveBeenCalledWith(
      "apply_story_editorial_change",
      expect.objectContaining({
        p_story_id: 12,
        p_expected_updated_at: input.expectedUpdatedAt,
        p_actor_id: input.actorId,
        p_content_document: input.patch.contentDocument,
        p_content_schema_version: 1,
        p_topic_ids: [4, 2],
        p_snapshot_extras: { coverMediaId: 20, usesGeneratedSeo: false },
        p_source_action: "save",
      })
    );
  });

  it("maps conflict and missing-story results without exposing database details", async () => {
    rpc.mockResolvedValueOnce({ data: { success: false, error_code: "EDIT_CONFLICT" }, error: null });
    await expect(applyStoryEditorialChangeTransaction(input)).resolves.toEqual({ kind: "conflict" });

    rpc.mockResolvedValueOnce({ data: { success: false, error_code: "STORY_NOT_FOUND" }, error: null });
    await expect(applyStoryEditorialChangeTransaction(input)).resolves.toEqual({ kind: "not_found" });
  });

  it("throws stable repository errors for transport and unknown RPC failures", async () => {
    rpc.mockResolvedValueOnce({ data: null, error: { message: "private database detail" } });
    await expect(applyStoryEditorialChangeTransaction(input)).rejects.toThrow("STORY_EDITORIAL_TRANSACTION_FAILED");

    rpc.mockResolvedValueOnce({ data: { success: false, error_code: "INVALID_TOPIC" }, error: null });
    await expect(applyStoryEditorialChangeTransaction(input)).rejects.toThrow("INVALID_TOPIC");
  });
});
