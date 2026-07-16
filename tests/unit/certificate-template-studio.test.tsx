import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createDefaultCertificateLayout } from "@/lib/certificate/certificate-template-layout";

const mocks = vi.hoisted(() => ({
  updateLayout: vi.fn(),
}));

vi.mock("@/app/actions/admin-certificate-templates", () => ({
  updateCertificateTemplateLayout: mocks.updateLayout,
}));

import { CertificateTemplateStudio } from "@/components/admin/certificate-templates/CertificateTemplateStudio";

const template = {
  templateId: 7,
  templateName: "ความทรงจำยะลา",
  backgroundUrl: "https://example.com/template.webp",
  attractionName: "สกายวอล์คอัยเยอร์เวง",
  language: "th",
  layout: createDefaultCertificateLayout("landscape", "emerald-gold"),
};

describe("CertificateTemplateStudio", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.updateLayout.mockResolvedValue({ success: true });
  });

  it("shows the real renderer, grouped controls, and a safe initial layout", () => {
    render(<CertificateTemplateStudio template={template} />);

    expect(screen.getByRole("heading", { name: "ออกแบบ ความทรงจำยะลา" })).toBeInTheDocument();
    expect(screen.getByText("องค์ประกอบอยู่ในขอบเขตปลอดภัย")).toBeInTheDocument();
    expect(screen.getByRole("slider", { name: "ขอบเขตปลอดภัย" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: "รูป" }));
    expect(screen.getByRole("heading", { name: "รูปนักท่องเที่ยว" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: "ข้อความ" }));
    expect(screen.getByRole("heading", { name: "ข้อความ" })).toBeInTheDocument();
  });

  it("saves the typed layout through the guarded server action", async () => {
    render(<CertificateTemplateStudio template={template} />);
    fireEvent.click(screen.getByRole("tab", { name: "รูป" }));
    fireEvent.click(screen.getByRole("button", { name: "มุมมน" }));
    fireEvent.click(screen.getByRole("button", { name: "บันทึกรูปแบบจากส่วนหัว" }));

    await waitFor(() => {
      expect(mocks.updateLayout).toHaveBeenCalledWith(
        7,
        expect.objectContaining({
          version: 1,
          orientation: "landscape",
          photoShape: "rounded",
          photoX: 27,
          contentX: 68,
        })
      );
    });
    expect((await screen.findAllByText("บันทึกแล้ว")).length).toBeGreaterThan(0);
  });

  it("discards draft controls back to the last saved layout", () => {
    render(<CertificateTemplateStudio template={template} />);
    fireEvent.click(screen.getByRole("tab", { name: "รูป" }));
    fireEvent.click(screen.getByRole("button", { name: "มุมมน" }));
    expect(screen.getByRole("button", { name: "มุมมน" })).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(screen.getByRole("button", { name: "ยกเลิกการแก้ไขจากส่วนหัว" }));
    expect(screen.getByRole("button", { name: "วงกลม" })).toHaveAttribute("aria-pressed", "true");
  });
});
