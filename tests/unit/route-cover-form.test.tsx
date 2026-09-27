import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CoverForm } from "@/components/admin/routes/visual-editor/SectionForms";
import type { AdminRouteRow } from "@/lib/repositories/admin-route.repository";

const mocks = vi.hoisted(() => ({ save: vi.fn(), metadata: vi.fn() }));
vi.mock("@/app/actions/admin-route-actions", () => ({
  saveRouteCoverAction: mocks.save,
  updateRouteAction: mocks.metadata,
}));
vi.mock("@/components/admin/media/MediaPickerModal", () => ({
  MediaPickerModal: ({ isOpen, onSelectAsset, onClose }: {
    isOpen: boolean;
    onSelectAsset: (asset: { id: string; url: string; storage_path: string }) => void;
    onClose: () => void;
  }) => isOpen ? <button onClick={() => {
    onSelectAsset({ id: "f04a9a4e-4e2a-4f7f-9fb5-000000000042", url: "/site-media/new.webp", storage_path: "new.webp" });
    onClose();
  }}>Pick image</button> : null,
}));

const route: AdminRouteRow = {
  route_id: 5, slug: "na-tham", name_th: "หน้าถ้ำ", name_en: null,
  description_th: "คำอธิบายที่ต้องไม่ถูกเขียนทับ", description_en: null,
  is_active: true, is_published: false, created_at: "2026-09-01", updated_at: null, stop_count: 2,
};

describe("route cover editor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.metadata.mockResolvedValue({ success: true });
    mocks.save.mockResolvedValue({ success: true, data: { mediaId: 92, imageUrl: "/site-media/saved.webp" } });
  });

  it("saves the library UUID alone and uses the server-confirmed cover", async () => {
    const changed = vi.fn();
    const close = vi.fn();
    render(<CoverForm route={route} onClose={close} onCoverChange={changed} />);
    expect(screen.getByRole("button", { name: "บันทึกรูปภาพ" })).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: "เลือกจาก Media Library" }));
    await userEvent.click(screen.getByRole("button", { name: "Pick image" }));
    expect(changed).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole("button", { name: "บันทึกรูปภาพ" }));
    await waitFor(() => expect(mocks.save).toHaveBeenCalledWith(5, { assetId: "f04a9a4e-4e2a-4f7f-9fb5-000000000042" }));
    expect(mocks.metadata).not.toHaveBeenCalled();
    expect(changed).toHaveBeenCalledWith(92, "/site-media/saved.webp");
    expect(close).toHaveBeenCalledOnce();
  });

  it("only clears the saved image after an acknowledged removal", async () => {
    mocks.save.mockResolvedValue({ success: true, data: { mediaId: null, imageUrl: null } });
    const changed = vi.fn();
    render(<CoverForm route={route} coverMediaId={12} coverMediaUrl="/site-media/old.webp" onClose={vi.fn()} onCoverChange={changed} />);
    await userEvent.click(screen.getByRole("button", { name: "เอาออก" }));
    expect(changed).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole("button", { name: "บันทึกรูปภาพ" }));
    await waitFor(() => expect(mocks.save).toHaveBeenCalledWith(5, { assetId: null }));
    expect(changed).toHaveBeenCalledWith(null, null);
  });

  it("keeps the drawer and retry available after a network failure", async () => {
    mocks.save.mockRejectedValueOnce(new Error("network"));
    const close = vi.fn();
    render(<CoverForm route={route} coverMediaUrl="/site-media/old.webp" onClose={close} />);
    await userEvent.click(screen.getByRole("button", { name: "เอาออก" }));
    await userEvent.click(screen.getByRole("button", { name: "บันทึกรูปภาพ" }));
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("เชื่อมต่อไม่สำเร็จ"));
    expect(close).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "บันทึกรูปภาพ" })).toBeEnabled();
  });
});
