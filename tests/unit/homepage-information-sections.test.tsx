import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { HomepageHowItWorks } from "@/components/homepage/sections/HomepageHowItWorks";
import { HomepageDashboardPreview } from "@/components/homepage/sections/HomepageDashboardPreview";

const getPublicDashboardAnalytics = vi.fn();

vi.mock("@/lib/services/dashboard.service", () => ({
  getPublicDashboardAnalytics: (...args: unknown[]) => getPublicDashboardAnalytics(...args),
}));

describe("homepage information sections", () => {
  beforeEach(() => {
    getPublicDashboardAnalytics.mockResolvedValue({
      kpis: [
        { key: "tourist_profiles", value: "120" },
        { key: "total_visits", value: "340" },
        { key: "certificates_generated", value: "280" },
        { key: "average_satisfaction", value: "4.6" },
      ],
    });
  });

  it("describes the real three-step check-in journey", () => {
    render(<HomepageHowItWorks />);

    expect(screen.getByRole("heading", { name: "เริ่มบันทึกการเดินทางได้ใน 3 ขั้นตอน" })).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    expect(screen.getByText("สแกน QR ที่สถานที่")).toBeInTheDocument();
    expect(screen.getByText("ถ่ายหรือเลือกรูป")).toBeInTheDocument();
    expect(screen.getByText("สะสมตราและคะแนน")).toBeInTheDocument();
  });

  it("labels dashboard numbers as recorded tourism data", async () => {
    render(await HomepageDashboardPreview());

    expect(screen.getByText("ไม่ใช่จำนวนผู้เข้าชมเว็บไซต์", { exact: false })).toBeInTheDocument();
    expect(screen.queryByText(/Live Data|เรียลไทม์/i)).not.toBeInTheDocument();
    expect(screen.getByText("340")).toBeInTheDocument();
    expect(screen.getByText("4.6")).toBeInTheDocument();
  });
});
