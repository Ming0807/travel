import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
vi.mock("@/app/actions/admin-accommodation-actions", () => ({
  toggleAccommodationPublishAction: vi.fn(),
  toggleAccommodationActiveAction: vi.fn(),
}));
vi.mock("@/components/admin/content/CmsArchiveButton", () => ({
  CmsArchiveButton: () => null,
}));

import { AccommodationStatusActions } from "@/components/admin/accommodations/AccommodationStatusActions";

describe("accommodation row actions", () => {
  it("keeps the edit control visibly contrasted and comfortably tappable", () => {
    render(
      <AccommodationStatusActions
        accommodationId={41}
        accommodationName="ริเวอร์การ์เดน"
        isPublished={false}
        isActive
      />,
    );

    const editLink = screen.getByRole("link", { name: "แก้ไขที่พัก" });
    expect(editLink).toHaveAttribute("href", "/admin/accommodations/41/edit");
    expect(editLink.className).toContain("text-[#07574F]");
    expect(editLink.className).toContain("h-10 w-10");
  });
});
