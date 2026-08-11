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
    expect(screen.getByRole("combobox", { name: /ประเภท/ })).toHaveAttribute("name", "foodType");
    expect(container.querySelector('select[name="province"]')).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /ค้นหา/ })).toHaveAttribute("type", "submit");
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
    expect(screen.getByRole("combobox", { name: /ประเภท/ })).toHaveAttribute("name", "accommodationType");
    expect(container.querySelector('select[name="province"]')).not.toBeInTheDocument();
    expect(container.innerHTML).not.toContain("window.location");
  });
});
