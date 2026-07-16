import { describe, expect, it } from "vitest";
import { evaluateStoryReadiness } from "@/lib/content/story-readiness";

const completeStory = {
  title: "เสน่ห์เมืองเก่าปัตตานี",
  slug: "pattani-old-town-guide",
  excerpt: "คู่มือเดินเที่ยวเมืองเก่าปัตตานีแบบเข้าใจง่าย",
  contentDocument: {
    type: "doc",
    version: 1,
    content: [{ type: "paragraph", content: [{ type: "text", text: "เนื้อหาฉบับเต็ม" }] }],
  },
  legacyContent: null,
  cover: { mediaId: 10, isActive: true, altText: "อาคารเมืองเก่าปัตตานี" },
  provinceId: 2,
  geographicScope: "province" as const,
  topicIds: [1],
  seoDescription: "สำรวจเมืองเก่าปัตตานี ประวัติศาสตร์ อาหาร และจุดแวะสำคัญ",
  usesGeneratedSeo: false,
};

describe("story publishing readiness", () => {
  it("marks a complete story ready for review and publishing", () => {
    const result = evaluateStoryReadiness(completeStory);

    expect(result.readyForReview).toBe(true);
    expect(result.readyForPublish).toBe(true);
    expect(result.score).toBe(100);
    expect(result.blocking).toEqual([]);
  });

  it("allows legacy HTML while structured content is being migrated", () => {
    const result = evaluateStoryReadiness({
      ...completeStory,
      contentDocument: null,
      legacyContent: "<p>บทความเดิมที่ผ่านการตรวจแล้ว</p>",
    });

    expect(result.readyForPublish).toBe(true);
    expect(result.items.find((item) => item.key === "content")?.source).toBe("legacy");
  });

  it("blocks publication when cover media is inactive or missing alt text", () => {
    const inactive = evaluateStoryReadiness({ ...completeStory, cover: { ...completeStory.cover, isActive: false } });
    const missingAlt = evaluateStoryReadiness({ ...completeStory, cover: { ...completeStory.cover, altText: "" } });

    expect(inactive.blocking).toContain("cover_active");
    expect(missingAlt.blocking).toContain("cover_alt");
    expect(inactive.readyForPublish).toBe(false);
    expect(missingAlt.readyForPublish).toBe(false);
  });

  it("requires a province unless the story is explicitly cross-province", () => {
    expect(evaluateStoryReadiness({ ...completeStory, provinceId: null }).blocking).toContain("geography");
    expect(
      evaluateStoryReadiness({ ...completeStory, provinceId: null, geographicScope: "cross_province" }).blocking
    ).not.toContain("geography");
  });

  it("accepts an explicit generated SEO fallback but still reports missing topics", () => {
    const result = evaluateStoryReadiness({
      ...completeStory,
      seoDescription: null,
      usesGeneratedSeo: true,
      topicIds: [],
    });

    expect(result.blocking).not.toContain("seo");
    expect(result.blocking).toContain("topic");
    expect(result.readyForPublish).toBe(false);
  });

  it("distinguishes review readiness from publish readiness", () => {
    const result = evaluateStoryReadiness({
      ...completeStory,
      cover: null,
      seoDescription: null,
      usesGeneratedSeo: false,
    });

    expect(result.readyForReview).toBe(true);
    expect(result.readyForPublish).toBe(false);
    expect(result.blocking).toEqual(expect.arrayContaining(["cover", "seo"]));
  });

  it("does not treat an empty structured document as publishable content", () => {
    const emptyDocument = evaluateStoryReadiness({
      ...completeStory,
      contentDocument: { type: "doc", version: 1, content: [] },
      legacyContent: null,
    });
    const whitespaceDocument = evaluateStoryReadiness({
      ...completeStory,
      contentDocument: {
        type: "doc",
        version: 1,
        content: [{ type: "paragraph", content: [{ type: "text", text: "   " }] }],
      },
      legacyContent: null,
    });

    expect(emptyDocument.blocking).toContain("content");
    expect(whitespaceDocument.blocking).toContain("content");
    expect(emptyDocument.readyForReview).toBe(false);
    expect(whitespaceDocument.readyForPublish).toBe(false);
  });
});
