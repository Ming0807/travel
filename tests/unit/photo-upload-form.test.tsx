import { describe, expect, it, vi, beforeEach, afterEach, type Mock } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PhotoUploadForm } from "@/components/visit/PhotoUploadForm";

// Mock next/navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

// Mock fetch
const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

// Track created object URLs
const createdUrls: string[] = [];
let urlIndex = 0;
globalThis.URL.createObjectURL = vi.fn(() => {
  const url = `blob:mock-url-${urlIndex++}`;
  createdUrls.push(url);
  return url;
});
globalThis.URL.revokeObjectURL = vi.fn();

describe("PhotoUploadForm", () => {
  const visitId = "550e8400-e29b-41d4-a716-446655440000";

  beforeEach(() => {
    vi.clearAllMocks();
    createdUrls.length = 0;
    urlIndex = 0;
    mockFetch.mockReset();
    (globalThis.URL.createObjectURL as Mock).mockClear();
    (globalThis.URL.revokeObjectURL as Mock).mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders upload UI initially", () => {
    render(<PhotoUploadForm visitId={visitId} />);
    expect(screen.getByText("อัปโหลดรูปความทรงจำ")).toBeInTheDocument();
    expect(screen.getByText(/คลิกเพื่ออัปโหลด/)).toBeInTheDocument();
    expect(screen.getByText(/JPG, PNG, WebP/)).toBeInTheDocument();
  });

  it("renders hidden file input with correct accept attribute", () => {
    render(<PhotoUploadForm visitId={visitId} />);
    const fileInput = document.querySelector('input[type="file"]');
    expect(fileInput).toBeInTheDocument();
    expect(fileInput).toHaveAttribute("accept", "image/jpeg, image/png, image/webp");
    expect(fileInput).toHaveClass("hidden");
  });

  it("upload button is disabled when no file selected", () => {
    render(<PhotoUploadForm visitId={visitId} />);
    const button = screen.getByRole("button", { name: /ยืนยันรูปภาพ/ });
    expect(button).toBeDisabled();
  });

  it("shows error for oversized file using fireEvent.change", () => {
    render(<PhotoUploadForm visitId={visitId} />);

    const file = new File(["x".repeat(6 * 1024 * 1024)], "large.jpg", { type: "image/jpeg" });
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(screen.getByText(/ไฟล์มีขนาดใหญ่เกินไป/)).toBeInTheDocument();
  });

  it("shows error for invalid file type using fireEvent.change", () => {
    render(<PhotoUploadForm visitId={visitId} />);

    // SVG file with non-matching extension
    const file = new File(["<svg></svg>"], "image.svg", { type: "image/svg+xml" });
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(screen.getByText(/รองรับเฉพาะไฟล์ JPG/)).toBeInTheDocument();
  });

  it("shows preview after valid file selection using fireEvent.change", () => {
    render(<PhotoUploadForm visitId={visitId} />);

    const file = new File(["valid-image"], "photo.jpg", { type: "image/jpeg" });
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(fileInput, { target: { files: [file] } });

    const previewImg = document.querySelector("img[alt='Preview']");
    expect(previewImg).toBeInTheDocument();
    expect(previewImg).toHaveAttribute("src", createdUrls[0]);

    const button = screen.getByRole("button", { name: /ยืนยันรูปภาพ/ });
    expect(button).toBeEnabled();
  });

  it("shows preview after valid file selection using userEvent.upload", async () => {
    render(<PhotoUploadForm visitId={visitId} />);

    const file = new File(["valid-image"], "photo.jpg", { type: "image/jpeg" });
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

    await userEvent.setup();
    await userEvent.upload(fileInput, file);

    const previewImg = document.querySelector("img[alt='Preview']");
    expect(previewImg).toBeInTheDocument();
    expect(previewImg).toHaveAttribute("src", createdUrls[0]);
  });

  it("shows drag over visual state", () => {
    render(<PhotoUploadForm visitId={visitId} />);

    const label = document.querySelector("label");
    expect(label).toBeInTheDocument();

    // Simulate drag over
    fireEvent.dragOver(label!);
    expect(label!.className).toContain("border-teal");
    expect(label!.className).toContain("scale-[1.02]");

    // Simulate drag leave
    fireEvent.dragLeave(label!);
    expect(label!.className).toContain("border-gray-300");
  });

  it("handles file drop via drag-and-drop", () => {
    render(<PhotoUploadForm visitId={visitId} />);

    const label = document.querySelector("label")!;
    const file = new File(["valid-image"], "photo.png", { type: "image/png" });

    // Simulate drag over then drop
    fireEvent.dragOver(label);
    fireEvent.drop(label, {
      dataTransfer: { files: [file] },
    });

    const previewImg = document.querySelector("img[alt='Preview']");
    expect(previewImg).toBeInTheDocument();
    expect(previewImg).toHaveAttribute("src", createdUrls[0]);
  });

  it("shows loading state during upload", async () => {
    mockFetch.mockImplementation(() => new Promise(() => {})); // never resolves

    render(<PhotoUploadForm visitId={visitId} />);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [new File(["img"], "test.jpg", { type: "image/jpeg" })] } });

    const button = screen.getByRole("button", { name: /ยืนยันรูปภาพ/ });
    await userEvent.click(button);

    expect(screen.getByText(/กำลังอัปโหลด/)).toBeInTheDocument();
    expect(button).toBeDisabled();
  });

  it("navigates to preview page on successful upload", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        photoId: "photo-123",
        previewUrl: "https://example.com/preview.jpg",
      }),
    });

    render(<PhotoUploadForm visitId={visitId} />);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [new File(["img"], "test.jpg", { type: "image/jpeg" })] } });

    const button = screen.getByRole("button", { name: /ยืนยันรูปภาพ/ });
    await userEvent.click(button);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(
        `/visit/${visitId}/certificate/preview?photoId=photo-123`
      );
    });
  });

  it("shows error message on upload failure", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Upload failed" }),
    });

    render(<PhotoUploadForm visitId={visitId} />);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [new File(["img"], "test.jpg", { type: "image/jpeg" })] } });

    const button = screen.getByRole("button", { name: /ยืนยันรูปภาพ/ });
    await userEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText("Upload failed")).toBeInTheDocument();
    });
  });

  it("shows network error message on failed request", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"));

    render(<PhotoUploadForm visitId={visitId} />);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [new File(["img"], "test.jpg", { type: "image/jpeg" })] } });

    const button = screen.getByRole("button", { name: /ยืนยันรูปภาพ/ });
    await userEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText("Network error")).toBeInTheDocument();
    });
  });

  it("calls URL.revokeObjectURL when file changes", () => {
    render(<PhotoUploadForm visitId={visitId} />);

    // Upload first file — React re-renders and replaces the old <input> with a new one
    const firstInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    act(() => {
      fireEvent.change(firstInput, { target: { files: [new File(["img1"], "a.jpg", { type: "image/jpeg" })] } });
    });

    // Re-query the input — after re-render, the old input is detached from DOM
    const secondInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(secondInput).not.toBe(firstInput); // verify it's a different element

    // Upload second file — should revoke first URL because previewUrl is now set
    act(() => {
      fireEvent.change(secondInput, { target: { files: [new File(["img2"], "b.jpg", { type: "image/jpeg" })] } });
    });

    expect(globalThis.URL.revokeObjectURL).toHaveBeenCalled();
  });

  it("cleans up object URL on unmount", () => {
    const { unmount } = render(<PhotoUploadForm visitId={visitId} />);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [new File(["img"], "test.jpg", { type: "image/jpeg" })] } });

    unmount();
    expect(globalThis.URL.revokeObjectURL).toHaveBeenCalled();
  });
});
