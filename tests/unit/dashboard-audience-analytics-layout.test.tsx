import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AttractionPerformanceSection } from "@/components/dashboard/AttractionPerformanceSection";
import { TouristProfileSection } from "@/components/dashboard/TouristProfileSection";
import { TravelBehaviorSection } from "@/components/dashboard/TravelBehaviorSection";
import type { DashboardViewModel } from "@/types/dashboard";

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(),
}));

const item = (label: string, value: number, percent: number | null) => ({ label, value, percent });

function dashboardData(): DashboardViewModel {
  return {
    filters: { dateFrom: "2026-07-01", dateTo: "2026-07-31" },
    generatedAt: "2026-08-05T00:00:00.000Z",
    dataSource: "live_database",
    summaryRefreshTimestamp: null,
    viewer: { displayName: "ผู้ดูแล", email: "admin@example.com", permissions: ["dashboard.read"] },
    referenceOptions: {
      provinces: [], districts: [], attractions: [], attractionTypes: [], originCountries: [],
      originProvinces: [], ageGroups: [], transportModes: [], travelPurposes: [],
    },
    kpis: [],
    executive: {
      visitTrend: [],
      visitsByProvince: [],
      topAttractions: [
        { rank: 1, attractionName: "สกายวอล์คอัยเยอร์เวง", provinceName: "ยะลา", visitCount: 60, certificateCount: 45, averageSatisfaction: 4.6, surveyResponseCount: 20 },
        { rank: 2, attractionName: "บ่อน้ำร้อนเบตง", provinceName: "ยะลา", visitCount: 40, certificateCount: 30, averageSatisfaction: null, surveyResponseCount: 0 },
      ],
    },
    touristProfile: {
      originCountries: [item("ไทย", 80, 0.8), item("มาเลเซีย", 20, 0.2)],
      originProvinces: [item("สงขลา", 50, 0.625), item("ยะลา", 30, 0.375)],
      ageGroups: [item("25-34", 55, 0.55), item("35-44", 45, 0.45)],
      preferredLanguages: [item("ไทย", 85, 0.85), item("English", 15, 0.15)],
      identityProviders: [item("anonymous_device", 70, 0.7), item("google", 30, 0.3)],
    },
    travelBehavior: {
      companionTypes: [item("ครอบครัว", 35, 0.7), item("เพื่อน", 15, 0.3)],
      transportModes: [item("รถยนต์ส่วนตัว", 40, 0.8), item("รถโดยสาร", 10, 0.2)],
      travelPurposes: [item("พักผ่อน", 30, 0.6), item("เยี่ยมญาติ", 20, 0.4)],
      overnightStatus: [item("ค้างคืน", 30, 0.6), item("ไปเช้าเย็นกลับ", 20, 0.4)],
      averageGroupSize: 3.2,
      averageNights: 1.8,
      answeredGroupSizeCount: 48,
      answeredNightsCount: 42,
    },
    expense: { spendingRanges: [], expenseCategories: [], estimatedMin: null, estimatedMax: null, hasOpenEndedRange: false, responseCount: 0, methodologyNote: "" },
    satisfaction: {
      averageOverall: null, responseCount: 0, distribution: [], byAttraction: [],
      safetyAverage: null, safetyResponseCount: 0, cleanlinessAverage: null, cleanlinessResponseCount: 0,
      accessibilityAverage: null, accessibilityResponseCount: 0, informationAverage: null, informationResponseCount: 0,
      valueAverage: null, valueResponseCount: 0, facilityAverage: null, facilityResponseCount: 0,
      revisitIntentionRate: null, revisitAnsweredCount: 0, recommendIntentionRate: null, recommendAnsweredCount: 0,
    },
    funnel: { stages: [], largestDropOffStage: null },
    insights: [],
    dashboardAlerts: [],
    dataQualityWarnings: [],
  };
}

describe("Audience and attraction analytics layouts", () => {
  it("จัดหน้านักท่องเที่ยวเป็น KPI strip หลักฐานกว้าง และบริบทวิธีเข้าใช้งาน", () => {
    render(<TouristProfileSection data={dashboardData()} />);

    const kpis = screen.getByRole("group", { name: "ตัวชี้วัดลักษณะนักท่องเที่ยว" });
    expect(within(kpis).getAllByRole("term")).toHaveLength(4);
    expect(screen.getByRole("region", { name: "หลักฐานประเทศต้นทาง" })).toHaveClass("xl:col-span-8");
    expect(screen.getByRole("region", { name: "บริบทวิธีเข้าใช้งาน" })).toHaveClass("xl:col-span-4");
    expect(screen.getByRole("table", { name: "รายละเอียดประเทศต้นทาง" })).toBeInTheDocument();
    expect(screen.getByText(/โปรไฟล์ระบบ ไม่ใช่จำนวนบุคคลจริงที่ยืนยันแล้ว/)).toBeInTheDocument();
  });

  it("จัดหน้าพฤติกรรมพร้อมฐานคำตอบ และไม่แปลงข้อมูลที่หายเป็นศูนย์", () => {
    const data = dashboardData();
    data.travelBehavior.averageGroupSize = null;
    data.travelBehavior.averageNights = null;
    data.travelBehavior.answeredGroupSizeCount = 0;
    data.travelBehavior.answeredNightsCount = 0;
    render(<TravelBehaviorSection data={data} />);

    const kpis = screen.getByRole("group", { name: "ตัวชี้วัดพฤติกรรมการเดินทาง" });
    expect(within(kpis).getAllByRole("term")).toHaveLength(4);
    expect(within(kpis).getAllByText("ยังไม่มีข้อมูล")).toHaveLength(2);
    expect(within(kpis).queryByText("0.0 คน")).not.toBeInTheDocument();
    expect(screen.getByRole("region", { name: "หลักฐานรูปแบบการเดินทาง" })).toHaveClass("xl:col-span-8");
    expect(screen.getByRole("region", { name: "บริบทการค้างคืน" })).toHaveClass("xl:col-span-4");
    expect(screen.getByRole("table", { name: "รายละเอียดพาหนะที่ใช้เดินทาง" })).toBeInTheDocument();
  });

  it("แสดงผลงานสถานที่พร้อมสัดส่วนการกระจุกตัวที่ตรวจสอบได้", () => {
    render(<AttractionPerformanceSection data={dashboardData()} />);

    const kpis = screen.getByRole("group", { name: "ตัวชี้วัดผลงานสถานที่" });
    expect(within(kpis).getAllByRole("term")).toHaveLength(4);
    expect(screen.getByRole("region", { name: "หลักฐานอันดับสถานที่" })).toHaveClass("xl:col-span-8");
    expect(screen.getByRole("region", { name: "บริบทการกระจายการเข้าชม" })).toHaveClass("xl:col-span-4");
    expect(screen.getByText("60.0% ของการเข้าชมในอันดับที่แสดง")).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "รายละเอียดผลงานรายสถานที่" })).toBeInTheDocument();
    expect(screen.getByText("ยังไม่มีข้อมูล", { selector: "td" })).toBeInTheDocument();
  });

  it("ไม่สร้างข้อสรุป concentration เมื่อไม่มีฐานข้อมูลการเข้าชม", () => {
    const data = dashboardData();
    data.executive.topAttractions = [];
    render(<AttractionPerformanceSection data={data} />);

    expect(screen.getByText("ยังไม่มีข้อมูลเพียงพอสำหรับอธิบายการกระจายการเข้าชม")).toBeInTheDocument();
    expect(screen.queryByText(/0\.0% ของการเข้าชม/)).not.toBeInTheDocument();
  });
});
