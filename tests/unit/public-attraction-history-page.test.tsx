import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getPublicAttractionDetail: vi.fn(),
  getPublicAttractionReviews: vi.fn(),
}));

vi.mock("@/lib/repositories/public-content.repository", () => ({
  getPublicAttractionDetail: mocks.getPublicAttractionDetail,
}));
vi.mock("@/lib/repositories/public-review.repository", () => ({
  getPublicAttractionReviews: mocks.getPublicAttractionReviews,
}));
vi.mock("next/navigation", () => ({ notFound: vi.fn() }));
vi.mock("@/components/attractions/attraction-header", () => ({ AttractionHeader: () => null }));
vi.mock("@/components/attractions/attraction-gallery", () => ({ AttractionGallery: () => null }));
vi.mock("@/components/attractions/attraction-tabs", () => ({ AttractionTabs: () => null }));
vi.mock("@/components/attractions/attraction-info-sidebar", () => ({ AttractionInfoSidebar: () => null }));
vi.mock("@/components/attractions/attraction-cards-row", () => ({ AttractionCardsRow: () => null }));
vi.mock("@/components/attractions/attraction-tips", () => ({ AttractionTips: () => null }));
vi.mock("@/components/attractions/attraction-reviews", () => ({ AttractionReviews: () => null }));
vi.mock("@/components/attractions/attraction-cta", () => ({ AttractionCTA: () => null }));
vi.mock("@/components/reviews/ReviewSubmissionForm", () => ({ ReviewSubmissionForm: () => null }));
vi.mock("@/components/layout/SiteFooter", () => ({ SiteFooter: () => null }));
vi.mock("@/components/public/PublicButton", () => ({ PublicButton: () => null }));
vi.mock("@/components/public/PublicPageFrame", () => ({
  PublicPageFrame: ({ children }: { children: React.ReactNode }) => <main>{children}</main>,
}));

import AttractionDetailPage from "@/app/(public)/attractions/[slug]/page";

describe("public attraction history", () => {
  beforeEach(() => {
    mocks.getPublicAttractionDetail.mockResolvedValue({
      attractionId: 4,
      slug: "aiyerweng-skywalk",
      name: "สกายวอล์คอัยเยอร์เวง",
      province: "ยะลา",
      attractionType: "ธรรมชาติ",
      attractionTypes: ["ธรรมชาติ"],
      description: "<p>จุดชมทะเลหมอก</p>",
      history: "<p>เรื่องเล่าของชุมชนอัยเยอร์เวง</p>",
      mainImage: null,
      gallery: [],
      virtualTour: null,
      thingsToDo: [],
      whereToStay: [],
      foodAndDrink: [],
      travelTips: [],
      howToGetThere: null,
      addressText: null,
      latitude: null,
      longitude: null,
      openingHours: null,
      contactInfo: null,
      articles: [],
    });
    mocks.getPublicAttractionReviews.mockResolvedValue({
      state: "empty",
      stats: null,
      items: [],
    });
  });

  it("renders saved history as a distinct public section", async () => {
    render(await AttractionDetailPage({
      params: Promise.resolve({ slug: "aiyerweng-skywalk" }),
    }));

    expect(screen.getByRole("heading", { name: "ประวัติและเรื่องเล่า" })).toBeInTheDocument();
    expect(screen.getByText("เรื่องเล่าของชุมชนอัยเยอร์เวง")).toBeInTheDocument();
  });
});
