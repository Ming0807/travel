import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CameraCaptureDialog } from "@/components/checkin/CameraCaptureDialog";
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

const visitId = "550e8400-e29b-41d4-a716-446655440000";

function installCamera(getUserMedia: ReturnType<typeof vi.fn>) {
  Object.defineProperty(navigator, "mediaDevices", {
    configurable: true,
    value: { getUserMedia },
  });
  Object.defineProperty(window, "isSecureContext", {
    configurable: true,
    value: true,
  });
}

function makeStream() {
  const stop = vi.fn();
  const stream = {
    getTracks: () => [{ stop }],
  } as unknown as MediaStream;
  return { stream, stop };
}

function mockCameraCanvas() {
  const drawImage = vi.fn();
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
    drawImage,
  } as unknown as CanvasRenderingContext2D);
  vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation((callback) => {
    callback(new Blob(["camera-photo"], { type: "image/jpeg" }));
  });
  return drawImage;
}

async function openCamera(getUserMedia: ReturnType<typeof vi.fn>) {
  render(<PhotoUploadClient visitId={visitId} />);
  await userEvent.click(screen.getByRole("button", { name: "ถ่ายรูป" }));
  const dialog = await screen.findByRole("dialog", { name: "ใช้กล้องถ่ายรูป" });
  await waitFor(() => expect(getUserMedia).toHaveBeenCalledOnce());
  return dialog;
}

