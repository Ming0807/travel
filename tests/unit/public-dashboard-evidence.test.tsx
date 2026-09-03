import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import PublicDashboardPage from "@/app/(public)/dashboard/page";
import { buildPublicDashboardEvidence } from "@/lib/dashboard/public-evidence";
import * as publicDashboardService from "@/lib/services/public-dashboard.service";
import type { DashboardViewModel } from "@/types/dashboard";
import type { PublicDashboardEvidence } from "@/types/public-dashboard";

vi.mock("@/lib/services/public-dashboard.service", () => ({
  getPublicDashboardEvidence: vi.fn(),
}));

function makeEvidence(overrides: Partial<PublicDashboardEvidence> = {}): PublicDashboardEvidence {
  return {
    scope: {
      provinceName: "ยะลา",
      dateFrom: "2026-07-13",
      dateTo: "2026-08-11",
      dataAsOf: "2026-08-11T12:00:00.000Z",
      sourceLabel: "ฐานข้อมูลการมีส่วนร่วมของแพลตฟอร์ม",
    },
    thresholds: { publicCellMinimum: 5, interpretationMinimum: 30 },
    kpis: [
      {
        key: "tourist_profiles",
        label: "โปรไฟล์นักท่องเที่ยวที่มีรายการเข้าชม",
        displayValue: "12",
        status: "available",
        sampleSize: 12,
        definition: "จำนวนโปรไฟล์ที่เชื่อมกับรายการเข้าชมในช่วงที่แสดง",
        source: "visits.tourist_id",
        limitation: "ไม่ใช่จำนวนบุคคลที่ผ่านการยืนยันตัวตน",
      },
      {
        key: "total_visits",
        label: "รายการเข้าชมที่บันทึก",
        displayValue: "18",
        status: "available",
        sampleSize: 18,
        definition: "จำนวนรายการ visit หลังกรอกข้อมูลขั้นต่ำและยินยอม",
        source: "visits",
        limitation: "ไม่ใช่ยอดเปิดหน้าเว็บหรือจำนวน QR scan",
      },
      {
        key: "certificates_generated",
        label: "ใบประกาศที่สร้างสำเร็จ",
        displayValue: "10",
        status: "available",
        sampleSize: 10,
        definition: "จำนวนใบประกาศที่ระบบสร้างสำเร็จ",
        source: "certificates",
        limitation: "หนึ่งโปรไฟล์อาจสร้างใบประกาศจากหลายการเดินทาง",
      },
      {
        key: "average_satisfaction",
        label: "ความพึงพอใจเฉลี่ย",
        displayValue: "ข้อมูลยังไม่พอ",
        status: "small_sample",
        sampleSize: null,
        definition: "ค่าเฉลี่ยจากผู้ตอบแบบสำรวจโดยสมัครใจ",
        source: "satisfaction_surveys.overall_score",
        limitation: "แปลผลเมื่อมีคำตอบอย่างน้อย 30 รายการ",
      },
    ],
    trend: [
      { label: "8 ส.ค.", isoDate: "2026-08-08", displayValue: "6", value: 6, status: "available" },
      { label: "9 ส.ค.", isoDate: "2026-08-09", displayValue: "น้อยกว่า 5", value: null, status: "suppressed" },
    ],
    visitorProfile: [],
    travelBehavior: [],
    topAttractions: [],
    satisfaction: [],
    opportunities: [],
    limitations: [
      "ข้อมูลมาจากผู้ที่เลือกใช้ QR Check-in ของระบบนำร่องเท่านั้น",
      "ข้อมูลนี้ไม่ใช่สถิตินักท่องเที่ยวทางการของจังหวัดยะลา",
    ],
    ...overrides,
  };
}

function makeDashboardModel(): DashboardViewModel {
  return {
    filters: { dateFrom: "2026-07-13", dateTo: "2026-08-11", provinceId: 1 },
    generatedAt: "2026-08-11T12:00:00.000Z",
    dataSource: "live_database",
    summaryRefreshTimestamp: null,
    viewer: { displayName: "Public Viewer", email: "", permissions: [] },
    referenceOptions: {
      provinces: [], districts: [], attractions: [], attractionTypes: [], originCountries: [],
      originProvinces: [], ageGroups: [], transportModes: [], travelPurposes: [],
    },
    kpis: [
      { key: "tourist_profiles", label: "Tourist Profiles", value: "4", rawValue: 4, valueType: "count", definition: "" },
      { key: "total_visits", label: "Total Visits", value: "8", rawValue: 8, valueType: "count", definition: "" },
      { key: "certificates_generated", label: "Certificates", value: "3", rawValue: 3, valueType: "count", definition: "" },
      { key: "average_satisfaction", label: "Satisfaction", value: "4.5 / 5", rawValue: 4.5, valueType: "rating", definition: "" },
    ],
    executive: {
      visitTrend: [{ label: "2026-08-10", value: 3 }, { label: "2026-08-11", value: 5 }],
      visitsByProvince: [{ label: "ยะลา", value: 8, percent: 1 }],
      topAttractions: [
        { rank: 1, attractionName: "จุดชมวิว A", provinceName: "ยะลา", visitCount: 4, certificateCount: 3, averageSatisfaction: 5, surveyResponseCount: 2 },
        { rank: 2, attractionName: "พิพิธภัณฑ์ B", provinceName: "ยะลา", visitCount: 5, certificateCount: 2, averageSatisfaction: 4.2, surveyResponseCount: 30 },
      ],
    },
    touristProfile: {
      originCountries: [],
      originProvinces: [],
      ageGroups: [{ label: "18-24", value: 3, percent: 0.375 }, { label: "25-34", value: 5, percent: 0.625 }],
      preferredLanguages: [],
      identityProviders: [],
    },
    travelBehavior: {
      companionTypes: [],
      transportModes: [{ label: "รถยนต์ส่วนตัว", value: 4, percent: 0.5 }, { label: "รถโดยสาร", value: 4, percent: 0.5 }],
      travelPurposes: [], overnightStatus: [], averageGroupSize: null, averageNights: null,
      answeredGroupSizeCount: 0, answeredNightsCount: 0,
    },
    expense: {
      spendingRanges: [], expenseCategories: [], estimatedMin: null, estimatedMax: null,
      hasOpenEndedRange: false, responseCount: 0, spendingRangeResponseCount: 0,
      expenseCategoryResponseCount: 0, methodologyNote: "",
    },
    satisfaction: {
      averageOverall: 4.5, responseCount: 2, distribution: [], byAttraction: [],
      safetyAverage: 4, safetyResponseCount: 2, cleanlinessAverage: 5, cleanlinessResponseCount: 2,
      accessibilityAverage: 4, accessibilityResponseCount: 2, informationAverage: 4, informationResponseCount: 2,
      valueAverage: 5, valueResponseCount: 2, facilityAverage: null, facilityResponseCount: 0,
      revisitIntentionRate: 1, revisitAnsweredCount: 2, recommendIntentionRate: 0.5, recommendAnsweredCount: 2,
    },
    funnel: { stages: [], largestDropOffStage: null },
    insights: [], dashboardAlerts: [], dataQualityWarnings: [],
  };
}

