import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AccommodationDirectoryHero } from "@/components/accommodations/AccommodationDirectoryHero";
import { AccommodationDiscoveryCard } from "@/components/accommodations/AccommodationDiscoveryCard";
import { AccommodationDiscoveryCta } from "@/components/accommodations/AccommodationDiscoveryCta";
import { AccommodationDiscoveryFilters } from "@/components/accommodations/AccommodationDiscoveryFilters";
import { AccommodationHero } from "@/components/accommodations/AccommodationHero";
import {
  AccommodationFeaturedResult,
  AccommodationResultCard,
} from "@/components/accommodations/AccommodationResultCard";
import { AccommodationSidebar } from "@/components/accommodations/AccommodationSidebar";
import { AccommodationTypeRail } from "@/components/accommodations/AccommodationTypeRail";

const accommodation = {
  slug: "camp-yala",
  name: "เดอะ แคมป์ ยะลา",
  province: "ยะลา",
  accommodationType: "Resort",
  description: "รีสอร์ตท่ามกลางธรรมชาติ เหมาะสำหรับการพักผ่อนหลังเดินทาง",
  imageUrl: "/site-media/accommodations/camp-yala.webp",
  thumbnailUrl: "/site-media/accommodations/camp-yala-thumb.webp",
  imageAlt: "ห้องพักเดอะ แคมป์ ยะลา",
  priceRange: "1,600 - 3,500 บาท/คืน",
};

const accommodationNoPriceNoImage = {
  slug: "yala-central-inn",
  name: "ยะลา เซ็นทรัล อินน์",
  province: "ยะลา",
  accommodationType: "Hotel",
  description: "โรงแรมใจกลางเมืองยะลา",
  imageUrl: null,
  imageAlt: "ยะลา เซ็นทรัล อินน์",
};

