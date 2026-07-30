import { describe, expect, it } from "vitest";
import {
  STORY_DOCUMENT_SCHEMA_VERSION,
  parseStoryDocument,
  storyDocumentSchema,
} from "@/lib/content/story-document";

describe("story structured document contract", () => {
  it("accepts the supported editorial node and mark set", () => {
    const document = parseStoryDocument({
      type: "doc",
      version: STORY_DOCUMENT_SCHEMA_VERSION,
      content: [
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "เที่ยวชายแดนใต้" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "อ่านรายละเอียด ",
              marks: [{ type: "bold" }],
            },
            {
              type: "text",
              text: "เพิ่มเติม",
              marks: [
                {
                  type: "link",
                  attrs: { href: "/attractions", target: "_self" },
                },
              ],
            },
          ],
        },
        {
          type: "image",
          attrs: {
            assetId: "f04a9a4e-4e2a-4f7f-9fb5-000000000042",
            storagePath: "stories/pattani-old-town.webp",
            alt: "วิวทะเลหมอกอัยเยอร์เวง",
            caption: "ทะเลหมอกยามเช้า",
          },
        },
        {
          type: "blockquote",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "เดินทางอย่างรับผิดชอบ" }],
            },
          ],
        },
      ],
    });

    expect(document.version).toBe(2);
    expect(document.content).toHaveLength(4);
  });

  it("keeps version 1 numeric media references readable during migration", () => {
    expect(
      storyDocumentSchema.safeParse({
        type: "doc",
        version: 1,
        content: [
          {
            type: "image",
            attrs: { mediaId: 42, alt: "รูปภาพเดิม" },
          },
        ],
      }).success,
    ).toBe(true);
  });

  it("rejects scripts, embeds, and unknown node types", () => {
    for (const type of ["script", "iframe", "html", "video", "unknown"]) {
      expect(
        storyDocumentSchema.safeParse({
          type: "doc",
          version: 1,
          content: [{ type, attrs: { src: "https://example.com" } }],
        }).success,
      ).toBe(false);
    }
  });

  it("rejects unknown keys and unmanaged images", () => {
    expect(() =>
      parseStoryDocument({
        type: "doc",
        version: 1,
        content: [{ type: "paragraph", onclick: "alert(1)", content: [] }],
      }),
    ).toThrow();

    expect(() =>
      parseStoryDocument({
        type: "doc",
        version: STORY_DOCUMENT_SCHEMA_VERSION,
        content: [
          {
            type: "image",
            attrs: { src: "https://unmanaged.example/image.jpg", alt: "x" },
          },
        ],
      }),
    ).toThrow();

    expect(() =>
      parseStoryDocument({
        type: "doc",
        version: STORY_DOCUMENT_SCHEMA_VERSION,
        content: [
          {
            type: "image",
            attrs: {
              assetId: "f04a9a4e-4e2a-4f7f-9fb5-000000000042",
              storagePath: "../private/photo.webp",
              alt: "รูปภาพ",
            },
          },
        ],
      }),
    ).toThrow();
  });

  it("rejects unsafe links but accepts relative and HTTPS links", () => {
    const makeDocument = (href: string) => ({
      type: "doc",
      version: 1,
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "link",
              marks: [{ type: "link", attrs: { href } }],
            },
          ],
        },
      ],
    });

    expect(
      storyDocumentSchema.safeParse(makeDocument("javascript:alert(1)"))
        .success,
    ).toBe(false);
    expect(
      storyDocumentSchema.safeParse(makeDocument("data:text/html,bad")).success,
    ).toBe(false);
    expect(
      storyDocumentSchema.safeParse(makeDocument("/stories/pattani")).success,
    ).toBe(true);
    expect(
      storyDocumentSchema.safeParse(
        makeDocument("https://tourism.example/story"),
      ).success,
    ).toBe(true);
  });

  it("limits heading levels, depth, and total nodes", () => {
    expect(
      storyDocumentSchema.safeParse({
        type: "doc",
        version: 1,
        content: [{ type: "heading", attrs: { level: 1 }, content: [] }],
      }).success,
    ).toBe(false);

    let nested: unknown = { type: "paragraph", content: [] };
    for (let index = 0; index < 15; index += 1) {
      nested = { type: "blockquote", content: [nested] };
    }
    expect(
      storyDocumentSchema.safeParse({
        type: "doc",
        version: 1,
        content: [nested],
      }).success,
    ).toBe(false);

    expect(
      storyDocumentSchema.safeParse({
        type: "doc",
        version: 1,
        content: Array.from({ length: 2_001 }, () => ({
          type: "paragraph",
          content: [],
        })),
      }).success,
    ).toBe(false);
  });

  it("rejects inline nodes at the document root", () => {
    expect(
      storyDocumentSchema.safeParse({
        type: "doc",
        version: 1,
        content: [{ type: "text", text: "ข้อความที่ไม่มี block ครอบ" }],
      }).success,
    ).toBe(false);
  });
});
