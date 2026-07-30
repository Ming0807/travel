import { describe, expect, it } from "vitest";
import {
  getStoryReadinessAdminItems,
  getStoryRevisionActionLabel,
} from "@/lib/content/story-editorial-presentation";
import { evaluateStoryReadiness } from "@/lib/content/story-readiness";

describe("story editorial presentation", () => {
  it("maps publishing requirements to clear Thai admin guidance", () => {
    const readiness = evaluateStoryReadiness({
      title: "เมืองเก่าปัตตานี",
      slug: "pattani-old-town",
      excerpt: null,
      contentDocument: null,
      legacyContent: null,
      cover: null,
      provinceId: null,
      geographicScope: "province",
      topicIds: [],
      seoDescription: null,
      usesGeneratedSeo: false,
    });

    const items = getStoryReadinessAdminItems(readiness);

    expect(items.find((item) => item.key === "excerpt")).toEqual(
      expect.objectContaining({
        label: "เกริ่นนำ",
        complete: false,
        help: expect.stringContaining("สรุป"),
      })
    );
    expect(items.find((item) => item.key === "cover_alt")?.label).toBe(
      "คำอธิบายรูปปก"
    );
    expect(items).toHaveLength(10);
  });

  it("uses Thai labels for immutable revision source actions", () => {
    expect(getStoryRevisionActionLabel("save")).toBe("บันทึกการแก้ไข");
    expect(getStoryRevisionActionLabel("publish")).toBe("เผยแพร่");
    expect(getStoryRevisionActionLabel("unknown_action")).toBe("อัปเดตบทความ");
  });
});
