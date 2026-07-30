import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  StoryDocumentRenderer,
  buildStoryTableOfContents,
} from "@/components/stories/StoryDocumentRenderer";
import type { StoryDocument } from "@/lib/content/story-document";

const document: StoryDocument = {
  type: "doc",
  version: 2,
  content: [
    {
      type: "heading",
      attrs: { level: 2 },
      content: [{ type: "text", text: "เสน่ห์เมืองเก่า" }],
    },
    {
      type: "paragraph",
      content: [
        { type: "text", text: "เดินชมชุมชน " },
        {
          type: "text",
          text: "อ่านข้อมูล",
          marks: [
            {
              type: "link",
              attrs: { href: "https://example.com/guide", target: "_blank" },
            },
          ],
        },
      ],
    },
    {
      type: "image",
      attrs: {
        assetId: "f04a9a4e-4e2a-4f7f-9fb5-000000000042",
        storagePath: "stories/pattani.webp",
        alt: "อาคารเก่าในย่านปัตตานี",
        caption: "สถาปัตยกรรมในชุมชนเมืองเก่า",
      },
    },
  ],
};

describe("public structured story rendering", () => {
  it("builds stable table-of-contents anchors from supported headings", () => {
    expect(buildStoryTableOfContents(document)).toEqual([
      {
        id: "story-section-1",
        level: 2,
        label: "เสน่ห์เมืองเก่า",
      },
    ]);
  });

  it("renders managed images with alt text, dimensions, and captions", () => {
    render(<StoryDocumentRenderer document={document} />);

    expect(
      screen.getByRole("heading", { name: "เสน่ห์เมืองเก่า" })
    ).toHaveAttribute("id", "story-section-1");
    expect(
      screen.getByRole("img", { name: "อาคารเก่าในย่านปัตตานี" })
    ).toHaveAttribute("src", expect.stringContaining("pattani.webp"));
    expect(screen.getByText("สถาปัตยกรรมในชุมชนเมืองเก่า")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "อ่านข้อมูล" })).toHaveAttribute(
      "rel",
      "noopener noreferrer"
    );
  });
});
