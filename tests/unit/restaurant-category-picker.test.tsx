import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { RestaurantCategoryPicker } from "@/components/admin/restaurants/RestaurantCategoryPicker";

const categories = [
  { categoryId: 1, slug: "malay", nameTh: "อาหารมลายู", nameEn: "Malay", sectionKey: "local" as const, displayOrder: 10, isFeatured: true, isActive: true, restaurantCount: 3, createdAt: "", updatedAt: null },
  { categoryId: 2, slug: "coffee", nameTh: "คาเฟ่และกาแฟ", nameEn: "Coffee", sectionKey: "cafes" as const, displayOrder: 20, isFeatured: true, isActive: true, restaurantCount: 2, createdAt: "", updatedAt: null },
  { categoryId: 3, slug: "legacy", nameTh: "หมวดเก่า", nameEn: null, sectionKey: "other" as const, displayOrder: 30, isFeatured: false, isActive: false, restaurantCount: 1, createdAt: "", updatedAt: null },
];

describe("RestaurantCategoryPicker", () => {
  it("searches, selects, and emits repeated category inputs", async () => {
    const user = userEvent.setup();
    render(<RestaurantCategoryPicker categories={categories} selectedCategoryIds={[1]} />);

    expect(screen.getByText("เลือกแล้ว 1 หมวด")).toBeInTheDocument();
    await user.type(screen.getByRole("searchbox", { name: "ค้นหาหมวดหมู่ร้านอาหาร" }), "กาแฟ");
    expect(screen.queryByRole("checkbox", { name: /อาหารมลายู/ })).not.toBeInTheDocument();
    await user.click(screen.getByRole("checkbox", { name: /คาเฟ่และกาแฟ/ }));

    const values = screen.getAllByTestId("restaurant-category-value").map((input) => (
      input as HTMLInputElement
    ).value);
    expect(values).toEqual(["1", "2"]);
    expect(screen.getByText("เลือกแล้ว 2 หมวด")).toBeInTheDocument();
  });

  it("shows archived selected categories as a warning and does not resubmit them", () => {
    render(<RestaurantCategoryPicker categories={categories} selectedCategoryIds={[3]} />);
    expect(screen.getAllByText("หมวดเก่า")).toHaveLength(2);
    expect(screen.getByText("ปิดใช้งานแล้ว")).toBeInTheDocument();
    expect(screen.queryByTestId("restaurant-category-value")).not.toBeInTheDocument();
  });

  it("preserves click order for the primary category contract", async () => {
    const user = userEvent.setup();
    render(<RestaurantCategoryPicker categories={categories} />);

    await user.click(screen.getByRole("checkbox", { name: /คาเฟ่และกาแฟ/ }));
    await user.click(screen.getByRole("checkbox", { name: /อาหารมลายู/ }));

    expect(screen.getAllByTestId("restaurant-category-value").map((input) => input.getAttribute("value"))).toEqual(["2", "1"]);
  });
});
