import { describe, expect, it } from "vitest";
import { createManagedStoryImageNode } from "@/lib/content/managed-story-image";

describe("managed story image", () => {
  it("creates a canonical version 2 image node from Media Library data", () => {
    expect(
      createManagedStoryImageNode({
        assetId: "f04a9a4e-4e2a-4f7f-9fb5-000000000042",
        storagePath: "stories/pattani.webp",
        alt: "มัสยิดกลางปัตตานียามเย็น",
        caption: "ภาพจากทีมงานในพื้นที่",
      }),
    ).toEqual({
      type: "image",
      attrs: {
        assetId: "f04a9a4e-4e2a-4f7f-9fb5-000000000042",
        storagePath: "stories/pattani.webp",
        alt: "มัสยิดกลางปัตตานียามเย็น",
        caption: "ภาพจากทีมงานในพื้นที่",
      },
    });
  });

  it("rejects blank alt text and unsafe paths", () => {
    expect(() =>
      createManagedStoryImageNode({
        assetId: "f04a9a4e-4e2a-4f7f-9fb5-000000000042",
        storagePath: "stories/pattani.webp",
        alt: " ",
      }),
    ).toThrow("INVALID_MANAGED_STORY_IMAGE");
    expect(() =>
      createManagedStoryImageNode({
        assetId: "f04a9a4e-4e2a-4f7f-9fb5-000000000042",
        storagePath: "../private/pattani.webp",
        alt: "รูปภาพ",
      }),
    ).toThrow("INVALID_MANAGED_STORY_IMAGE");
  });
});
