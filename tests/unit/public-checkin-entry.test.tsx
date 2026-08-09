import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { redirect } from "next/navigation";
import { HomepageHowItWorks } from "@/components/homepage/sections/HomepageHowItWorks";
import TryCheckinPage from "@/app/(tourist)/checkin/try/page";
import { resolvePublicDemoCheckinCode } from "@/lib/services/checkin.service";

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

vi.mock("@/lib/services/checkin.service", () => ({
  resolvePublicDemoCheckinCode: vi.fn(),
}));

describe("public check-in entry", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses a hard navigation to the production-like check-in entry", () => {
    render(<HomepageHowItWorks />);

    const link = screen.getByRole("link", { name: /ทดลองใช้งาน/ });
    expect(link).toHaveAttribute("href", "/checkin/try");
    expect(link.tagName).toBe("A");
  });

  it("redirects a configured demo code through the canonical QR route", async () => {
    vi.mocked(resolvePublicDemoCheckinCode).mockResolvedValue("DEMO-CODE-123");

    await TryCheckinPage();

    expect(redirect).toHaveBeenCalledWith("/c/DEMO-CODE-123");
  });

  it("shows scan guidance instead of a broken code when no demo QR is available", async () => {
    vi.mocked(resolvePublicDemoCheckinCode).mockResolvedValue(null);

    render(await TryCheckinPage());

    expect(screen.getByRole("heading", { name: "เริ่มรับใบประกาศที่จุดท่องเที่ยว" })).toBeInTheDocument();
    expect(screen.getByText(/สแกน QR ที่ติดตั้ง ณ จุดเช็กอิน/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "ดูสถานที่ท่องเที่ยว" })).toHaveAttribute("href", "/attractions");
  });
});
