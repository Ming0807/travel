import { describe, expect, it } from "vitest";
import { extractStoryOutline } from "@/lib/content/story-outline";

describe("story structured outline", () => {
  it("extracts ordered heading levels and plain text from a valid story document", () => {
    expect(
      extractStoryOutline({
        type: "doc",
        version: 1,
        content: [
          {
            type: "heading",
            attrs: { level: 2 },
            content: [
              { type: "text", text: "เสน่ห์เมืองเก่า", marks: [{ type: "bold" }] },
            ],
          },
          { type: "paragraph", content: [{ type: "text", text: "เนื้อหา" }] },
          {
            type: "heading",
            attrs: { level: 3 },
            content: [
              { type: "text", text: "จุดที่ไม่ควรพลาด" },
              { type: "hardBreak" },
              { type: "text", text: "ในหนึ่งวัน" },
            ],
          },
        ],
      })
    ).toEqual([
      { key: "heading-1", level: 2, text: "เสน่ห์เมืองเก่า" },
      { key: "heading-2", level: 3, text: "จุดที่ไม่ควรพลาด ในหนึ่งวัน" },
    ]);
  });

  it("returns an empty outline for invalid or heading-free content", () => {
    expect(extractStoryOutline(null)).toEqual([]);
    expect(
      extractStoryOutline({
        type: "doc",
        version: 1,
        content: [{ type: "paragraph", content: [{ type: "text", text: "เนื้อหา" }] }],
      })
    ).toEqual([]);
  });
});
