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

  it("describes the real six-stage check-in journey", () => {
    render(<HomepageHowItWorks />);

    expect(screen.getByRole("heading", { name: /ขั้นตอนการบันทึกการเดินทาง|เริ่มบันทึกการเดินทาง/ })).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(6);
    expect(screen.getByText("สแกน QR ที่สถานที่")).toBeInTheDocument();
    expect(screen.getByText("กรอกข้อมูลจำเป็น")).toBeInTheDocument();
    expect(screen.getByText("ถ่ายหรือเลือกรูป")).toBeInTheDocument();
    expect(screen.getByText("รับใบประกาศดิจิทัล")).toBeInTheDocument();
    expect(screen.getByText("สะสมตราและคะแนน")).toBeInTheDocument();
    expect(screen.getByText("แบบสำรวจตามความสมัครใจ")).toBeInTheDocument();
  });

  it("labels dashboard numbers as recorded tourism data with factual purpose points", async () => {
    render(await HomepageDashboardPreview());

    expect(screen.getByText("ไม่ใช่จำนวนผู้เข้าชมเว็บไซต์", { exact: false })).toBeInTheDocument();
    expect(screen.queryByText(/Live Data|เรียลไทม์/i)).not.toBeInTheDocument();
    expect(screen.getByText("340")).toBeInTheDocument();
    expect(screen.getByText("4.6")).toBeInTheDocument();

    // Visual contract: Factual wording
    expect(screen.getByText("ข้อมูลจากกิจกรรมจริง")).toBeInTheDocument();
    expect(screen.getByText("เลือกตอบข้อมูลเพิ่มเติม")).toBeInTheDocument();
    expect(screen.getByText("นำเสนอข้อมูลเป็นภาพรวม")).toBeInTheDocument();
  });

  it("keeps the homepage available when public analytics cannot be loaded", async () => {
    getPublicDashboardAnalytics.mockRejectedValueOnce(new Error("database unavailable"));

    render(await HomepageDashboardPreview());

    expect(screen.getByRole("status")).toHaveTextContent("ข้อมูลสถิติยังไม่พร้อมใช้งานชั่วคราว");
    expect(screen.queryByText("0.0")).not.toBeInTheDocument();
  });
});
