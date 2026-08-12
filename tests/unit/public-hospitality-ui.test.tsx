import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AccommodationFilterBar } from "@/components/accommodations/AccommodationFilterBar";
import { RestaurantFilterBar } from "@/components/restaurants/RestaurantFilterBar";

describe("public hospitality filters", () => {
  it("submits restaurant search and type together using a server form", () => {
    const { container } = render(
      <RestaurantFilterBar
        query="noodle"
        foodType="Malay"
        provinces={[{ value: "Yala", label: "Yala" }]}
      />,
    );

    const form = container.querySelector('form[action="/restaurants"]');
    expect(form).toBeInTheDocument();
    expect(screen.getByRole("searchbox")).toHaveAttribute("name", "q");
    expect(screen.getByRole("combobox", { name: /หมวดหมู่/ })).toHaveAttribute("name", "foodType");
    expect(container.querySelector('select[name="province"]')).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /ค้นหา/ })).toHaveAttribute("type", "submit");
    expect(screen.getByRole("option", { name: "อาหารไทย-จีน" })).toHaveValue("Thai-Chinese");
    expect(screen.getByRole("option", { name: "สตรีทฟู้ด" })).toHaveValue("Street Food");
    expect(screen.getByRole("option", { name: "ติ่มซำ" })).toHaveValue("Dimsum");
  });

  it("submits the managed restaurant category slug when categories are supplied", () => {
    render(
      <RestaurantFilterBar
        categorySlug="malay"
        categories={[{ value: "malay", label: "อาหารมลายู" }]}
      />,
    );

    expect(screen.getByRole("combobox", { name: /หมวดหมู่/ })).toHaveAttribute("name", "category");
    expect(screen.getByRole("option", { name: "อาหารมลายู" })).toHaveValue("malay");
  });

  it("submits accommodation search and type together without client navigation", () => {
    const { container } = render(
      <AccommodationFilterBar
        query="hotel"
        accommodationType="Hotel"
        provinces={[{ value: "Yala", label: "Yala" }]}
      />,
    );

    const form = container.querySelector('form[action="/accommodations"]');
    expect(form).toBeInTheDocument();
    expect(screen.getByRole("searchbox")).toHaveAttribute("name", "q");
    expect(container.querySelector('input[name="accommodationType"]')).toHaveValue("Hotel");
    expect(screen.queryByRole("combobox", { name: /ประเภท/ })).not.toBeInTheDocument();
    expect(container.querySelector('select[name="province"]')).not.toBeInTheDocument();
    expect(container.innerHTML).not.toContain("window.location");
  });
});
