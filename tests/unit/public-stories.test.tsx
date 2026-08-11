import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PublicStoryCard } from "@/components/stories/PublicStoryCard";
import {
  LegacyStoryContent,
  StoryDocumentRenderer,
  buildStoryTableOfContents,
} from "@/components/stories/StoryDocumentRenderer";
import type { StoryDocument } from "@/lib/content/story-document";
import type { PublicStoryCard as PublicStoryCardData } from "@/lib/repositories/public-content.repository";

const story: PublicStoryCardData = {
  storyId: 7,
  id: "yala-local-story",
  title: "บันทึกจากยะลา",
  excerpt: "เรื่องเล่าจากการเดินทางในยะลา",
  province: "ยะลา",
  date: "10 ส.ค. 2569",
  publishedAt: "2026-08-10T00:00:00.000Z",
  updatedAt: "2026-08-11T00:00:00.000Z",
  imageUrl: "/site-media/stories/full.webp",
  thumbnailUrl: "/site-media/stories/thumb.webp",
  imageAlt: "วิวเมืองยะลา",
  category: "ชุมชน",
  authorType: "tourist",
  authorName: "นักเดินทาง",
  readingMinutes: 4,
  primaryLanguage: "th",
  primaryTopic: { key: "community", name: "ชุมชน" },
};

describe("public story presentation", () => {
  it("labels the lead item as latest and uses its managed thumbnail", () => {
    render(<PublicStoryCard story={story} featured label="เรื่องล่าสุด" />);

    expect(screen.getByText("เรื่องล่าสุด")).toBeInTheDocument();
    const image = screen.getByRole("img", { name: "วิวเมืองยะลา" });
    expect(image).toHaveAttribute(
      "src",
      expect.stringContaining("thumb.webp"),
    );
    expect(image).toHaveAttribute("loading", "eager");
    expect(screen.queryByText(/featured|เรื่องเด่น/i)).not.toBeInTheDocument();
  });

  it("renders legacy HTML as inert text instead of injecting markup", () => {
    const { container } = render(
      <LegacyStoryContent
        content={'<p>ยินดีต้อนรับ</p><img src=x onerror="alert(1)"><script>alert(2)</script>'}
        fallback=""
      />,
    );

    expect(screen.getByText("ยินดีต้อนรับ")).toBeInTheDocument();
    expect(container.querySelector("script")).toBeNull();
    expect(container.querySelector("img")).toBeNull();
    expect(container.innerHTML).not.toContain("onerror");
  });

  it("turns escaped legacy newlines into readable paragraphs", () => {
    const { container } = render(
      <LegacyStoryContent
        content={"ย่อหน้าแรก\\n\\nย่อหน้าที่สอง"}
        fallback=""
      />,
    );

    expect(screen.getByText("ย่อหน้าแรก")).toBeInTheDocument();
    expect(screen.getByText("ย่อหน้าที่สอง")).toBeInTheDocument();
    expect(container.querySelectorAll("p")).toHaveLength(2);
    expect(container).not.toHaveTextContent("\\n");
  });

  it("does not crash on an out-of-range legacy numeric entity", () => {
    expect(() =>
      render(
        <LegacyStoryContent
          content="ข้อความเดิม &#999999999; ยังอ่านต่อได้"
          fallback=""
        />,
      ),
    ).not.toThrow();
    expect(screen.getByText(/ข้อความเดิม/)).toBeInTheDocument();
  });

  it("only builds a table of contents when structured headings exist", () => {
    const document: StoryDocument = {
      type: "doc",
      version: 2,
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "เนื้อหาไม่มีหัวข้อ" }],
        },
      ],
    };

    expect(buildStoryTableOfContents(document)).toEqual([]);
    const { container } = render(<StoryDocumentRenderer document={document} />);
    expect(container.firstElementChild).toHaveClass("max-w-[70ch]");
  });
});
