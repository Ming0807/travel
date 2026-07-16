import { describe, expect, it } from "vitest";
import { mapAdminStoryRow, toStoryEditorialState } from "@/lib/repositories/admin-story.repository";

describe("admin story editorial mapping", () => {
  it("maps editorial fields, taxonomy, cover readiness, and a stable edit version", () => {
    const row = mapAdminStoryRow({
      story_id: 9,
      slug: "pattani-guide",
      title: "คู่มือเที่ยวปัตตานี",
      excerpt: "สรุปเนื้อหา",
      content: "<p>เนื้อหาเดิม</p>",
      content_document: { type: "doc", version: 1, content: [] },
      content_schema_version: 1,
      province_id: 2,
      category: "Culture",
      is_published: false,
      published_at: null,
      first_published_at: null,
      scheduled_at: null,
      archived_at: null,
      created_at: "2026-07-16T10:00:00.000Z",
      updated_at: null,
      author_type: "admin",
      tourist_id: null,
      status: "draft",
      primary_language: "th",
      geographic_scope: "province",
      seo_title: "เที่ยวปัตตานี",
      seo_description: "ข้อมูลเที่ยวปัตตานี",
      reading_minutes: 5,
      content_quality_score: 80,
      reviewed_by: null,
      reviewed_at: null,
      provinces: { province_name_th: "ปัตตานี" },
      tourists: null,
      story_topic_links: [{ topic_id: 4 }, { topic_id: 2 }],
      content_media: [
        {
          media_id: 31,
          is_cover: true,
          is_active: true,
          lifecycle_status: "active",
          alt_text_th: "เมืองเก่าปัตตานี",
          alt_text_en: null,
        },
      ],
    });
    const state = toStoryEditorialState(row);

    expect(row.topic_ids).toEqual([4, 2]);
    expect(state.updatedAt).toBe("2026-07-16T10:00:00.000Z");
    expect(state.contentSchemaVersion).toBe(1);
    expect(state.cover).toEqual({ mediaId: 31, isActive: true, altText: "เมืองเก่าปัตตานี" });
    expect(state.topicIds).toEqual([4, 2]);
  });

  it("ignores inactive cover candidates and normalizes unsupported legacy status safely", () => {
    const row = mapAdminStoryRow({
      story_id: 10,
      slug: "traveler-story",
      title: "เรื่องเล่าจากนักเดินทาง",
      created_at: "2026-07-16T10:00:00.000Z",
      author_type: "tourist",
      status: "pending",
      content_media: [
        { media_id: 40, is_cover: true, is_active: false, lifecycle_status: "archived", alt_text_th: "ภาพเก่า" },
      ],
    });
    const state = toStoryEditorialState(row);

    expect(state.status).toBe("submitted");
    expect(state.cover).toBeNull();
  });
});
