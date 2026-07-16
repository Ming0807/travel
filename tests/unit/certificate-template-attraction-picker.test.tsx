import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  search: vi.fn(),
}));

vi.mock("@/app/actions/admin-certificate-templates", () => ({
  searchCertificateTemplateAttractions: mocks.search,
}));

import { TemplateAttractionPicker } from "@/components/admin/certificate-templates/TemplateAttractionPicker";

describe("TemplateAttractionPicker", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.search.mockResolvedValue({
      success: true,
      data: [
        {
          attraction_id: 12,
          name_th: "สกายวอล์คอัยเยอร์เวง",
          name_en: "Aiyerweng Skywalk",
          slug: "aiyerweng-skywalk",
        },
      ],
    });
  });

  it("starts in global mode and reveals guided search for attraction scope", () => {
    const { container } = render(<TemplateAttractionPicker />);
    expect(container.querySelector('input[name="template_scope"]')).toHaveValue("global");
    expect(container.querySelector('input[name="attraction_id"]')).toHaveValue("");

    fireEvent.click(screen.getByRole("button", { name: "เฉพาะสถานที่" }));
    expect(container.querySelector('input[name="template_scope"]')).toHaveValue("attraction");
    expect(screen.getByLabelText("ค้นหาสถานที่สำหรับเทมเพลต")).toBeInTheDocument();
  });

  it("stores the selected attraction id in the submitted hidden field", async () => {
    const { container } = render(<TemplateAttractionPicker />);
    fireEvent.click(screen.getByRole("button", { name: "เฉพาะสถานที่" }));
    fireEvent.change(screen.getByLabelText("ค้นหาสถานที่สำหรับเทมเพลต"), {
      target: { value: "อัยเยอร์เวง" },
    });
    fireEvent.click(screen.getByRole("button", { name: "ค้นหา" }));
    fireEvent.click(await screen.findByRole("button", { name: /สกายวอล์คอัยเยอร์เวง/ }));

    expect(container.querySelector('input[name="attraction_id"]')).toHaveValue("12");
  });
});
