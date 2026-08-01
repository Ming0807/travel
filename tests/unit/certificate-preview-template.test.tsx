import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { toPngMock } = vi.hoisted(() => ({ toPngMock: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

vi.mock("html-to-image", () => ({
  toPng: toPngMock,
}));

import { CertificatePreview } from "@/components/certificate/CertificatePreview";
import { createDefaultCertificateLayout } from "@/lib/certificate/certificate-template-layout";

describe("CertificatePreview template rendering", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    toPngMock.mockReset();
  });

  it("renders the resolved background and template name in landscape mode", () => {
    const { container } = render(
      <CertificatePreview
        visitId="550e8400-e29b-41d4-a716-446655440000"
        photoId=""
        previewUrl=""
        touristName="นักท่องเที่ยว"
        attractionName="สกายวอล์คอัยเยอร์เวง"
        provinceName="ยะลา"
        visitDate="16 กรกฎาคม 2569"
        templateId={7}
        templateName="ความทรงจำยะลา"
        templateBackgroundUrl="https://example.com/template.webp"
        language="th"
        layout={createDefaultCertificateLayout("landscape", "emerald-gold")}
      />
    );

    expect(screen.getByText("รูปแบบ: ความทรงจำยะลา")).toBeInTheDocument();
    const background = container.querySelector(
      'img[src="https://example.com/template.webp"]'
    );
    expect(background).toHaveAttribute("aria-hidden", "true");
    const artwork = container.querySelector('[data-orientation="landscape"]');
    expect(artwork?.parentElement?.parentElement).toHaveClass("aspect-[1.414/1]");
  });

  it("lets the tourist switch templates and adjust the photo crop", () => {
    const layout = createDefaultCertificateLayout("landscape", "emerald-gold");
    const { container } = render(
      <CertificatePreview
        visitId="550e8400-e29b-41d4-a716-446655440000"
        photoId="photo-1"
        previewUrl="https://example.com/photo.webp"
        touristName="นักท่องเที่ยว"
        attractionName="สกายวอล์คอัยเยอร์เวง"
        provinceName="ยะลา"
        visitDate="1 สิงหาคม 2569"
        templateId={7}
        templateName="หมอกเช้า"
        templateBackgroundUrl="https://example.com/first.webp"
        language="th"
        layout={layout}
        templates={[
          {
            templateId: 7,
            templateName: "หมอกเช้า",
            backgroundUrl: "https://example.com/first.webp",
            attractionId: null,
            language: "th",
            orientation: "landscape",
            layout,
          },
          {
            templateId: 8,
            templateName: "ป่าฮาลา",
            backgroundUrl: "https://example.com/second.webp",
            attractionId: 12,
            language: "th",
            orientation: "landscape",
            layout,
          },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /ป่าฮาลา/ }));
    expect(container.querySelector('img[src="https://example.com/second.webp"]')).toBeInTheDocument();

    const adjustmentToggle = container.querySelector<HTMLButtonElement>(
      'button[aria-controls="certificate-photo-controls"]',
    );
    expect(adjustmentToggle).not.toBeNull();
    expect(adjustmentToggle).toHaveAttribute("aria-expanded", "true");
    fireEvent.change(screen.getByLabelText(/^ซูมรูปภาพ/), { target: { value: "1.5" } });
    fireEvent.change(screen.getByLabelText(/^ตำแหน่งแนวนอน/), { target: { value: "70" } });

    const touristPhoto = screen.getByAltText("รูปความทรงจำของนักท่องเที่ยว");
    expect(touristPhoto).toHaveStyle({ transform: "scale(1.5)", objectPosition: "70% 50%" });

    fireEvent.click(screen.getByRole("button", { name: "คืนค่าเดิม" }));
    expect(touristPhoto).toHaveStyle({ transform: "scale(1)", objectPosition: "50% 50%" });
  });

  it("generates the certificate with the template selected by the tourist", async () => {
    const layout = createDefaultCertificateLayout("landscape", "emerald-gold");
    toPngMock.mockResolvedValue("data:image/png;base64,certificate");
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ certificateId: 99, stamp: { status: "earned" } }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    render(
      <CertificatePreview
        visitId="550e8400-e29b-41d4-a716-446655440000"
        photoId="photo-1"
        previewUrl="https://example.com/photo.webp"
        touristName="นักท่องเที่ยว"
        attractionName="สกายวอล์คอัยเยอร์เวง"
        provinceName="ยะลา"
        visitDate="1 สิงหาคม 2569"
        templateId={7}
        templateName="หมอกเช้า"
        templateBackgroundUrl="https://example.com/first.webp"
        language="th"
        layout={layout}
        templates={[
          {
            templateId: 7,
            templateName: "หมอกเช้า",
            backgroundUrl: "https://example.com/first.webp",
            attractionId: null,
            language: "th",
            orientation: "landscape",
            layout,
          },
          {
            templateId: 8,
            templateName: "ป่าฮาลา",
            backgroundUrl: "https://example.com/second.webp",
            attractionId: 12,
            language: "th",
            orientation: "landscape",
            layout,
          },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /ป่าฮาลา/ }));
    fireEvent.click(screen.getByRole("button", { name: "สร้างใบประกาศดิจิทัล" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body))).toMatchObject({
      visitId: "550e8400-e29b-41d4-a716-446655440000",
      photoId: "photo-1",
      templateId: 8,
      language: "th",
    });
  });
});
