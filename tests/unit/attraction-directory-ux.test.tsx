import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AttractionDirectoryClient } from "@/components/attractions/AttractionDirectoryClient";
import { AttractionDiscoveryCard } from "@/components/attractions/AttractionDiscoveryCard";
import { AttractionSidebar } from "@/components/attractions/AttractionSidebar";
import { TripShortlistProvider } from "@/components/trip-shortlist/TripShortlistProvider";
import type { PublicAttractionCard } from "@/lib/repositories/public-content.repository";

const attraction = (slug: string, name: string): PublicAttractionCard => ({
  slug,
  name,
  province: "ยะลา",
  district: "เมืองยะลา",
  category: "วัฒนธรรม",
  description: "สถานที่ท่องเที่ยวในจังหวัดยะลา",
  imageUrl: `/site-media/${slug}.webp`,
  imageAlt: name,
  tags: [],
  latitude: 6.54,
  longitude: 101.28,
  rating: null,
  reviewCount: null,
  reviewState: "empty",
});

describe("attraction directory production UX", () => {
  it("uses the real public check-in entry instead of treating an attraction slug as a QR code", () => {
    render(
      <TripShortlistProvider>
        <AttractionDiscoveryCard attraction={attraction("wat-kuha-phimuk", "วัดคูหาภิมุข")} />
      </TripShortlistProvider>,
    );

    expect(screen.getByRole("link", { name: "เริ่มเช็กอิน" })).toHaveAttribute("href", "/checkin/try");
    expect(screen.queryByRole("link", { name: "เริ่มเช็กอิน" })).not.toHaveAttribute("href", "/c/wat-kuha-phimuk");
  });

  it("keeps every recommendation in one consistent grid instead of promoting an arbitrary first card", () => {
    render(
      <AttractionDirectoryClient
        items={[
          attraction("wat-kuha-phimuk", "วัดคูหาภิมุข"),
          attraction("yala-city-pillar", "ศาลหลักเมืองยะลา"),
        ]}
      />,
    );

    expect(screen.queryByText("สถานที่แนะนำ")).not.toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(2);
  });

  it("offers a real check-in entry and does not claim a newsletter subscription was saved", () => {
    render(
      <TripShortlistProvider>
        <AttractionSidebar shortlistItems={[]} />
      </TripShortlistProvider>,
    );

    expect(screen.getByRole("link", { name: "สแกน QR เพื่อเช็กอิน" })).toHaveAttribute("href", "/checkin/try");
    expect(screen.queryByPlaceholderText("กรอกอีเมลของคุณ")).not.toBeInTheDocument();
  });
});
