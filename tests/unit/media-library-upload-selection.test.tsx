import { fireEvent, render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MediaLibrary, type MediaAsset } from "@/components/admin/media/MediaLibrary";

const uploadAdminImage = vi.fn();

vi.mock("@/lib/media/admin-image-upload-client", () => ({
  uploadAdminImage: (...args: unknown[]) => uploadAdminImage(...args),
}));

const uploadedAsset: MediaAsset = {
  id: "3129fa20-c32d-4475-b653-629d4280eb01",
  file_name: "new-hero.webp",
  storage_path: "homepage/new-hero.webp",
  thumbnail_storage_path: "homepage/new-hero_thumb.webp",
  mime_type: "image/webp",
  size_bytes: 512_000,
  category: "Homepage",
  created_at: "2026-08-27T00:00:00.000Z",
  url: "/site-media/homepage/new-hero.webp",
  thumbnail_url: "/site-media/homepage/new-hero_thumb.webp",
  lifecycle_status: "active",
};

describe("MediaLibrary upload selection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    }));
  });

  it("selects a newly uploaded image immediately in picker mode", async () => {
    const onSelect = vi.fn();
    uploadAdminImage.mockResolvedValue({
      data: { asset: uploadedAsset },
      originalBytes: 1_000_000,
      uploadBytes: 512_000,
    });

    const { container } = render(<MediaLibrary mode="pick" onSelect={onSelect} />);
    const input = container.querySelector<HTMLInputElement>('input[type="file"]');
    expect(input).not.toBeNull();

    const file = new File([new Uint8Array([1, 2, 3])], "new-hero.jpg", { type: "image/jpeg" });
    fireEvent.change(input!, { target: { files: [file] } });

    await waitFor(() => {
      expect(onSelect).toHaveBeenCalledWith(uploadedAsset.url, uploadedAsset);
    });
  });
});
