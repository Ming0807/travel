import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { RestaurantCategoryRail } from "@/components/restaurants/RestaurantCategoryRail";

vi.mock("next/link", () => ({
  default: ({ children, ...props }: React.ComponentProps<"a">) => <a {...props}>{children}</a>,
}));

const items = Array.from({ length: 10 }, (_, index) => ({
  value: `category-${index + 1}`,
  label: `หมวด ${index + 1}`,
  href: `/restaurants?category=category-${index + 1}`,
}));

describe("RestaurantCategoryRail", () => {
  it("shows eight categories first and expands the complete list", async () => {
    const user = userEvent.setup();
    render(<RestaurantCategoryRail items={items} activeValue="category-2" />);

    expect(screen.getByRole("link", { name: "หมวด 8" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "หมวด 9" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "หมวด 2" })).toHaveAttribute("aria-current", "page");

    await user.click(screen.getByRole("button", { name: /ดูทั้งหมด/ }));
    expect(screen.getByRole("link", { name: "หมวด 10" })).toBeInTheDocument();
  });

  it("searches all categories even while the rail is collapsed", async () => {
    const user = userEvent.setup();
    render(<RestaurantCategoryRail items={items} />);

    await user.type(screen.getByRole("searchbox", { name: "ค้นหาหมวดหมู่ร้านอาหาร" }), "10");
    expect(screen.getByRole("link", { name: "หมวด 10" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "หมวด 1" })).not.toBeInTheDocument();
  });
});
