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
    vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();
  });

  it("offers separate mobile controls for the camera and photo library or files", () => {
    render(<PhotoUploadClient visitId="550e8400-e29b-41d4-a716-446655440000" />);

    expect(screen.getByRole("button", { name: "ถ่ายรูป" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "เลือกจากคลังรูปหรือไฟล์" })
    ).toBeInTheDocument();

    const libraryInput = screen.getByLabelText("เลือกจากคลังรูปหรือแอปไฟล์");
    expect(libraryInput).toHaveAttribute(
      "accept",
      "image/jpeg,image/png,image/webp,image/heic,image/heif"
    );
    expect(libraryInput).not.toHaveAttribute("capture");

    const cameraInput = screen.getByLabelText("ถ่ายรูปด้วยกล้อง");
    expect(cameraInput).toHaveAttribute("capture", "environment");
    expect(cameraInput).toHaveAttribute("accept", "image/*");
  });

  it("requests camera permission only after the tourist chooses to take a photo", async () => {
    const stop = vi.fn();
    const getUserMedia = vi.fn().mockResolvedValue({
      getTracks: () => [{ stop }],
    });
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: { getUserMedia },
    });
    Object.defineProperty(window, "isSecureContext", {
      configurable: true,
      value: true,
    });

    render(<PhotoUploadClient visitId="550e8400-e29b-41d4-a716-446655440000" />);

    expect(getUserMedia).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole("button", { name: "ถ่ายรูป" }));

    expect(await screen.findByRole("dialog", { name: "ใช้กล้องถ่ายรูป" })).toBeInTheDocument();
    await waitFor(() => expect(getUserMedia).toHaveBeenCalledWith({
      audio: false,
      video: { facingMode: { ideal: "environment" } },
    }));
    expect(screen.getByText(/ระบบจะขอสิทธิ์ใช้กล้องเมื่อคุณกดปุ่มนี้เท่านั้น/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "ปิดกล้อง" }));
    expect(stop).toHaveBeenCalledOnce();
  });

  it("offers the native camera fallback when browser camera permission is denied", async () => {
    const permissionError = new DOMException("denied", "NotAllowedError");
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: { getUserMedia: vi.fn().mockRejectedValue(permissionError) },
    });
    Object.defineProperty(window, "isSecureContext", {
      configurable: true,
      value: true,
    });

    render(<PhotoUploadClient visitId="550e8400-e29b-41d4-a716-446655440000" />);
    const nativeCameraInput = screen.getByLabelText("ถ่ายรูปด้วยกล้อง");
    const nativeClick = vi.spyOn(nativeCameraInput, "click");

    await userEvent.click(screen.getByRole("button", { name: "ถ่ายรูป" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "ยังไม่ได้อนุญาตให้ใช้กล้อง",
    );
    await userEvent.click(screen.getByRole("button", { name: "เปิดกล้องของอุปกรณ์" }));
    expect(nativeClick).toHaveBeenCalledOnce();
  });

  it("lets the tourist capture and confirm a photo before uploading", async () => {
    const stop = vi.fn();
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: {
        getUserMedia: vi.fn().mockResolvedValue({
          getTracks: () => [{ stop }],
        }),
      },
    });
    Object.defineProperty(window, "isSecureContext", {
      configurable: true,
      value: true,
    });
    const drawImage = vi.fn();
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
      drawImage,
    } as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation((callback) => {
      callback(new Blob(["camera-photo"], { type: "image/jpeg" }));
    });

    const { container } = render(
      <PhotoUploadClient visitId="550e8400-e29b-41d4-a716-446655440000" />,
    );
    await userEvent.click(screen.getByRole("button", { name: "ถ่ายรูป" }));
    await screen.findByRole("dialog", { name: "ใช้กล้องถ่ายรูป" });

    const video = container.querySelector("video");
    expect(video).not.toBeNull();
    Object.defineProperty(video, "videoWidth", { configurable: true, value: 1280 });
    Object.defineProperty(video, "videoHeight", { configurable: true, value: 960 });
    await userEvent.click(screen.getByRole("button", { name: "ถ่ายภาพ" }));

    expect(drawImage).toHaveBeenCalledOnce();
    await userEvent.click(screen.getByRole("button", { name: "ใช้ภาพนี้" }));
    expect(screen.queryByRole("dialog", { name: "ใช้กล้องถ่ายรูป" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "อัปโหลดและไปต่อ" })).toBeEnabled();
    expect(stop).toHaveBeenCalled();
  });

  it("does not send the original file when client compression fails", async () => {
    mocks.prepare.mockRejectedValueOnce(new Error("ไม่สามารถย่อรูปนี้ได้ กรุณาเลือกรูปอื่น"));
    render(<PhotoUploadClient visitId="550e8400-e29b-41d4-a716-446655440000" />);

    const source = new File(["camera"], "camera.jpg", { type: "image/jpeg" });
    fireEvent.change(screen.getByLabelText("เลือกจากคลังรูปหรือแอปไฟล์"), { target: { files: [source] } });
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
    fireEvent.change(screen.getByLabelText("เลือกจากคลังรูปหรือแอปไฟล์"), {
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
    fireEvent.change(screen.getByLabelText("เลือกจากคลังรูปหรือแอปไฟล์"), {
      target: { files: [new File(["camera"], "camera.jpg", { type: "image/jpeg" })] },
    });
    await userEvent.click(screen.getByRole("button", { name: "อัปโหลดและไปต่อ" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("รูปยังมีขนาดใหญ่เกินไป");
  });
});
