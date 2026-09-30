import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { redirect } from "next/navigation";
import { HomepageHowItWorks } from "@/components/homepage/sections/HomepageHowItWorks";
import TryCheckinPage from "@/app/(tourist)/checkin/try/page";
import { resolveAndValidateCheckinCode } from "@/lib/services/checkin.service";

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

vi.mock("@/lib/services/checkin.service", () => ({
  resolveAndValidateCheckinCode: vi.fn(),
}));

describe("public check-in entry", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses a hard navigation to check-in guidance", () => {
    render(<HomepageHowItWorks />);

    const link = screen.getByRole("link", { name: /วิธีเช็กอินที่สถานที่/ });
    expect(link).toHaveAttribute("href", "/checkin/try");
    expect(link.tagName).toBe("A");
  });

  it("never redirects a demo into a real visit or loads demo codes", async () => {
    render(await TryCheckinPage());

    expect(redirect).not.toHaveBeenCalled();
    expect(resolveAndValidateCheckinCode).not.toHaveBeenCalled();
    expect(screen.getByText(/ไม่สร้างข้อมูลการเข้าชม/)).toBeInTheDocument();
  });

  it("shows scan guidance instead of a broken code when no demo QR is available", async () => {
    render(await TryCheckinPage());

    expect(screen.getByRole("heading", { name: "เริ่มรับใบประกาศที่จุดท่องเที่ยว" })).toBeInTheDocument();
    expect(screen.getByText(/สแกน QR ที่ติดตั้ง ณ จุดเช็กอิน/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "ดูสถานที่ท่องเที่ยว" })).toHaveAttribute("href", "/attractions");
  });
});
