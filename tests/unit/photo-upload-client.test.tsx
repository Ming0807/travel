import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PhotoUploadClient } from "@/components/checkin/PhotoUploadClient";

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  prepare: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push }),
}));

vi.mock("@/lib/media/client-photo-compression", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/media/client-photo-compression")>();
  return {
    ...actual,
    prepareVisitPhotoForUpload: mocks.prepare,
  };
});

describe("PhotoUploadClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", vi.fn());
    vi.stubGlobal("URL", {
      createObjectURL: vi.fn(() => "blob:preview"),
      revokeObjectURL: vi.fn(),
    });
  });

  it("does not send the original file when client compression fails", async () => {
    mocks.prepare.mockRejectedValueOnce(new Error("ไม่สามารถย่อรูปนี้ได้ กรุณาเลือกรูปอื่น"));
    render(<PhotoUploadClient visitId="550e8400-e29b-41d4-a716-446655440000" />);

    const source = new File(["camera"], "camera.jpg", { type: "image/jpeg" });
    fireEvent.change(screen.getByLabelText("เลือกรูปถ่าย"), { target: { files: [source] } });
    await userEvent.click(screen.getByRole("button", { name: "อัปโหลดและไปต่อ" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("ไม่สามารถย่อรูปนี้ได้");
    expect(fetch).not.toHaveBeenCalled();
  });

  it("uploads only the prepared file and navigates to certificate preview", async () => {
    const prepared = new File(["small"], "visit-photo.webp", { type: "image/webp" });
    mocks.prepare.mockResolvedValueOnce({
      file: prepared,
      originalBytes: 8_000_000,
      uploadBytes: prepared.size,
    });
    vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify({ photoId: "photo-1" }), {
      status: 200,
      headers: { "content-type": "application/json" },
    }));

    render(<PhotoUploadClient visitId="550e8400-e29b-41d4-a716-446655440000" />);
    fireEvent.change(screen.getByLabelText("เลือกรูปถ่าย"), {
      target: { files: [new File(["camera"], "camera.jpg", { type: "image/jpeg" })] },
    });
    await userEvent.click(screen.getByRole("button", { name: "อัปโหลดและไปต่อ" }));

    await waitFor(() => expect(fetch).toHaveBeenCalledOnce());
    const [endpoint, init] = vi.mocked(fetch).mock.calls[0];
    expect(endpoint).toBe("/api/upload/photo");
    expect(init?.body).toBeInstanceOf(FormData);
    expect((init?.body as FormData).get("file")).toBe(prepared);
    await waitFor(() => expect(mocks.push).toHaveBeenCalledWith(
      "/visit/550e8400-e29b-41d4-a716-446655440000/certificate/preview?photoId=photo-1",
    ));
  });

  it("turns a platform 413 response into a useful Thai recovery message", async () => {
    const prepared = new File(["small"], "visit-photo.webp", { type: "image/webp" });
    mocks.prepare.mockResolvedValueOnce({ file: prepared, originalBytes: 8_000_000, uploadBytes: prepared.size });
    vi.mocked(fetch).mockResolvedValueOnce(new Response("FUNCTION_PAYLOAD_TOO_LARGE", { status: 413 }));

    render(<PhotoUploadClient visitId="550e8400-e29b-41d4-a716-446655440000" />);
    fireEvent.change(screen.getByLabelText("เลือกรูปถ่าย"), {
      target: { files: [new File(["camera"], "camera.jpg", { type: "image/jpeg" })] },
    });
    await userEvent.click(screen.getByRole("button", { name: "อัปโหลดและไปต่อ" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("รูปยังมีขนาดใหญ่เกินไป");
  });
});
