import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  archiveAttraction: vi.fn(),
  refresh: vi.fn(),
  push: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mocks.refresh, push: mocks.push }),
}));
vi.mock("@/app/actions/admin-attraction-actions", () => ({
  archiveAttractionAction: mocks.archiveAttraction,
}));
vi.mock("@/app/actions/admin-restaurant-actions", () => ({
  archiveRestaurantAction: vi.fn(),
}));
vi.mock("@/app/actions/admin-accommodation-actions", () => ({
  archiveAccommodationAction: vi.fn(),
}));
vi.mock("@/app/actions/admin-route-actions", () => ({
  archiveRouteAction: vi.fn(),
}));
vi.mock("@/app/actions/admin-story-actions", () => ({
  archiveStoryAction: vi.fn(),
}));

import { CmsArchiveButton } from "@/components/admin/content/CmsArchiveButton";

describe("CmsArchiveButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("requires explicit confirmation before archiving and refreshes on success", async () => {
    mocks.archiveAttraction.mockResolvedValue({ success: true });
    render(
      <CmsArchiveButton
        entityId={12}
        entityName="วัดคูหาภิมุข"
        entityType="attraction"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "ลบ วัดคูหาภิมุข ออกจากระบบ" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(/ข้อมูลการเข้าชมและสถิติเดิมจะยังคงอยู่/)).toBeInTheDocument();
    expect(mocks.archiveAttraction).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "ยืนยันลบออกจากระบบ" }));

    await waitFor(() => expect(mocks.archiveAttraction).toHaveBeenCalledWith(12));
    expect(mocks.refresh).toHaveBeenCalledOnce();
  });

  it("keeps the dialog open and shows a safe error when archiving fails", async () => {
    mocks.archiveAttraction.mockResolvedValue({
      success: false,
      error: "ยังลบสถานที่ออกจากระบบไม่ได้ กรุณาลองอีกครั้ง",
    });
    render(
      <CmsArchiveButton
        entityId={12}
        entityName="สถานที่ทดสอบ"
        entityType="attraction"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "ลบ สถานที่ทดสอบ ออกจากระบบ" }));
    fireEvent.click(screen.getByRole("button", { name: "ยืนยันลบออกจากระบบ" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "ยังลบสถานที่ออกจากระบบไม่ได้ กรุณาลองอีกครั้ง",
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(mocks.refresh).not.toHaveBeenCalled();
  });
});
