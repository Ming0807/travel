import { describe, expect, it } from "vitest";
import {
  mapStoryTag,
  mapStoryTopic,
} from "@/lib/repositories/story-taxonomy.repository";

describe("story taxonomy repository mapping", () => {
  it("maps a topic into a stable Thai-first editorial option", () => {
    expect(
      mapStoryTopic({
        topic_id: "4",
        topic_key: "community",
        name_th: "ชุมชนและความยั่งยืน",
        name_en: "Community and Sustainability",
        description: "เรื่องราวจากชุมชน",
        display_order: 40,
        is_active: true,
      })
    ).toEqual({
      id: 4,
      key: "community",
      nameTh: "ชุมชนและความยั่งยืน",
      nameEn: "Community and Sustainability",
      description: "เรื่องราวจากชุมชน",
      displayOrder: 40,
      isActive: true,
    });
  });

  it("maps a tag without leaking database field names", () => {
    expect(
      mapStoryTag({
        tag_id: 8,
        tag_key: "family-trip",
        name_th: "เที่ยวครอบครัว",
        name_en: null,
        is_active: false,
      })
    ).toEqual({
      id: 8,
      key: "family-trip",
      nameTh: "เที่ยวครอบครัว",
      nameEn: null,
      isActive: false,
    });
  });
});
