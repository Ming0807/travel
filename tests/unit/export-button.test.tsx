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

  it("uses explicit attraction scope without inheriting stale browser query values", () => {
    render(<ExportButton endpoint="/api/admin/dashboard/attractions/export" label="ส่งออกสรุป" params={{
      attractionId: 4,
      dateFrom: "2026-08-01",
      dateTo: "2026-08-31",
      evidenceScope: "pilot_only",
      entryChannel: "nfc",
      campaignId: 7,
      checkinCodeId: 10,
    }} />);

    const href = screen.getByRole("link", { name: "ส่งออกสรุป (CSV)" }).getAttribute("href");
    const query = new URL(href ?? "", "https://example.test").searchParams;
    expect(Object.fromEntries(query)).toEqual({
      attractionId: "4",
      dateFrom: "2026-08-01",
      dateTo: "2026-08-31",
      evidenceScope: "pilot_only",
      entryChannel: "nfc",
      campaignId: "7",
      checkinCodeId: "10",
      format: "csv",
    });
    expect(query.has("search")).toBe(false);
    expect(query.has("status")).toBe(false);
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
