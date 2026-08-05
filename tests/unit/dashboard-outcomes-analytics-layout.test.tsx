import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ExpenseSection } from "@/components/dashboard/ExpenseSection";
import { FunnelSection } from "@/components/dashboard/FunnelSection";
import { SatisfactionSection } from "@/components/dashboard/SatisfactionSection";
import { SustainableTourismSection } from "@/components/dashboard/SustainableTourismSection";
import type { DashboardViewModel, FunnelStage } from "@/types/dashboard";

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(),
}));

function funnelStage(
  key: string,
  label: string,
  count: number,
  previousCount: number | null,
): FunnelStage {
  const conversion = previousCount && count <= previousCount ? count / previousCount : null;
  return {
    key,
    label,
    count,
    conversionFromPrevious: conversion,
    dropOffFromPrevious: conversion === null ? null : 1 - conversion,
    definition: `นิยาม ${label}`,
  };
}

function dashboardData(): DashboardViewModel {
  const funnelStages = [
    funnelStage("qr_scanned", "QR scanned", 100, null),
    funnelStage("landing_viewed", "Landing viewed", 80, 100),
    funnelStage("minimal_form_completed", "Form submitted", 40, 80),
    funnelStage("certificate_generated", "Certificate generated", 30, 40),
    funnelStage("survey_completed", "Survey completed", 12, 30),
  ];

  return {
    filters: { dateFrom: "2026-08-01", dateTo: "2026-08-05" },
    generatedAt: "2026-08-05T10:00:00.000Z",
    dataSource: "live_database",
    summaryRefreshTimestamp: null,
    viewer: { displayName: "ผู้ดูแล", email: "admin@example.com", permissions: ["dashboard.read"] },
    referenceOptions: {
      provinces: [], districts: [], attractions: [], attractionTypes: [],
      originCountries: [], originProvinces: [], ageGroups: [],
      transportModes: [], travelPurposes: [],
    },
    kpis: [],
    executive: { visitTrend: [], visitsByProvince: [], topAttractions: [] },
    touristProfile: {
      originCountries: [], originProvinces: [], ageGroups: [],
      preferredLanguages: [], identityProviders: [],
    },
    travelBehavior: {
      companionTypes: [], transportModes: [], travelPurposes: [], overnightStatus: [],
      averageGroupSize: null, averageNights: null,
      answeredGroupSizeCount: 0, answeredNightsCount: 0,
    },
    expense: {
      spendingRanges: [
        { label: "501-1,000 บาท", value: 18, percent: 0.6 },
        { label: "1,001-2,000 บาท", value: 12, percent: 0.4 },
      ],
      expenseCategories: [
        { label: "อาหารและเครื่องดื่ม", value: 20, percent: 2 / 3 },
        { label: "ของฝาก", value: 10, percent: 1 / 3 },
      ],
      estimatedMin: 15_030,
      estimatedMax: 42_000,
      hasOpenEndedRange: false,
      responseCount: 30,
      methodologyNote: "ประมาณจากช่วงค่าใช้จ่ายที่ผู้ตอบเลือกด้วยตนเอง",
    },
    satisfaction: {
      averageOverall: 4.2,
      responseCount: 25,
      distribution: [
        { label: "4 / 5", value: 10, percent: 0.4 },
        { label: "5 / 5", value: 15, percent: 0.6 },
      ],
      byAttraction: [{
        rank: 1,
        attractionName: "สกายวอล์คอัยเยอร์เวง",
        provinceName: "ยะลา",
        visitCount: 80,
        certificateCount: 55,
        averageSatisfaction: 4.4,
        surveyResponseCount: 20,
      }],
      safetyAverage: 4.4, safetyResponseCount: 25,
      cleanlinessAverage: 4.1, cleanlinessResponseCount: 24,
      accessibilityAverage: 3.7, accessibilityResponseCount: 22,
      informationAverage: 3.9, informationResponseCount: 23,
      valueAverage: 4.0, valueResponseCount: 21,
      facilityAverage: null, facilityResponseCount: 0,
      revisitIntentionRate: 0.8, revisitAnsweredCount: 20,
      recommendIntentionRate: 0.9, recommendAnsweredCount: 20,
    },
    funnel: { stages: funnelStages, largestDropOffStage: funnelStages[2] },
    insights: [{
      title: "Promotion opportunity",
      category: "promotion",
      description: "สกายวอล์คอัยเยอร์เวง has strong satisfaction with lower recorded visits",
      evidence: "80 visits and 4.4 satisfaction",
      suggestedAction: "เพิ่มในเส้นทางแนะนำและติดตามผลหลังประชาสัมพันธ์",
      confidence: "medium",
    }],
    dashboardAlerts: [],
    dataQualityWarnings: [],
  };
}

