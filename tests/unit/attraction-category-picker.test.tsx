import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { AttractionCategoryPicker } from "@/components/admin/attractions/AttractionCategoryPicker";

const categories = [
  { id: 1, label: "ธรรมชาติ", isActive: true },
  { id: 2, label: "วัฒนธรรม", isActive: true },
  { id: 3, label: "ศาสนสถาน", isActive: true },
  { id: 4, label: "ประวัติศาสตร์", isActive: true },
  { id: 5, label: "ปิดใช้งาน", isActive: false },
];

describe("AttractionCategoryPicker", () => {
  it("makes the first selected category primary automatically", async () => {
    const user = userEvent.setup();
    const { container } = render(<AttractionCategoryPicker categories={categories} />);
    await user.click(screen.getByRole("checkbox", { name: "ศาสนสถาน" }));
    expect(container.querySelector('input[name="primaryAttractionTypeId"]')).toHaveValue("3");
    expect(container.querySelectorAll('input[name="attractionTypeIds"]')).toHaveLength(1);
  });

  it("lets the admin switch the explicit primary category", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <AttractionCategoryPicker categories={categories} selectedCategoryIds={[3, 4]} primaryCategoryId={3} />,
    );
    await user.click(screen.getByRole("radio", { name: "ตั้ง ประวัติศาสตร์ เป็นหมวดหลัก" }));
    expect(container.querySelector('input[name="primaryAttractionTypeId"]')).toHaveValue("4");
  });

  it("promotes the first remaining category when the primary is removed", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <AttractionCategoryPicker categories={categories} selectedCategoryIds={[3, 4]} primaryCategoryId={3} />,
    );
    await user.click(screen.getByRole("checkbox", { name: "ศาสนสถาน" }));
    expect(container.querySelector('input[name="primaryAttractionTypeId"]')).toHaveValue("4");
  });

  it("enforces four categories and keeps controls touch sized", async () => {
    const user = userEvent.setup();
    render(<AttractionCategoryPicker categories={categories} selectedCategoryIds={[1, 2, 3, 4]} primaryCategoryId={1} />);
    expect(screen.getByRole("checkbox", { name: "ปิดใช้งาน" })).toBeDisabled();
    expect(screen.getByText("เลือกได้สูงสุด 4 หมวด")).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "ธรรมชาติ" }).closest("label")).toHaveClass("min-h-12");
    await user.click(screen.getByRole("checkbox", { name: "ธรรมชาติ" }));
    expect(screen.queryByText("เลือกได้สูงสุด 4 หมวด")).not.toBeInTheDocument();
  });

  it("shows an inactive historical assignment but does not submit it", () => {
    const { container } = render(
      <AttractionCategoryPicker categories={categories} selectedCategoryIds={[5]} primaryCategoryId={5} />,
    );
    expect(screen.getByText("ปิดใช้งานแล้ว")).toBeInTheDocument();
    expect(container.querySelectorAll('input[name="attractionTypeIds"]')).toHaveLength(0);
  });
});
