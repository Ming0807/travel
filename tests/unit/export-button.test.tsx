import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const navigationMocks = vi.hoisted(() => ({
  useSearchParams: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useSearchParams: navigationMocks.useSearchParams,
}));

import { ExportButton } from "@/components/admin/ExportButton";

describe("ExportButton", () => {
  beforeEach(() => {
    navigationMocks.useSearchParams.mockReturnValue(new URLSearchParams("search=yala&status=active&page=2"));
  });

  it("preserves current filters and changes only the selected export format", () => {
    render(<ExportButton endpoint="/api/admin/export/example" label="ส่งออกข้อมูล" />);

    expect(screen.getByRole("link", { name: "ส่งออกข้อมูล (CSV)" })).toHaveAttribute(
      "href",
      "/api/admin/export/example?search=yala&status=active&page=2&format=csv"
    );

    fireEvent.click(screen.getByRole("button", { name: "เลือกรูปแบบไฟล์ส่งออก" }));
    fireEvent.click(screen.getByRole("menuitemradio", { name: "Excel (.xlsx)" }));

    expect(screen.getByRole("link", { name: "ส่งออกข้อมูล (Excel)" })).toHaveAttribute(
      "href",
      "/api/admin/export/example?search=yala&status=active&page=2&format=xlsx"
    );
  });

  it("closes the format menu with Escape and returns focus to its trigger", () => {
    render(<ExportButton endpoint="/api/admin/export/example" />);
    const trigger = screen.getByRole("button", { name: "เลือกรูปแบบไฟล์ส่งออก" });

    fireEvent.click(trigger);
    expect(screen.getByRole("menu", { name: "รูปแบบไฟล์ส่งออก" })).toBeInTheDocument();

    fireEvent.keyDown(screen.getByRole("menu", { name: "รูปแบบไฟล์ส่งออก" }), { key: "Escape" });
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
});
