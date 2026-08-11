import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AttractionDiscoveryCard } from "@/components/attractions/AttractionDiscoveryCard";
import { AttractionDiscoveryCta } from "@/components/attractions/AttractionDiscoveryCta";
import { AttractionDiscoveryFilters } from "@/components/attractions/AttractionDiscoveryFilters";
import { TripShortlistProvider } from "@/components/trip-shortlist/TripShortlistProvider";
import type { PublicAttractionCard } from "@/lib/repositories/public-content.repository";
import {
  launchSafeAttractionsCopy,
  safeAttractionsBannerHref,
} from "@/lib/attractions/discovery-copy";
import { resolveAttractionTypeOptions } from "@/lib/attractions/discovery-query";

const baseAttraction: PublicAttractionCard = {
  slug: "aiyerweng-skywalk",
  name: "สกายวอล์คอัยเยอร์เวง",
  province: "ยะลา",
  district: "เบตง",
  category: "ธรรมชาติ",
  description: "ชมทะเลหมอกเหนือผืนป่าฮาลา-บาลา",
  imageUrl: "/site-media/attractions/aiyerweng_thumb.webp",
  imageAlt: "ทะเลหมอกอัยเยอร์เวง",
  tags: ["ธรรมชาติ", "ยะลา"],
  rating: 4.7,
  reviewCount: 38,
  reviewState: "available",
  latitude: 5.94,
  longitude: 101.18,
};

describe("AttractionDiscoveryFilters", () => {
  it("renders visible Thai labels and submits only supported discovery parameters", () => {
    const { container } = render(
      <AttractionDiscoveryFilters
        query="ทะเลหมอก"
        selectedType="Nature"
        typeOptions={[
          { value: "Nature", label: "ธรรมชาติ" },
          { value: "Culture", label: "วัฒนธรรม" },
        ]}
      />,
    );

    expect(screen.getByLabelText("ค้นหาสถานที่")).toHaveValue("ทะเลหมอก");
    expect(screen.getByLabelText("ประเภทสถานที่")).toHaveValue("Nature");
    expect(screen.getByRole("button", { name: "ค้นหาสถานที่" })).toHaveAttribute("type", "submit");
    expect(screen.getByRole("link", { name: "ล้างตัวกรอง" })).toHaveAttribute("href", "/attractions");
    expect(container.querySelector('input[name="page"]')).not.toBeInTheDocument();
    expect(container.querySelector('select[name="province"]')).not.toBeInTheDocument();
  });

  it("does not show a clear action before the user applies a filter", () => {
    render(<AttractionDiscoveryFilters typeOptions={[]} />);

    expect(screen.queryByRole("link", { name: "ล้างตัวกรอง" })).not.toBeInTheDocument();
  });
});

describe("launchSafeAttractionsCopy", () => {
  it("replaces stale multi-province CMS copy while preserving valid Yala copy", () => {
    expect(
      launchSafeAttractionsCopy(
        "สำรวจสถานที่ท่องเที่ยวใน 3 จังหวัดชายแดนใต้",
        "สถานที่ท่องเที่ยวในจังหวัดยะลา",
      ),
    ).toBe("สถานที่ท่องเที่ยวในจังหวัดยะลา");

    expect(
      launchSafeAttractionsCopy(
        "เที่ยว <strong>ยะลา</strong> ให้ลึกกว่าเดิม",
        "สถานที่ท่องเที่ยวในจังหวัดยะลา",
      ),
    ).toBe("เที่ยว ยะลา ให้ลึกกว่าเดิม");
  });

  it("replaces the legacy English demo banner without rejecting intentional English copy", () => {
    expect(
      launchSafeAttractionsCopy(
        "Sea of Mist Aiyerweng",
        "วางแผนต่อจากสถานที่ที่เลือก",
      ),
    ).toBe("วางแผนต่อจากสถานที่ที่เลือก");

    expect(
      launchSafeAttractionsCopy(
        "Yala walking routes for international visitors",
        "ดูเส้นทางแนะนำ",
      ),
    ).toBe("Yala walking routes for international visitors");
  });

  it("keeps the attraction banner action internal and avoids a no-op self link", () => {
    expect(safeAttractionsBannerHref("/stories")).toBe("/stories");
    expect(safeAttractionsBannerHref("/attractions")).toBe("/routes");
    expect(safeAttractionsBannerHref("https://example.com")).toBe("/routes");
  });
});

