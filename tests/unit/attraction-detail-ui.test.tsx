import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AttractionReviews } from "@/components/attractions/attraction-reviews";
import { AttractionGallery } from "@/components/attractions/attraction-gallery";
import { AttractionHeader } from "@/components/attractions/attraction-header";
import { AttractionInfoSidebar } from "@/components/attractions/attraction-info-sidebar";

describe("AttractionReviews", () => {
  it("does not present missing review data as a zero-star score", () => {
    render(<AttractionReviews state="empty" stats={null} reviews={[]} title="รีวิวจากนักเดินทาง" />);

    expect(screen.getByText("ยังไม่มีรีวิวที่เผยแพร่")).toBeInTheDocument();
    expect(screen.queryByText("0 / 5")).not.toBeInTheDocument();
    expect(screen.queryByText("0%")).not.toBeInTheDocument();
  });

  it("shows an explicit unavailable state when reviews cannot be loaded", () => {
    render(<AttractionReviews state="unavailable" stats={null} reviews={[]} title="รีวิวจากนักเดินทาง" />);

    expect(screen.getByText("โหลดรีวิวไม่ได้ในขณะนี้")).toBeInTheDocument();
    expect(screen.queryByText("ยังไม่มีรีวิวที่เผยแพร่")).not.toBeInTheDocument();
  });

  it("renders approved review data without exposing a tourist profile name", () => {
    render(
      <AttractionReviews
        state="available"
        stats={{ averageRating: 4.5, totalReviews: 2, distribution: { 1: 0, 2: 0, 3: 0, 4: 1, 5: 1 } }}
        reviews={[{
          reviewId: 1,
          authorLabel: "นักเดินทาง",
          rating: 5,
          title: "ประทับใจ",
          comment: "วิวสวย",
          createdAt: "2026-08-10T08:00:00Z",
        }]}
        title="รีวิวจากนักเดินทาง"
      />,
    );

    expect(screen.getByText("4.5")).toBeInTheDocument();
    expect(screen.getByText("นักเดินทาง")).toBeInTheDocument();
    expect(screen.getByText("2 รีวิว")).toBeInTheDocument();
  });

  it("opens the full review list as an accessible dialog", () => {
    const reviews = Array.from({ length: 4 }, (_, index) => ({
      reviewId: index + 1,
      authorLabel: "นักเดินทาง" as const,
      rating: 5,
      title: `รีวิว ${index + 1}`,
      comment: null,
      createdAt: `2026-08-${String(10 - index).padStart(2, "0")}T08:00:00Z`,
    }));
    render(
      <AttractionReviews
        state="available"
        stats={{ averageRating: 5, totalReviews: 4, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 4 } }}
        reviews={reviews}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "ดูรีวิวทั้งหมด 4 รีวิว" }));

    expect(screen.getByRole("dialog", { name: "รีวิวทั้งหมด" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "ปิดรีวิวทั้งหมด" })).toBeInTheDocument();
  });
});

describe("AttractionHeader", () => {
  it("shows real classification and a truthful empty review state", () => {
    render(
      <AttractionHeader
        name="ย่านเมืองเก่ายะลา"
        province="ยะลา"
        attractionType="วัฒนธรรม"
        reviewState="empty"
        rating={null}
        reviewCount={null}
      />,
    );

    expect(screen.getByRole("heading", { level: 1, name: "ย่านเมืองเก่ายะลา" })).toBeInTheDocument();
    expect(screen.getByText("วัฒนธรรม")).toBeInTheDocument();
    expect(screen.getByText("ยังไม่มีคะแนนรีวิว")).toBeInTheDocument();
    expect(screen.queryByText(/0(?:\.0)?/)).not.toBeInTheDocument();
  });
});

describe("AttractionGallery", () => {
  it("can bypass Next image optimization for authenticated admin previews", () => {
    const previewUrl =
      "/api/admin/media/preview?bucket=visit-photos&path=cloudinary%3Aimage%3Aauthenticated%3Av1%3Ajpg%3Acontent-media%2Fattraction%2F4%2Fcover";

    render(
      <AttractionGallery
        mainImage={{ url: previewUrl, alt: "Admin cover" }}
        gallery={[{ url: previewUrl, alt: "Admin cover" }]}
        attractionName="Test attraction"
        unoptimized
      />,
    );

    const imageSrc = screen.getByRole("img", { name: "Admin cover" }).getAttribute("src");
    expect(imageSrc).not.toContain("/_next/image");
    const resolvedImageUrl = new URL(imageSrc ?? "", "http://localhost:3000");
    expect(`${resolvedImageUrl.pathname}${resolvedImageUrl.search}`).toBe(previewUrl);
  });

  it("uses real image counts, accessible labels, and optimized image sizing", () => {
    render(
      <AttractionGallery
        mainImage={{ url: "/site-media/attractions/cover.webp", alt: "อาคารเก่า" }}
        gallery={[
          { url: "/site-media/attractions/cover.webp", alt: "อาคารเก่า" },
          { url: "/site-media/attractions/side.webp", alt: "ถนนเมืองเก่า" },
        ]}
        attractionName="ย่านเมืองเก่ายะลา"
      />,
    );

    expect(screen.getByRole("button", { name: "เปิดภาพ อาคารเก่า" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "ดูรูปทั้งหมด 2 รูป" })).toBeInTheDocument();
    expect(screen.queryByText("+18 Photos")).not.toBeInTheDocument();
    expect(screen.getByRole("img", { name: "อาคารเก่า" })).toHaveAttribute(
      "sizes",
      "(max-width: 1023px) calc(100vw - 2rem), 736px",
    );
  });

  it("removes media that fails to load from the visible gallery and count", () => {
    render(
      <AttractionGallery
        mainImage={{ url: "/site-media/attractions/cover.webp", alt: "Working cover" }}
        gallery={[
          { url: "/site-media/attractions/cover.webp", alt: "Working cover" },
          { url: "/site-media/attractions/broken.webp", alt: "Broken side" },
        ]}
        attractionName="Test attraction"
      />,
    );

    const galleryButton = screen
      .getAllByRole("button")
      .find((button) => button.textContent?.includes("2"));

    expect(galleryButton).toBeDefined();
    fireEvent.error(screen.getByRole("img", { name: "Broken side" }));
    expect(galleryButton).toHaveTextContent("1");
    expect(screen.queryByRole("img", { name: "Broken side" })).not.toBeInTheDocument();
  });
});

describe("AttractionInfoSidebar", () => {
  it("shows only attraction-specific facts supplied by the CMS", () => {
    render(
      <AttractionInfoSidebar
        province="ยะลา"
        attractionType="วัฒนธรรม"
        address="อำเภอเมืองยะลา"
        openingHours="08:00-17:00"
        contactInfo={null}
      />,
    );

    expect(screen.getByText("ข้อมูลสถานที่")).toBeInTheDocument();
    expect(screen.getByText("เวลาทำการ")).toBeInTheDocument();
    expect(screen.queryByText("Population")).not.toBeInTheDocument();
    expect(screen.queryByText("Currency")).not.toBeInTheDocument();
  });
});
