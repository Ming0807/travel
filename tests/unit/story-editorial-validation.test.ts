import { describe, expect, it } from "vitest";
import { storyEditorialChangeInputSchema } from "@/lib/validation/story";

const validInput = {
  storyId: 12,
  expectedUpdatedAt: "2026-07-17T00:00:00.000Z",
  change: { title: "คู่มือเที่ยวเมืองเก่าปัตตานี" },
};

describe("story editorial action validation", () => {
  it("accepts a bounded typed editorial change", () => {
    expect(storyEditorialChangeInputSchema.safeParse(validInput).success).toBe(true);
  });

  it("rejects empty, duplicate-taxonomy, and unsafe document changes", () => {
    expect(storyEditorialChangeInputSchema.safeParse({ ...validInput, change: {} }).success).toBe(false);
    expect(
      storyEditorialChangeInputSchema.safeParse({ ...validInput, change: { topicIds: [2, 2] } }).success
    ).toBe(false);
    expect(
      storyEditorialChangeInputSchema.safeParse({
        ...validInput,
        change: {
          contentDocument: {
            type: "doc",
            version: 1,
            content: [{ type: "image", attrs: { mediaId: 1, alt: "" } }],
          },
        },
      }).success
    ).toBe(false);
  });
});