describe("Outcome analytics detailed layouts", () => {
  it("จัดค่าใช้จ่ายเป็นหลักฐานและการตีความ พร้อมย้ำว่าเป็นค่าประมาณ", () => {
    render(<ExpenseSection data={dashboardData()} />);

    expect(screen.getByRole("heading", { name: "ค่าใช้จ่ายโดยประมาณ" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "หลักฐานค่าใช้จ่ายโดยประมาณ" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "การตีความค่าใช้จ่าย" })).toBeInTheDocument();
    expect(screen.getByText(/ไม่ใช่รายได้ที่ตรวจสอบแล้ว/)).toBeInTheDocument();
    expect(screen.getByText(/30 คำตอบ/)).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "รายละเอียดช่วงค่าใช้จ่าย" })).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "รายละเอียดหมวดค่าใช้จ่าย" })).toBeInTheDocument();
  });

  it("แสดงความพึงพอใจโดยไม่แปลงค่าที่หายไปเป็นศูนย์", () => {
    const data = dashboardData();
    data.satisfaction = {
      ...data.satisfaction,
      averageOverall: null,
      responseCount: 0,
      distribution: [],
      byAttraction: [],
      safetyAverage: null,
      safetyResponseCount: 0,
      cleanlinessAverage: null,
      cleanlinessResponseCount: 0,
      accessibilityAverage: null,
      accessibilityResponseCount: 0,
      informationAverage: null,
      informationResponseCount: 0,
      valueAverage: null,
      valueResponseCount: 0,
      revisitIntentionRate: null,
      revisitAnsweredCount: 0,
      recommendIntentionRate: null,
      recommendAnsweredCount: 0,
    };

    render(<SatisfactionSection data={data} />);

    expect(screen.getByRole("region", { name: "หลักฐานความพึงพอใจ" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "การตีความประสบการณ์" })).toBeInTheDocument();
    expect(screen.getAllByText("ยังไม่มีข้อมูล").length).toBeGreaterThanOrEqual(3);
    expect(screen.queryByText(/0(?:\.0)? \/ 5/)).not.toBeInTheDocument();
    expect(screen.getByRole("table", { name: "คะแนนประสบการณ์รายมิติ" })).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "ความพึงพอใจแยกตามสถานที่" })).toBeInTheDocument();
  });

  it("อธิบาย funnel เป็นจำนวนเหตุการณ์และแสดงจุดออกที่ตรวจสอบได้", () => {
    render(<FunnelSection data={dashboardData()} />);

    expect(screen.getByRole("region", { name: "หลักฐานเส้นทางการใช้งาน" })).toBeInTheDocument();
    const interpretation = screen.getByRole("region", { name: "การตีความเส้นทางการใช้งาน" });
    expect(within(interpretation).getByText(/จุดที่ออกมากที่สุด/)).toBeInTheDocument();
    expect(screen.getAllByText(/ไม่ใช่จำนวนบุคคล/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole("table", { name: "รายละเอียดเหตุการณ์แต่ละขั้น" })).toBeInTheDocument();
  });

  it("ไม่สร้างอัตรา funnel เมื่อฐานคำนวณไม่ถูกต้อง", () => {
    const data = dashboardData();
    data.funnel.stages = [
      funnelStage("qr_scanned", "QR scanned", 0, null),
      funnelStage("landing_viewed", "Landing viewed", 8, 0),
    ];
    data.funnel.largestDropOffStage = null;

    render(<FunnelSection data={data} />);

    const invalidStageRow = screen.getByRole("row", { name: /เปิดหน้าเช็กอิน/ });
    expect(within(invalidStageRow).getAllByText("ยังคำนวณไม่ได้").length).toBeGreaterThanOrEqual(2);
  });

  it("แสดงข้อสังเกตยั่งยืนเป็นหลักฐาน กติกา การดำเนินการ และความมั่นใจ", () => {
    render(<SustainableTourismSection data={dashboardData()} />);

    expect(screen.getByText(/สร้างจากกติกา/)).toBeInTheDocument();
    expect(screen.getByText(/ไม่ใช่.*AI/)).toBeInTheDocument();
    expect(screen.getByText(/^หลักฐาน:?$/)).toBeInTheDocument();
    expect(screen.getAllByText("แนวทางดำเนินการ").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("หลักฐานปานกลาง")).toBeInTheDocument();
  });
});