describe("resolveAttractionTypeOptions", () => {
  it("maps active type rows and surfaces master-data failures", () => {
    expect(resolveAttractionTypeOptions([
      { type_name_en: "Nature", type_name_th: "ธรรมชาติ" },
    ], null)).toEqual([{ value: "Nature", label: "ธรรมชาติ" }]);

    expect(() => resolveAttractionTypeOptions([], { message: "database unavailable" }))
      .toThrow("PUBLIC_ATTRACTION_TYPES_FAILED");
  });
});

describe("AttractionDiscoveryCta", () => {
  it("renders every CMS-managed banner field on the public page", () => {
    render(
      <AttractionDiscoveryCta
        title="วางแผนต่อจากสถานที่ที่เลือก"
        subtitle="ดูเส้นทางที่เชื่อมสถานที่ในยะลา"
        linkText="ดูเส้นทางแนะนำ"
        linkUrl="/routes"
        image="general/routes-banner.webp"
      />,
    );

    expect(screen.getByRole("heading", { name: "วางแผนต่อจากสถานที่ที่เลือก" })).toBeInTheDocument();
    expect(screen.getByText("ดูเส้นทางที่เชื่อมสถานที่ในยะลา")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "ดูเส้นทางแนะนำ" })).toHaveAttribute("href", "/routes");
    expect(screen.getByRole("img", { name: "วางแผนต่อจากสถานที่ที่เลือก" })).toBeInTheDocument();
  });
});

describe("AttractionDiscoveryCard", () => {
  it("exposes the real destination link, location, type, and review summary", () => {
    render(
      <TripShortlistProvider>
        <AttractionDiscoveryCard attraction={baseAttraction} priority />
      </TripShortlistProvider>,
    );

    expect(screen.getByRole("link", { name: /สกายวอล์คอัยเยอร์เวง/ })).toHaveAttribute(
      "href",
      "/attractions/aiyerweng-skywalk",
    );
    expect(screen.getByText("ยะลา")).toBeInTheDocument();
    expect(screen.getByText("เบตง")).toBeInTheDocument();
    expect(screen.getByText("ธรรมชาติ")).toBeInTheDocument();
    expect(screen.getByText("4.7 จาก 38 รีวิว")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "ทะเลหมอกอัยเยอร์เวง" })).toHaveAttribute(
      "sizes",
      "(max-width: 767px) calc(100vw - 2rem), (max-width: 1279px) calc(50vw - 3rem), 300px",
    );
  });

  it("distinguishes empty reviews, unavailable reviews, and missing media", () => {
    const { rerender } = render(
      <TripShortlistProvider>
        <AttractionDiscoveryCard
          attraction={{
            ...baseAttraction,
            imageUrl: null,
            rating: null,
            reviewCount: null,
            reviewState: "empty",
          }}
        />
      </TripShortlistProvider>,
    );

    expect(screen.getByText("ยังไม่มีคะแนนรีวิว")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "ยังไม่มีภาพของสกายวอล์คอัยเยอร์เวง" })).toBeInTheDocument();

    rerender(
      <TripShortlistProvider>
        <AttractionDiscoveryCard
          attraction={{
            ...baseAttraction,
            rating: null,
            reviewCount: null,
            reviewState: "unavailable",
          }}
        />
      </TripShortlistProvider>,
    );

    expect(screen.getByText("คะแนนรีวิวยังไม่พร้อมใช้งาน")).toBeInTheDocument();
    expect(screen.queryByText("0.0")).not.toBeInTheDocument();
  });
});
