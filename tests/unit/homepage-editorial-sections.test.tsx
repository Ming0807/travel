import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HomepageCertificateCta } from "@/components/homepage/sections/HomepageCertificateCta";
import { HomepageStories } from "@/components/homepage/sections/HomepageStories";

describe("homepage editorial sections", () => {
  it("renders published story data without invented reading times", () => {
    render(<HomepageStories stories={[{
      storyId: 9,
      id: "9",
      title: "เรื่องจากชุมชน",
      excerpt: "บันทึกจากคนในพื้นที่",
      category: "วัฒนธรรม",
      province: "ยะลา",
      imageUrl: null,
      imageAlt: "",
      date: "10 สิงหาคม 2569",
      publishedAt: "2026-08-10T00:00:00.000Z",
      authorType: "admin",
      authorName: "กองบรรณาธิการ",
      readingMinutes: 3,
      primaryLanguage: "th",
      primaryTopic: null,
    }]} />);

    expect(screen.getByRole("link", { name: /เรื่องจากชุมชน/ })).toHaveAttribute("href", "/stories/9");
    expect(screen.queryByText(/นาที/)).not.toBeInTheDocument();
    expect(screen.getByText("ยังไม่มีภาพจาก CMS")).toBeInTheDocument();
  });

  it("replaces stale newsletter settings with working passport actions", () => {
    render(<HomepageCertificateCta title="สมัครรับข่าวสาร" description="กรอกอีเมลเพื่อรับข่าวสาร" />);

    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "ทุกการเดินทางมีเรื่องให้สะสม" })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /Digital Passport|ดูตราที่สะสมไว้/ })[0]).toHaveAttribute("href", "/passport");
    expect(screen.getByRole("link", { name: "ดูกระดานผู้นำ" })).toHaveAttribute("href", "/leaderboard");
  });
});
