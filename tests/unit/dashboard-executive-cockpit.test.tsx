import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ExecutiveExperienceSummary } from "@/components/dashboard/ExecutiveExperienceSummary";
import { ExecutiveFunnelSummary } from "@/components/dashboard/ExecutiveFunnelSummary";
import type { DashboardViewModel, FunnelStage } from "@/types/dashboard";

function stage(key: string, count: number): FunnelStage {
  return {
    key,
    label: key,
    count,
    conversionFromPrevious: null,
    dropOffFromPrevious: null,
    definition: key,
  };
}

const satisfaction: DashboardViewModel["satisfaction"] = {
  averageOverall: 4.5,
  responseCount: 40,
  distribution: [
    { label: "4 / 5", value: 10, percent: 0.25 },
    { label: "5 / 5", value: 30, percent: 0.75 },
  ],
  byAttraction: [],
  safetyAverage: 4.4,
  safetyResponseCount: 40,
  cleanlinessAverage: 4.2,
  cleanlinessResponseCount: 40,
  accessibilityAverage: 4.1,
  accessibilityResponseCount: 40,
  informationAverage: 4.0,
  informationResponseCount: 40,
  valueAverage: 4.3,
  valueResponseCount: 40,
  facilityAverage: null,
  facilityResponseCount: 0,
  revisitIntentionRate: 0.8,
  revisitAnsweredCount: 40,
  recommendIntentionRate: 0.9,
  recommendAnsweredCount: 40,
};

describe("Executive analytics cockpit", () => {
  it("สรุป conversion จาก QR ไปใบประกาศและแบบสำรวจ", () => {
    render(
      <ExecutiveFunnelSummary
        stages={[
          stage("qr_scanned", 100),
          stage("certificate_generated", 60),
          stage("survey_completed", 30),
        ]}
      />,
    );

    expect(screen.getByText("60%")).toBeInTheDocument();
    expect(screen.getByText("50%")).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "ข้อมูลประสิทธิภาพเส้นทางผู้ใช้" })).toBeInTheDocument();
  });

  it("ไม่แสดงอัตราหลอกเมื่อ funnel ไม่มีฐานคำนวณ", () => {
    render(<ExecutiveFunnelSummary stages={[]} />);
    expect(screen.getAllByText("ยังคำนวณไม่ได้").length).toBeGreaterThanOrEqual(2);
  });

  it("ไม่บีบอัตราที่ข้อมูลผิดลำดับให้กลายเป็น 100%", () => {
    render(
      <ExecutiveFunnelSummary
        stages={[
          stage("qr_scanned", 10),
          stage("certificate_generated", 12),
          stage("survey_completed", 3),
        ]}
      />,
    );

    expect(screen.getAllByText("ยังคำนวณไม่ได้").length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText("100%")).not.toBeInTheDocument();
  });

  it("สรุปคุณภาพประสบการณ์พร้อมฐานคำตอบ", () => {
    render(<ExecutiveExperienceSummary satisfaction={satisfaction} />);
    expect(screen.getByText("4.5 / 5")).toBeInTheDocument();
    expect(screen.getByText("40 คำตอบ")).toBeInTheDocument();
    expect(screen.getByText("80%")).toBeInTheDocument();
    expect(screen.getByText("90%")).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "การกระจายคะแนนความพึงพอใจ" })).toBeInTheDocument();
  });

  it("แยกสถานะไม่มีข้อมูลความพึงพอใจออกจากคะแนนศูนย์", () => {
    render(
      <ExecutiveExperienceSummary
        satisfaction={{
          ...satisfaction,
          averageOverall: null,
          responseCount: 0,
          distribution: [],
          revisitIntentionRate: null,
          revisitAnsweredCount: 0,
          recommendIntentionRate: null,
          recommendAnsweredCount: 0,
        }}
      />,
    );
    expect(screen.getAllByText("ยังไม่มีข้อมูล").length).toBeGreaterThanOrEqual(3);
    expect(screen.queryByText("0 / 5")).not.toBeInTheDocument();
  });
});