describe("public dashboard evidence builder", () => {
  it("suppresses public cells below five and does not interpret satisfaction below thirty", () => {
    const evidence = buildPublicDashboardEvidence(makeDashboardModel(), "ยะลา");

    expect(evidence.kpis.find((item) => item.key === "tourist_profiles")?.displayValue).toBe("น้อยกว่า 5");
    expect(evidence.kpis.find((item) => item.key === "average_satisfaction")?.displayValue).toBe("ข้อมูลยังไม่พอ");
    expect(evidence.kpis.find((item) => item.key === "average_satisfaction")?.sampleSize).toBeNull();
    expect(evidence.trend[0]).toMatchObject({ value: null, status: "suppressed" });
    expect(evidence.visitorProfile.some((item) => item.label === "18-24")).toBe(false);
    expect(evidence.topAttractions.some((item) => item.label === "จุดชมวิว A")).toBe(false);
    expect(JSON.stringify(evidence)).not.toContain("Public Viewer");
  });
});

describe("public dashboard evidence page", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("shows scope, data-as-of, source, definitions, and limitations", async () => {
    vi.mocked(publicDashboardService.getPublicDashboardEvidence).mockResolvedValue(makeEvidence());

    render(await PublicDashboardPage());

    expect(screen.getByRole("heading", { level: 1, name: "ข้อมูลการท่องเที่ยวที่ระบบบันทึกได้" })).toBeInTheDocument();
    expect(screen.getAllByText(/จังหวัดยะลา/).length).toBeGreaterThan(0);
    expect(screen.getByText("ข้อมูล ณ 11 สิงหาคม 2569 เวลา 19:00 น.")).toBeInTheDocument();
    expect(screen.getByText("ฐานข้อมูลการมีส่วนร่วมของแพลตฟอร์ม")).toBeInTheDocument();
    expect(screen.getByText("ไม่ใช่ยอดเปิดหน้าเว็บหรือจำนวน QR scan")).toBeInTheDocument();
    expect(screen.getByText("ข้อมูลนี้ไม่ใช่สถิตินักท่องเที่ยวทางการของจังหวัดยะลา")).toBeInTheDocument();
  });

  it("renders an accessible table alternative for every charted trend", async () => {
    vi.mocked(publicDashboardService.getPublicDashboardEvidence).mockResolvedValue(makeEvidence());

    const { container } = render(await PublicDashboardPage());

    const table = screen.getByRole("table", { name: "แนวโน้มรายการเข้าชมที่บันทึก" });
    expect(container.querySelector('[data-chart-engine="recharts"]')).toBeInTheDocument();
    expect(within(table).getByRole("columnheader", { name: "วันที่" })).toBeInTheDocument();
    expect(within(table).getByRole("columnheader", { name: "รายการเข้าชม" })).toBeInTheDocument();
    expect(within(table).getByText("น้อยกว่า 5")).toBeInTheDocument();
  });

  it("uses honest no-data states instead of zero-filled metrics", async () => {
    const empty = makeEvidence({
      kpis: makeEvidence().kpis.map((item) => ({
        ...item,
        displayValue: "ยังไม่มีข้อมูล",
        status: "no_data" as const,
        sampleSize: null,
      })),
      trend: [],
    });
    vi.mocked(publicDashboardService.getPublicDashboardEvidence).mockResolvedValue(empty);

    render(await PublicDashboardPage());

    expect(screen.getAllByText("ยังไม่มีข้อมูล")).toHaveLength(4);
    expect(screen.queryByText("0.0")).not.toBeInTheDocument();
    expect(screen.getByText("ยังไม่มีรายการเข้าชมในช่วงข้อมูลนี้")).toBeInTheDocument();
  });
});