describe("accommodation directory UI", () => {
  it("renders a truthful editorial hero from managed accommodation media", () => {
    render(
      <AccommodationDirectoryHero
        title="ที่พักในยะลา"
        description="เลือกที่พักที่เหมาะกับจังหวะการเดินทางของคุณ"
        scope="ข้อมูลปัจจุบัน: จังหวัดยะลา"
        imageUrl="/site-media/accommodations/camp-yala.webp"
        imageAlt="ที่พักท่ามกลางธรรมชาติในยะลา"
      />,
    );

    expect(screen.getByRole("heading", { name: "ที่พักในยะลา" })).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "ที่พักท่ามกลางธรรมชาติในยะลา" }).getAttribute("src"),
    ).toContain(encodeURIComponent("/site-media/accommodations/camp-yala.webp"));
    expect(screen.getByText("ข้อมูลปัจจุบัน: จังหวัดยะลา")).toBeInTheDocument();
    expect(screen.queryByText(/จองเลย|ห้องว่าง/)).not.toBeInTheDocument();
  });

  it("renders the new AccommodationHero with breadcrumb and feature pills without fake booking claims", () => {
    render(
      <AccommodationHero
        title="ที่พักในจังหวัดยะลา"
        description="เปรียบเทียบประเภทที่พัก ช่วงราคา และเลือกที่พักที่เหมาะกับแผนการเดินทางของคุณ"
      />,
    );

    expect(screen.getByRole("heading", { name: /ที่พัก.*ในจังหวัดยะลา/ })).toBeInTheDocument();
    expect(screen.getByText("หน้าแรก")).toBeInTheDocument();
    expect(screen.getByText("ข้อมูลที่เผยแพร่")).toBeInTheDocument();
    expect(screen.getByText(/โดยผู้ดูแลระบบ/)).toBeInTheDocument();
    expect(screen.queryByText(/จองทันที|ว่างพร้อมจอง|ดาวน์โหลดแอป/)).not.toBeInTheDocument();
  });

  it("keeps accommodation type links compact and preserves the current search", () => {
    render(
      <AccommodationTypeRail
        query="เบตง"
        selectedType="Resort"
        types={[
          { value: "Hotel", label: "โรงแรม" },
          { value: "Resort", label: "รีสอร์ต" },
          { value: "Homestay", label: "โฮมสเตย์" },
        ]}
      />,
    );

    expect(screen.getByRole("link", { name: "ทั้งหมด" })).toHaveAttribute(
      "href",
      "/accommodations?q=%E0%B9%80%E0%B8%9A%E0%B8%95%E0%B8%87",
    );
    expect(screen.getByRole("link", { name: "รีสอร์ต" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "รีสอร์ต" }).getAttribute("href")).toContain(
      "accommodationType=Resort",
    );
  });

  it("renders AccommodationDiscoveryFilters preserving query and province across real actions", () => {
    render(
      <AccommodationDiscoveryFilters
        query="เมืองยะลา"
        accommodationType="Hotel"
        province="Yala"
        types={[
          { value: "Hotel", label: "โรงแรม" },
          { value: "Resort", label: "รีสอร์ต" },
        ]}
      />,
    );

    expect(screen.getByPlaceholderText("ค้นหาชื่อที่พัก หรือคำที่สนใจ...")).toHaveValue("เมืองยะลา");
    expect(screen.getByRole("button", { name: "ค้นหาที่พัก" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "ดูเส้นทาง" })).toHaveAttribute("href", "/routes");
    expect(screen.queryByRole("combobox", { name: /อำเภอ/ })).not.toBeInTheDocument();
    expect(document.querySelector('input[name="province"]')).toHaveValue("Yala");

    const hotelChip = screen.getByRole("link", { name: "โรงแรม" });
    expect(hotelChip.getAttribute("href")).toContain("q=%E0%B9%80%E0%B8%A1%E0%B8%B7%E0%B8%AD%E0%B8%87%E0%B8%A2%E0%B8%B0%E0%B8%A5%E0%B8%B2");
    expect(hotelChip.getAttribute("href")).toContain("province=Yala");
  });

  it("renders the featured result as verified accommodation information without booking claims", () => {
    render(<AccommodationFeaturedResult accommodation={accommodation} />);

    expect(screen.getByRole("heading", { name: accommodation.name })).toBeInTheDocument();
    expect(screen.getByText("ข้อมูลโดยผู้ดูแล")).toBeInTheDocument();
    expect(screen.getByText(accommodation.priceRange)).toBeInTheDocument();
    expect(screen.getByRole("img", { name: accommodation.imageAlt }).getAttribute("src")).toContain(
      encodeURIComponent(accommodation.imageUrl),
    );
    expect(screen.getByRole("link", { name: /ดูข้อมูลที่พัก/ })).toHaveAttribute(
      "href",
      "/accommodations/camp-yala",
    );
    expect(screen.queryByText(/จองเลย|ห้องว่าง/)).not.toBeInTheDocument();
  });

  it("renders a compact accommodation comparison card with a visible mobile action", () => {
    render(<AccommodationResultCard accommodation={accommodation} />);

    expect(screen.getByRole("heading", { name: accommodation.name })).toBeInTheDocument();
    expect(screen.getByText("รีสอร์ต")).toBeInTheDocument();
    expect(screen.getByText(accommodation.priceRange)).toBeInTheDocument();
    expect(screen.getByRole("img", { name: accommodation.imageAlt }).getAttribute("src")).toContain(
      encodeURIComponent(accommodation.thumbnailUrl),
    );
    expect(screen.getByRole("link", { name: `ดูรายละเอียด ${accommodation.name}` })).toHaveAttribute(
      "href",
      "/accommodations/camp-yala",
    );
  });

  it("renders AccommodationDiscoveryCard with truthful price and no fake ratings or booking actions", () => {
    render(<AccommodationDiscoveryCard accommodation={accommodation} />);

    expect(screen.getByRole("heading", { name: accommodation.name })).toBeInTheDocument();
    expect(screen.getByText("รีสอร์ต")).toBeInTheDocument();
    expect(screen.getByText(accommodation.priceRange)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: `ดูรายละเอียด ${accommodation.name}` })).toHaveAttribute(
      "href",
      "/accommodations/camp-yala",
    );
    expect(screen.queryByText(/★|คะแนนรีวิว|รีวิวจากผู้เข้าพัก|จองห้อง|ห้องว่าง/)).not.toBeInTheDocument();
  });

  it("renders AccommodationDiscoveryCard with missing price and missing image gracefully", () => {
    render(<AccommodationDiscoveryCard accommodation={accommodationNoPriceNoImage} />);

    expect(screen.getByRole("heading", { name: accommodationNoPriceNoImage.name })).toBeInTheDocument();
    expect(screen.getByText("โรงแรม")).toBeInTheDocument();
    expect(screen.getByText("ยังไม่ระบุช่วงราคา")).toBeInTheDocument();
    expect(screen.getByText(`ยังไม่มีภาพของ${accommodationNoPriceNoImage.name}`)).toBeInTheDocument();
  });

  it("labels symbolic price data as a level instead of a numeric range", () => {
    render(
      <AccommodationDiscoveryCard
        accommodation={{ ...accommodation, priceRange: "฿฿" }}
      />,
    );

    expect(screen.getByText("ระดับราคา:")).toBeInTheDocument();
    expect(screen.getByText("฿฿")).toBeInTheDocument();
  });

  it("renders AccommodationSidebar with valid public checkin entry and functional route/story links", () => {
    render(<AccommodationSidebar />);

    const checkinLink = screen.getByRole("link", { name: /สแกน QR เพื่อเช็กอิน/ });
    expect(checkinLink).toHaveAttribute("href", "/checkin/try");
    expect(checkinLink.getAttribute("href")).not.toBe("/c");

    expect(screen.getByRole("link", { name: /ดูเส้นทางท่องเที่ยวทั้งหมด/ })).toHaveAttribute(
      "href",
      "/routes",
    );
    expect(screen.getByRole("link", { name: /อ่านเรื่องราวทั้งหมด/ })).toHaveAttribute(
      "href",
      "/stories",
    );
    expect(screen.queryByText(/ของรางวัลพิเศษ/)).not.toBeInTheDocument();
  });

  it("renders AccommodationDiscoveryCta with truthful benefits and route exploration link", () => {
    render(
      <AccommodationDiscoveryCta
        title="วางแผนที่พักให้เหมาะกับทริปของคุณ"
        subtitle="เลือกประเภทที่พักให้ตรงกับสไตล์และงบประมาณ"
        linkText="ค้นหาเส้นทางท่องเที่ยว"
        linkUrl="/routes"
      />,
    );

    expect(screen.getByRole("heading", { name: "วางแผนที่พักให้เหมาะกับทริปของคุณ" })).toBeInTheDocument();
    expect(screen.getByText("อ่านช่วงราคาที่ผู้ดูแลระบุ")).toBeInTheDocument();
    expect(screen.queryByText(/ใกล้แหล่งท่องเที่ยว|จัดเส้นทางให้อัตโนมัติ/)).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /ค้นหาเส้นทางท่องเที่ยว/ })).toHaveAttribute(
      "href",
      "/routes",
    );
    expect(screen.getByRole("link", { name: "ดูเรื่องราวท่องเที่ยว" })).toHaveAttribute(
      "href",
      "/stories",
    );
  });
});
