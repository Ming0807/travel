import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AccommodationDirectoryHero } from "@/components/accommodations/AccommodationDirectoryHero";
import { AccommodationTypeRail } from "@/components/accommodations/AccommodationTypeRail";

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
});
