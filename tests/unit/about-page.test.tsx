import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import AboutPage from "@/app/(public)/about/page";

vi.mock("@/components/layout/SiteFooter", () => ({
  SiteFooter: () => <div data-testid="site-footer">Footer</div>,
}));

describe("About Page public evidence", () => {
  it("describes the current Yala pilot and only links to real product routes", () => {
    render(<AboutPage />);

    expect(screen.getByRole("heading", { level: 1, name: /แพลตฟอร์มข้อมูลท่องเที่ยวยะลา/ })).toBeInTheDocument();
    expect(screen.getByText(/โครงการระบบสารสนเทศต้นแบบ/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /สำรวจสถานที่ในยะลา/ })).toHaveAttribute("href", "/attractions");
    expect(screen.getAllByRole("link", { name: /ติดต่อโครงการ/ })).toEqual(
      expect.arrayContaining([expect.objectContaining({ href: expect.stringContaining("/contact") })]),
    );
    expect(screen.getByTestId("site-footer")).toBeInTheDocument();
  });

  it("does not present unsupported team, scale, authority, or social claims", () => {
    const { container } = render(<AboutPage />);
    const text = container.textContent ?? "";

    expect(text).not.toMatch(/ดร\. อามีน|นายนพดล|นางสาวฟาติมา|John Doe|Jane Smith/);
    expect(text).not.toMatch(/150\+|50K\+|10K\+|หลายพันคน|คอมมูนิตี้ที่เติบโต/);
    expect(text).not.toMatch(/หน่วยงานการท่องเที่ยวอย่างเป็นทางการ|ข้อมูลทางการ/);
    expect(container.querySelectorAll("svg[aria-label*='Facebook'], svg[aria-label*='Instagram']")).toHaveLength(0);
  });
});
