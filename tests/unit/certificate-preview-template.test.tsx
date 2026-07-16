import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

import { CertificatePreview } from "@/components/certificate/CertificatePreview";

describe("CertificatePreview template rendering", () => {
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
        orientation="landscape"
      />
    );

    expect(screen.getByText("รูปแบบ: ความทรงจำยะลา")).toBeInTheDocument();
    const background = container.querySelector(
      'img[src="https://example.com/template.webp"]'
    );
    expect(background).toHaveAttribute("aria-hidden", "true");
    expect(background?.closest("div.relative.w-full")).toHaveClass("aspect-[1.414/1]");
  });
});
