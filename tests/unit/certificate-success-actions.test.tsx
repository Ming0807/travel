import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CertificateSuccessActions } from "@/components/certificate/CertificateSuccessActions";

const visitId = "550e8400-e29b-41d4-a716-446655440000";
const certUrl = "/api/media/image?bucket=certificate-files&path=certificates%2F2026%2F08%2Fvisit.png";

function defineNavigatorProperty(name: "share" | "canShare" | "clipboard", value: unknown) {
  Object.defineProperty(navigator, name, {
    configurable: true,
    value,
  });
}

describe("CertificateSuccessActions download and share contracts", () => {
  let originalCreateObjectUrl: typeof URL.createObjectURL | undefined;
  let originalRevokeObjectUrl: typeof URL.revokeObjectURL | undefined;
  let originalShare: unknown;
  let originalCanShare: unknown;
  let originalClipboard: unknown;

  beforeEach(() => {
    vi.restoreAllMocks();
    originalCreateObjectUrl = URL.createObjectURL;
    originalRevokeObjectUrl = URL.revokeObjectURL;
    originalShare = navigator.share;
    originalCanShare = navigator.canShare;
    originalClipboard = navigator.clipboard;
  });

  afterEach(() => {
    if (originalCreateObjectUrl) {
      Object.defineProperty(URL, "createObjectURL", { configurable: true, value: originalCreateObjectUrl });
    } else {
      delete (URL as Partial<typeof URL>).createObjectURL;
    }
    if (originalRevokeObjectUrl) {
      Object.defineProperty(URL, "revokeObjectURL", { configurable: true, value: originalRevokeObjectUrl });
    } else {
      delete (URL as Partial<typeof URL>).revokeObjectURL;
    }
    defineNavigatorProperty("share", originalShare);
    defineNavigatorProperty("canShare", originalCanShare);
    defineNavigatorProperty("clipboard", originalClipboard);
  });

  it("downloads the generated certificate blob with a stable filename", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(new Blob(["certificate"], { type: "image/png" }), {
        status: 200,
        headers: { "Content-Type": "image/png" },
      }),
    );
    const createObjectUrl = vi.fn(() => "blob:certificate");
    const revokeObjectUrl = vi.fn();
    Object.defineProperty(URL, "createObjectURL", { configurable: true, value: createObjectUrl });
    Object.defineProperty(URL, "revokeObjectURL", { configurable: true, value: revokeObjectUrl });
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);

    render(<CertificateSuccessActions visitId={visitId} certUrl={certUrl} stampStatus="earned" />);
    fireEvent.click(screen.getAllByRole("button")[0]);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(certUrl));
    expect(createObjectUrl).toHaveBeenCalledWith(expect.any(Blob));
    expect(click).toHaveBeenCalled();
    expect(revokeObjectUrl).toHaveBeenCalledWith("blob:certificate");
  });

  it("shares the generated File only when file sharing is supported", async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    const canShare = vi.fn().mockReturnValue(true);
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(new Blob(["certificate"], { type: "image/png" }), {
        status: 200,
        headers: { "Content-Type": "image/png" },
      }),
    );
    defineNavigatorProperty("share", share);
    defineNavigatorProperty("canShare", canShare);

    render(<CertificateSuccessActions visitId={visitId} certUrl={certUrl} stampStatus="earned" />);
    fireEvent.click(screen.getAllByRole("button")[1]);

    await waitFor(() => expect(share).toHaveBeenCalledTimes(1));
    expect(canShare).toHaveBeenCalledWith({ files: [expect.any(File)] });
    const shareData = share.mock.calls[0]?.[0] as ShareData & { files?: File[]; url?: string };
    expect(shareData.files?.[0]).toBeInstanceOf(File);
    expect(shareData.files?.[0]?.type).toBe("image/png");
    expect(shareData.files?.[0]?.name).toBe(`travel-memory-${visitId}.png`);
    expect(shareData.url).toBeUndefined();
  });

  it("never shares the private success URL or the current page URL", async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    const canShare = vi.fn().mockReturnValue(true);
    const currentUrl = window.location.href;
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(new Blob(["certificate"], { type: "image/png" }), {
        status: 200,
        headers: { "Content-Type": "image/png" },
      }),
    );
    defineNavigatorProperty("share", share);
    defineNavigatorProperty("canShare", canShare);

    render(<CertificateSuccessActions visitId={visitId} certUrl={certUrl} stampStatus="earned" />);
    fireEvent.click(screen.getAllByRole("button")[1]);

    await waitFor(() => expect(share).toHaveBeenCalledTimes(1));
    const serialized = JSON.stringify(share.mock.calls[0]?.[0]);
    expect(serialized).not.toContain(certUrl);
    expect(serialized).not.toContain(currentUrl);
  });

  it("shows fallback download instructions when file sharing is unavailable", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(new Blob(["certificate"], { type: "image/png" }), {
        status: 200,
        headers: { "Content-Type": "image/png" },
      }),
    );
    defineNavigatorProperty("share", undefined);
    defineNavigatorProperty("canShare", vi.fn().mockReturnValue(false));
    defineNavigatorProperty("clipboard", { writeText });

    render(<CertificateSuccessActions visitId={visitId} certUrl={certUrl} stampStatus="earned" />);
    fireEvent.click(screen.getAllByRole("button")[1]);

    await waitFor(() =>
      expect(screen.getByText(/เปิดภาพแล้วกดค้างเพื่อบันทึก|ดาวน์โหลดใบประกาศจากปุ่มบันทึก/)).toBeInTheDocument(),
    );
    expect(writeText).not.toHaveBeenCalledWith(window.location.href);
  });

  it("disables certificate actions and offers a Thai retry when the certificate record is missing", () => {
    render(<CertificateSuccessActions visitId={visitId} certUrl="" stampStatus="none" />);

    expect(screen.getByText("ยังไม่พบไฟล์ใบประกาศ")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "บันทึกรูปภาพ" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "แชร์ให้เพื่อน" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "ลองสร้างใบประกาศอีกครั้ง" })).toBeEnabled();
  });
});
