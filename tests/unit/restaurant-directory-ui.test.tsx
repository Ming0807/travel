import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RestaurantCategoryNav } from "@/components/restaurants/RestaurantCategoryNav";
import { RestaurantDirectoryItem } from "@/components/restaurants/RestaurantDirectoryItem";

describe("restaurant market street directory UI", () => {
  it("marks the selected category and keeps every category as a real link", () => {
    render(
      <RestaurantCategoryNav
        activeValue="Malay"
        items={[
          { value: "", label: "ทั้งหมด", href: "/restaurants" },
          { value: "Malay", label: "อาหารมลายู", href: "/restaurants?foodType=Malay" },
        ]}
      />,
    );

    expect(screen.getByRole("link", { name: "ทั้งหมด" })).not.toHaveAttribute("aria-current");
    expect(screen.getByRole("link", { name: "อาหารมลายู" })).toHaveAttribute("aria-current", "page");
  });

  it("renders a compact truthful missing-image result", () => {
    render(
      <RestaurantDirectoryItem
        restaurant={{
          slug: "local-kitchen",
          name: "ครัวบ้านยะลา",
          province: "ยะลา",
          foodType: "Malay",
          description: "อาหารพื้นถิ่นจากวัตถุดิบในชุมชน",
          imageUrl: null,
          imageAlt: "ครัวบ้านยะลา",
        }}
      />,
    );

    expect(screen.getByRole("article")).toHaveAttribute("data-layout", "compact-row");
    expect(screen.getByRole("img", { name: "ยังไม่มีภาพของครัวบ้านยะลา" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "ครัวบ้านยะลา" })).toHaveAttribute("href", "/restaurants/local-kitchen");
    expect(screen.getByText("อาหารมลายู")).toBeInTheDocument();
    expect(screen.queryByText(/รีวิว|คะแนน|เปิดอยู่|เวลาเปิด/)).not.toBeInTheDocument();
  });

  it("uses managed media without changing the real detail action", () => {
    render(
      <RestaurantDirectoryItem
        restaurant={{
          slug: "coffee-house",
          name: "บ้านกาแฟยะลา",
          province: "ยะลา",
          foodType: "Coffee",
          description: "กาแฟและขนมอบ",
          imageUrl: "/site-media/coffee.webp",
          imageAlt: "กาแฟในร้านบ้านกาแฟยะลา",
        }}
      />,
    );

    expect(screen.getByAltText("กาแฟในร้านบ้านกาแฟยะลา")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "ดูข้อมูลบ้านกาแฟยะลา" })).toHaveAttribute(
      "href",
      "/restaurants/coffee-house",
    );
  });
});