describe("photo upload mobile interaction contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", vi.fn());
    vi.stubGlobal("URL", {
      createObjectURL: vi.fn(() => "blob:photo-preview"),
      revokeObjectURL: vi.fn(),
    });
    vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: undefined,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("keeps camera and gallery actions distinct", () => {
    render(<PhotoUploadClient visitId={visitId} />);

    expect(screen.getByRole("button", { name: "ถ่ายรูป" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "เลือกจากคลังรูปหรือไฟล์" })).toBeInTheDocument();

    const galleryInput = screen.getByLabelText("เลือกจากคลังรูปหรือแอปไฟล์");
    const cameraInput = screen.getByLabelText("ถ่ายรูปด้วยกล้อง");
    expect(galleryInput).not.toHaveAttribute("capture");
    expect(galleryInput).toHaveAttribute(
      "accept",
      "image/jpeg,image/png,image/webp,image/heic,image/heif",
    );
    expect(cameraInput).toHaveAttribute("capture", "environment");
    expect(cameraInput).toHaveAttribute("accept", "image/*");
  });

  it("never requests camera permission when the tourist chooses the gallery", async () => {
    const getUserMedia = vi.fn();
    installCamera(getUserMedia);
    render(<PhotoUploadClient visitId={visitId} />);

    const galleryInput = screen.getByLabelText("เลือกจากคลังรูปหรือแอปไฟล์");
    const galleryClick = vi.spyOn(galleryInput, "click");
    await userEvent.click(screen.getByRole("button", { name: "เลือกจากคลังรูปหรือไฟล์" }));

    expect(galleryClick).toHaveBeenCalledOnce();
    expect(getUserMedia).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog", { name: "ใช้กล้องถ่ายรูป" })).not.toBeInTheDocument();
  });

  it("requests camera permission only after the camera action and uses the rear-facing constraint", async () => {
    const { stream } = makeStream();
    const getUserMedia = vi.fn().mockResolvedValue(stream);
    installCamera(getUserMedia);
    render(<PhotoUploadClient visitId={visitId} />);
    const galleryInput = screen.getByLabelText("เลือกจากคลังรูปหรือแอปไฟล์");
    const galleryClick = vi.spyOn(galleryInput, "click");

    expect(getUserMedia).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole("button", { name: "ถ่ายรูป" }));
    await screen.findByRole("dialog", { name: "ใช้กล้องถ่ายรูป" });

    expect(galleryClick).not.toHaveBeenCalled();
    await waitFor(() => expect(getUserMedia).toHaveBeenCalledWith({
      audio: false,
      video: { facingMode: { ideal: "environment" } },
    }));
  });

  it("shows a permission-denied recovery path that opens the native camera input", async () => {
    const getUserMedia = vi.fn().mockRejectedValue(new DOMException("denied", "NotAllowedError"));
    installCamera(getUserMedia);
    render(<PhotoUploadClient visitId={visitId} />);

    const cameraInput = screen.getByLabelText("ถ่ายรูปด้วยกล้อง");
    const nativeClick = vi.spyOn(cameraInput, "click");
    await userEvent.click(screen.getByRole("button", { name: "ถ่ายรูป" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("ยังไม่ได้อนุญาตให้ใช้กล้อง");
    await userEvent.click(screen.getByRole("button", { name: "เปิดแอปกล้อง" }));
    await waitFor(() => expect(nativeClick).toHaveBeenCalledOnce());
  });

  it("contains focus inside the camera dialog and restores focus to the camera trigger", async () => {
    const { stream } = makeStream();
    const getUserMedia = vi.fn().mockResolvedValue(stream);
    installCamera(getUserMedia);
    render(<PhotoUploadClient visitId={visitId} />);

    const trigger = screen.getByRole("button", { name: "ถ่ายรูป" });
    await userEvent.click(trigger);
    const dialog = await screen.findByRole("dialog", { name: "ใช้กล้องถ่ายรูป" });
    const closeButton = screen.getByRole("button", { name: "ปิดกล้อง" });
    const captureButton = screen.getByRole("button", { name: "ถ่ายภาพ" });

    expect(document.activeElement).toBe(closeButton);
    captureButton.focus();
    fireEvent.keyDown(document, { key: "Tab" });
    expect(document.activeElement).toBe(closeButton);
    closeButton.focus();
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(captureButton);
    expect(dialog).toHaveAttribute("aria-modal", "true");

    await userEvent.click(closeButton);
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "ใช้กล้องถ่ายรูป" })).not.toBeInTheDocument());
    expect(document.activeElement).toBe(trigger);
  });

  it("stops every active media track when the dialog closes", async () => {
    const { stream, stop } = makeStream();
    const getUserMedia = vi.fn().mockResolvedValue(stream);
    installCamera(getUserMedia);
    render(<PhotoUploadClient visitId={visitId} />);
    await userEvent.click(screen.getByRole("button", { name: "ถ่ายรูป" }));
    await screen.findByRole("dialog", { name: "ใช้กล้องถ่ายรูป" });
    await waitFor(() => expect(getUserMedia).toHaveBeenCalledOnce());

    await userEvent.click(screen.getByRole("button", { name: "ปิดกล้อง" }));
    await waitFor(() => expect(stop).toHaveBeenCalledOnce());
  });

  it("stops the media stream when the dialog is unmounted", async () => {
    const { stream, stop } = makeStream();
    const getUserMedia = vi.fn().mockResolvedValue(stream);
    installCamera(getUserMedia);
    const { unmount } = render(
      <CameraCaptureDialog onCapture={vi.fn()} onClose={vi.fn()} onNativeFallback={vi.fn()} />,
    );
    await waitFor(() => expect(getUserMedia).toHaveBeenCalledOnce());

    unmount();
    expect(stop).toHaveBeenCalledOnce();
  });

  it("supports retaking a captured image before accepting it", async () => {
    const { stream } = makeStream();
    const getUserMedia = vi.fn().mockResolvedValue(stream);
    installCamera(getUserMedia);
    mockCameraCanvas();
    const dialog = await openCamera(getUserMedia);
    const video = dialog.querySelector("video");
    expect(video).not.toBeNull();
    Object.defineProperty(video, "videoWidth", { configurable: true, value: 1280 });
    Object.defineProperty(video, "videoHeight", { configurable: true, value: 960 });

    await userEvent.click(screen.getByRole("button", { name: "ถ่ายภาพ" }));
    expect(screen.getByRole("button", { name: "ใช้ภาพนี้" })).toBeInTheDocument();
    expect(screen.getByAltText("ภาพที่เพิ่งถ่าย")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "ถ่ายใหม่" }));
    expect(screen.queryByRole("button", { name: "ใช้ภาพนี้" })).not.toBeInTheDocument();
    expect(screen.queryByAltText("ภาพที่เพิ่งถ่าย")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "ถ่ายภาพ" })).toBeEnabled();
  });

  it("keeps the photo step optional with a direct no-photo certificate link", () => {
    render(<PhotoUploadClient visitId={visitId} />);
    const skip = screen.getByRole("link", { name: /ข้าม.*ใบประกาศ/ });
    expect(skip).toHaveAttribute("href", `/visit/${visitId}/certificate/preview`);
    expect(skip).toHaveTextContent(/ข้ามรูปภาพ/);
    expect(screen.getByText(/ใบประกาศไม่มีรูปส่วนตัว/)).toBeInTheDocument();
  });

  it("accepts HEIC files and surfaces compression failures without uploading the source", async () => {
    mocks.prepare.mockRejectedValueOnce(new Error("ไม่สามารถย่อรูปนี้ได้ กรุณาเลือกรูปอื่น"));
    render(<PhotoUploadClient visitId={visitId} />);

    const heic = new File(["heic-bytes"], "holiday.HEIC", { type: "image/heic" });
    fireEvent.change(screen.getByLabelText("เลือกจากคลังรูปหรือแอปไฟล์"), {
      target: { files: [heic] },
    });
    expect(screen.getByText("holiday.HEIC")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /อัปโหลด.*สร้างใบประกาศ/ }));
    expect(await screen.findByRole("alert")).toHaveTextContent("ไม่สามารถย่อรูปนี้ได้");
    expect(fetch).not.toHaveBeenCalled();
  });

  it("keeps the camera dialog within dynamic viewport and safe-area layout contracts", async () => {
    const { stream } = makeStream();
    const getUserMedia = vi.fn().mockResolvedValue(stream);
    installCamera(getUserMedia);
    render(<CameraCaptureDialog onCapture={vi.fn()} onClose={vi.fn()} onNativeFallback={vi.fn()} />);
    const dialog = await screen.findByRole("dialog", { name: "ใช้กล้องถ่ายรูป" });
    const footer = dialog.querySelector("footer");

    expect(dialog.className).toContain("h-[100dvh]");
    expect(dialog.className).toContain("max-h-[100dvh]");
    expect(footer?.className).toContain("env(safe-area-inset-bottom)");
    expect(screen.getByRole("button", { name: "ถ่ายภาพ" })).toHaveClass("h-16");
  });
});
