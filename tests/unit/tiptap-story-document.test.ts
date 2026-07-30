import { describe, expect, it } from "vitest";
import {
  fromTiptapJson,
  toTiptapJson,
} from "@/lib/content/tiptap-story-document";

describe("TipTap story document compatibility", () => {
  it("adds the canonical schema version and preserves supported content", () => {
    expect(
      fromTiptapJson({
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 2 },
            content: [{ type: "text", text: "เมืองเก่า" }],
          },
          {
            type: "paragraph",
            content: [{ type: "text", text: "เดินชมชุมชน" }],
          },
        ],
      }),
    ).toEqual({
      type: "doc",
      version: 2,
      content: [
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "เมืองเก่า" }],
        },
        { type: "paragraph", content: [{ type: "text", text: "เดินชมชุมชน" }] },
      ],
    });
  });

  it("keeps safe link fields but removes TipTap rendering-only attributes", () => {
    const document = fromTiptapJson({
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "อ่านต่อ",
              marks: [
                {
                  type: "link",
                  attrs: {
                    href: "https://example.com/story",
                    target: "_blank",
                    rel: "noopener",
                    class: "link",
                  },
                },
              ],
            },
          ],
        },
      ],
    });

    expect(document.content[0]).toEqual({
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "อ่านต่อ",
          marks: [
            {
              type: "link",
              attrs: { href: "https://example.com/story", target: "_blank" },
            },
          ],
        },
      ],
    });
  });

  it("rejects unsupported editor nodes instead of silently losing content", () => {
    expect(() =>
      fromTiptapJson({
        type: "doc",
        content: [{ type: "codeBlock", content: [] }],
      }),
    ).toThrow("INVALID_STORY_DOCUMENT");
  });

  it("accepts TipTap default ordered-list attributes without storing rendering details", () => {
    expect(
      fromTiptapJson({
        type: "doc",
        content: [
          {
            type: "orderedList",
            attrs: { start: 1, type: null },
            content: [
              {
                type: "listItem",
                content: [
                  {
                    type: "paragraph",
                    content: [{ type: "text", text: "จุดแรก" }],
                  },
                ],
              },
            ],
          },
        ],
      }).content[0],
    ).toEqual({
      type: "orderedList",
      content: [
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "จุดแรก" }],
            },
          ],
        },
      ],
    });
  });

  it("rejects non-default ordered-list numbering until the canonical schema supports it", () => {
    expect(() =>
      fromTiptapJson({
        type: "doc",
        content: [
          {
            type: "orderedList",
            attrs: { start: 3, type: null },
            content: [],
          },
        ],
      }),
    ).toThrow("INVALID_STORY_DOCUMENT");
  });

  it("removes the storage-only version before loading TipTap", () => {
    expect(toTiptapJson({ type: "doc", version: 1, content: [] })).toEqual({
      type: "doc",
      content: [],
    });
  });

  it("stores managed Media Library identity and removes rendering-only src", () => {
    const document = fromTiptapJson({
      type: "doc",
      content: [
        {
          type: "image",
          attrs: {
            src: "/site-media/stories/pattani.webp",
            assetId: "f04a9a4e-4e2a-4f7f-9fb5-000000000042",
            storagePath: "stories/pattani.webp",
            alt: "มัสยิดกลางปัตตานี",
            caption: "แสงเย็นบริเวณมัสยิด",
            title: "rendering-only",
          },
        },
      ],
    });

    expect(document).toEqual({
      type: "doc",
      version: 2,
      content: [
        {
          type: "image",
          attrs: {
            assetId: "f04a9a4e-4e2a-4f7f-9fb5-000000000042",
            storagePath: "stories/pattani.webp",
            alt: "มัสยิดกลางปัตตานี",
            caption: "แสงเย็นบริเวณมัสยิด",
          },
        },
      ],
    });
    expect(toTiptapJson(document).content[0]).toEqual(
      expect.objectContaining({
        type: "image",
        attrs: expect.objectContaining({
          src: "/site-media/stories/pattani.webp",
          assetId: "f04a9a4e-4e2a-4f7f-9fb5-000000000042",
        }),
      }),
    );
  });
});
