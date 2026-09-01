import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PublicStoryCard } from "@/components/stories/PublicStoryCard";
import { StoryHero } from "@/components/stories/StoryHero";
import { StoryDiscoveryFilters } from "@/components/stories/StoryDiscoveryFilters";
import { StoryEditorialCta } from "@/components/stories/StoryEditorialCta";
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

const storyNoImage: PublicStoryCardData = {
  storyId: 8,
  id: "betong-food-guide",
  title: "คู่มือของกินเบตง",
  excerpt: "ชิมไก่เบตงและผักน้ำ",
  province: "ยะลา",
  date: "15 ส.ค. 2569",
  publishedAt: "2026-08-15T00:00:00.000Z",
  updatedAt: null,
  imageUrl: null,
  imageAlt: "คู่มือของกินเบตง",
  category: "อาหาร",
  authorType: "admin",
  authorName: "กองบรรณาธิการ",
  readingMinutes: 3,
  primaryLanguage: "th",
  primaryTopic: { key: "food", name: "อาหาร" },
};

describe("public story presentation", () => {
  it("labels the lead item as latest and uses its full managed image", () => {
    render(<PublicStoryCard story={story} featured label="เรื่องล่าสุด" />);

    expect(screen.getByText("เรื่องล่าสุด")).toBeInTheDocument();
    const image = screen.getByRole("img", { name: "วิวเมืองยะลา" });
    expect(image).toHaveAttribute(
      "src",
      expect.stringContaining("full.webp"),
    );
    expect(image).not.toHaveAttribute("loading", "lazy");
    expect(screen.queryByText(/featured|เรื่องเด่น/i)).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /อ่านเรื่องราวฉบับเต็ม/ })).toHaveAttribute(
      "href",
      "/stories/yala-local-story",
    );
  });

  it("renders standard PublicStoryCard with topic badge, author source, and link", () => {
    render(<PublicStoryCard story={story} />);

    expect(screen.getByRole("heading", { name: story.title })).toBeInTheDocument();
    expect(screen.getByText("ชุมชน")).toBeInTheDocument();
    expect(screen.getByText("จากนักเดินทาง")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: `อ่านเรื่องราว ${story.title}` })).toHaveAttribute(
      "href",
      "/stories/yala-local-story",
    );
  });

  it("renders PublicStoryCard with missing image fallback gracefully", () => {
    render(<PublicStoryCard story={storyNoImage} />);

    expect(screen.getByRole("heading", { name: storyNoImage.title })).toBeInTheDocument();
    expect(screen.getByText("อาหารและของกินถิ่นใต้")).toBeInTheDocument();
    expect(screen.getByText("กองบรรณาธิการ")).toBeInTheDocument();
  });

  it("renders StoryHero with breadcrumbs, feature capsules, and participation links", () => {
    render(
      <StoryHero
        title="เรื่องราวจากยะลา"
        description="อ่านพื้นที่ผ่านผู้คน อาหาร วัฒนธรรม"
      />,
    );

    expect(screen.getByRole("heading", { name: "เรื่องราวจากยะลา" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "หน้าแรก" })).toHaveAttribute("href", "/");
    expect(screen.getByText("เนื้อหาที่เผยแพร่")).toBeInTheDocument();
    expect(screen.getByText("จังหวัดยะลา")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /แบ่งปันเรื่องราวของคุณ/ })).toHaveAttribute(
      "href",
      "/stories/share",
    );
    expect(screen.getByRole("link", { name: "เรื่องราวของฉัน" })).toHaveAttribute(
      "href",
      "/profile",
    );
  });

  it("renders StoryDiscoveryFilters preserving query params and author source tabs", () => {
    render(
      <StoryDiscoveryFilters
        query={{
          search: "เบตง",
          topic: "food",
          authorType: "tourist",
          province: "Yala",
          page: 1,
          pageSize: 12,
        }}
        topics={[
          { key: "food", name: "อาหาร" },
          { key: "culture", name: "วัฒนธรรม" },
        ]}
        provinces={[
          { value: "Yala", label: "ยะลา" },
          { value: "Pattani", label: "ปัตตานี" },
        ]}
      />,
    );

    expect(screen.getByPlaceholderText("ค้นหาชื่อเรื่องหรือคำสำคัญ...")).toHaveValue("เบตง");
    expect(screen.getByRole("button", { name: "ค้นหา" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /ล้างตัวกรอง/ })).toHaveAttribute("href", "/stories");

    const touristTab = screen.getByRole("link", { name: "จากนักเดินทาง" });
    expect(touristTab).toHaveAttribute("aria-current", "page");
    expect(touristTab.getAttribute("href")).toContain("q=%E0%B9%80%E0%B8%9A%E0%B8%95%E0%B8%87");
    expect(touristTab.getAttribute("href")).toContain("province=Yala");
    expect(touristTab.getAttribute("href")).toContain("topic=food");
  });

  it("renders StoryEditorialCta from CMS values with valid links", () => {
    render(
      <StoryEditorialCta
        title="เรื่องเล่าจากชุมชน"
        subtitle="อ่านเนื้อหาที่ผ่านการเผยแพร่"
        linkText="ดูเรื่องทั้งหมด"
        linkUrl="/stories?topic=community"
      />,
    );

    expect(screen.getByRole("heading", { name: "เรื่องเล่าจากชุมชน" })).toBeInTheDocument();
    expect(screen.getByText("อ่านเนื้อหาที่ผ่านการเผยแพร่")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /ดูเรื่องทั้งหมด/ })).toHaveAttribute(
      "href",
      "/stories?topic=community",
    );
    expect(screen.getByRole("link", { name: /แบ่งปันเรื่องราว/ })).toHaveAttribute(
      "href",
      "/stories/share",
    );
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
    expect(container.textContent).not.toContain("\\n");
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
