import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PublicStoryCard } from "@/components/stories/PublicStoryCard";
import type { PublicStoryCard as PublicStoryCardData } from "@/lib/repositories/public-content.repository";

const story: PublicStoryCardData = {
  id: "pattani-culture",
  title: "เรื่องราววัฒนธรรมปัตตานี",
  excerpt: "ทำความรู้จักวิถีชีวิตและสถานที่สำคัญ",
  province: "ปัตตานี",
  date: "20 ก.ค. 2569",
  publishedAt: "2026-07-20T00:00:00.000Z",
  imageUrl: null,
  imageAlt: "ภาพประกอบเรื่องราว",
  category: "วัฒนธรรม",
  authorType: "admin",
  authorName: "กองบรรณาธิการ",
  readingMinutes: 5,
  primaryLanguage: "th",
  primaryTopic: { key: "culture", name: "วัฒนธรรม" },
  status: "published",
};

describe("PublicStoryCard recommendation reason", () => {
  it("shows one Thai explanation without exposing an internal score", () => {
    render(
      <PublicStoryCard
        story={story}
        reason="เรื่องราวจากปัตตานีเหมือนกัน"
      />
    );

    expect(
      screen.getByText("เหตุผลที่แนะนำ: เรื่องราวจากปัตตานีเหมือนกัน")
    ).toBeInTheDocument();
    expect(screen.queryByText(/score|คะแนน/i)).not.toBeInTheDocument();
  });
});
