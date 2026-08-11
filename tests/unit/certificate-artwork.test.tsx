import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CertificateArtwork } from "@/components/certificate/CertificateArtwork";
import { createDefaultCertificateLayout } from "@/lib/certificate/certificate-template-layout";

describe("CertificateArtwork", () => {
  it("applies the saved position, shape, colors, and visibility controls", () => {
    const layout = {
      ...createDefaultCertificateLayout("landscape", "emerald-gold"),
      photoShape: "rounded" as const,
      photoX: 31,
      photoY: 58,
      photoSize: 28,
      textColor: "#112233",
      accentColor: "#445566",
      showProvince: false,
      showDate: false,
    };
    const { container } = render(
      <CertificateArtwork
        layout={layout}
        templateBackgroundUrl="/template.webp"
        previewUrl="/photo.webp"
        touristName="นักเดินทาง"
        attractionName="สกายวอล์คอัยเยอร์เวง"
        provinceName="ยะลา"
        visitDate="16 กรกฎาคม 2569"
        showSafeZone
      />
    );

    const photoFrame = container.querySelector("[data-certificate-photo-frame]");
    expect(photoFrame).toHaveClass("rounded-lg");
    expect(photoFrame).toHaveStyle({ left: "31%", top: "58%", width: "28%" });
    expect(container.querySelector('[data-orientation="landscape"]')).toHaveStyle({
      color: "#112233",
    });
    expect(screen.queryByText("ยะลา")).not.toBeInTheDocument();
    expect(screen.queryByText("16 กรกฎาคม 2569")).not.toBeInTheDocument();
    expect(screen.getByLabelText("ขอบเขตปลอดภัย")).toBeInTheDocument();
  });

  it("preserves a full background and rectangular custom photo placement without a baked circular opening", () => {
    const layout = {
      ...createDefaultCertificateLayout("portrait", "coral-white"),
      photoShape: "square" as const,
      photoX: 64,
      photoY: 42,
      photoSize: 34,
    };
    const { container } = render(
      <CertificateArtwork
        layout={layout}
        templateBackgroundUrl="/templates/full-background.webp"
        previewUrl="/photos/memory.webp"
        touristName="นักเดินทาง"
        attractionName="เมืองยะลา"
        provinceName="ยะลา"
        visitDate="16 สิงหาคม 2569"
      />,
    );

    const photoFrame = container.querySelector("[data-certificate-photo-frame]");
    expect(photoFrame).toHaveClass("rounded-none");
    expect(photoFrame).not.toHaveClass("rounded-full");
    expect(photoFrame).toHaveStyle({ left: "64%", top: "42%", width: "34%" });
    expect(container.querySelector('img[src="/templates/full-background.webp"]')).toBeInTheDocument();
    expect(container.querySelector('img[src="/photos/memory.webp"]')).toBeInTheDocument();
  });
});
