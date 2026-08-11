import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HospitalityFeaturedResult } from "@/components/hospitality/HospitalityFeaturedResult";
import { selectFeaturedHospitality } from "@/lib/hospitality/featured-result";

describe("hospitality discovery composition", () => {
  it("selects the first record with managed media and keeps the source order", () => {
    const items = [
      { slug: "without-image", imageUrl: null },
      { slug: "with-image", imageUrl: "/site-media/cover.webp" },
      { slug: "later-image", imageUrl: "/site-media/later.webp" },
    ];

    expect(selectFeaturedHospitality(items)?.slug).toBe("with-image");
    expect(selectFeaturedHospitality([{ slug: "blank", imageUrl: "  " }])).toBeNull();
  });

  it("renders a real restaurant feature with a clear detail action", () => {
    render(
      <HospitalityFeaturedResult
        href="/restaurants/local-kitchen"
        label="ร้านอาหารแนะนำ"
        name="Local Kitchen"
        province="ยะลา"
        category="อาหารมลายู"
        description="อาหารท้องถิ่น"
        imageUrl="/site-media/restaurant.webp"
        imageAlt="Local Kitchen"
        actionLabel="ดูข้อมูลร้านอาหาร"
      />,
    );

    expect(screen.getByRole("heading", { name: "Local Kitchen" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /ดูข้อมูลร้านอาหาร/ })).toHaveAttribute(
      "href",
      "/restaurants/local-kitchen",
    );
    expect(screen.getByText("อาหารมลายู")).toBeInTheDocument();
  });
});
