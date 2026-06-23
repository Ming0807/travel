import { describe, expect, it, vi, beforeEach } from "vitest";

// ──────────────────────────────────────────────
// 1. Mock server-only (throws in test env)
// ──────────────────────────────────────────────
vi.mock("server-only", () => ({}));

// ──────────────────────────────────────────────
// 2. Shared mock state (hoisted before vi.mock factories run)
// ──────────────────────────────────────────────
const mockPayload = vi.hoisted(() => ({
  current: null as Record<string, unknown> | null,
}));

const mockAuthResult = vi.hoisted(() => ({
  shouldThrow: false,
  result: { displayName: "Test Admin", email: "admin@test.com", permissions: ["dashboard.read"] },
}));

type MockDashboardFilterError = Error & {
  flatten: () => { fieldErrors: Record<string, string[]> };
};

const mockFilterResult = vi.hoisted<{
  success: boolean;
  data: { dateFrom: string; dateTo: string } | undefined;
  error?: MockDashboardFilterError;
}>(() => ({
  success: true,
  data: {
    dateFrom: "2026-05-01",
    dateTo: "2026-05-31",
  },
}));

const mockRepoShouldThrow = vi.hoisted(() => ({ current: false }));

// ──────────────────────────────────────────────
// 3. Mock all external modules
// ──────────────────────────────────────────────

vi.mock("@/lib/auth/guards", () => ({
  requirePermission: vi.fn().mockImplementation(async () => {
    if (mockAuthResult.shouldThrow) {
      const err = new Error("UNAUTHORIZED") as Error & { code: string; name: string };
      err.code = "UNAUTHORIZED";
      err.name = "AdminAuthError";
      throw err;
    }
    return mockAuthResult.result;
  }),
}));

vi.mock("@/lib/validation/dashboard-filters", () => ({
  parseDashboardFilters: vi.fn().mockImplementation(() => mockFilterResult),
  normalizeDashboardSearchParams: vi.fn().mockImplementation((s) => s),
}));

vi.mock("@/lib/repositories/dashboard.repository", () => ({
  getDashboardRepositoryPayload: vi.fn().mockImplementation(async () => {
    if (mockRepoShouldThrow.current) throw new Error("DB connection failed");
    return mockPayload.current;
  }),
}));

// ──────────────────────────────────────────────
// 4. Import the service under test
// ──────────────────────────────────────────────
import { getDashboardAnalytics, DashboardServiceError } from "@/lib/services/dashboard.service";
import type { DashboardRepositoryPayload } from "@/lib/repositories/dashboard.repository";
import type { DashboardReferenceOptions } from "@/types/dashboard";

// ──────────────────────────────────────────────
// 5. Mock data factories
// ──────────────────────────────────────────────

const defaultReferenceOptions: DashboardReferenceOptions = {
  provinces: [{ value: "1", label: "ยะลา" }],
  districts: [{ value: "1", label: "เบตง" }],
  attractions: [{ value: "1", label: "หาดทรายขาว" }],
  attractionTypes: [{ value: "1", label: "ชายหาด" }],
  originCountries: [{ value: "1", label: "ไทย" }],
  originProvinces: [{ value: "1", label: "ยะลา" }],
  ageGroups: [{ value: "25-34", label: "25-34" }],
  transportModes: [{ value: "1", label: "รถยนต์" }],
  travelPurposes: [{ value: "1", label: "ท่องเที่ยว" }],
};

function emptySummary() {
  return {
    kpis: null,
    trend: [],
    visitsByProvince: [],
    topAttractions: [],
    funnelEventCounts: new Map<string, number>(),
    refreshTimestamp: null,
  };
}

function makePayload(overrides: Partial<DashboardRepositoryPayload> = {}): DashboardRepositoryPayload {
  return {
    visits: [],
    certificates: [],
    stamps: [],
    surveys: [],
    expenses: [],
    funnelEvents: [],
    referenceOptions: defaultReferenceOptions,
    isTruncated: false,
    summary: emptySummary(),
    ...overrides,
  };
}

// ── Visit row factory ──────────────────────────

function visitRow(overrides: Record<string, unknown> = {}) {
  return {
    visit_id: 1,
    tourist_id: "t1",
    visit_date: "2026-05-01",
    attraction_id: 1,
    travel_companion_id: null,
    transport_mode_id: null,
    travel_purpose_id: null,
    group_size: null,
    overnight_status: null,
    nights: null,
    completion_status: "complete",
    tourists: [
      {
        origin_country_id: 1,
        origin_province_id: null,
        age_group: "25-34",
        preferred_language: "th",
        countries: [{ country_name_th: "ไทย", country_name_en: "Thailand" }],
        provinces: null,
      },
    ],
    attractions: [
      {
        attraction_id: 1,
        name_th: "หาดทรายขาว",
        name_en: "White Sand Beach",
        province_id: 1,
        district_id: 1,
        attraction_type_id: 1,
        provinces: [{ province_name_th: "ยะลา", province_name_en: "Yala" }],
        districts: [{ district_name_th: "เบตง", district_name_en: "Betong" }],
        attraction_types: [{ type_name_th: "ชายหาด", type_name_en: "Beach" }],
      },
    ],
    travel_companions: null,
    transport_modes: null,
    travel_purposes: null,
    ...overrides,
  };
}

function certificateRow(overrides: Record<string, unknown> = {}) {
  return {
    certificate_id: 1,
    generated_at: "2026-05-01T10:00:00Z",
    visits: [
      {
        visit_date: "2026-05-01",
        attraction_id: 1,
        tourist_id: "t1",
        tourists: [{ origin_country_id: 1, origin_province_id: null, age_group: "25-34" }],
        attractions: [
          {
            attraction_id: 1,
            name_th: "หาดทรายขาว",
            name_en: "White Sand Beach",
            province_id: 1,
            district_id: 1,
            attraction_type_id: 1,
          },
        ],
      },
    ],
    ...overrides,
  };
}

function stampRow(overrides: Record<string, unknown> = {}) {
  return {
    stamp_id: 1,
    earned_at: "2026-05-01T10:00:00Z",
    status: "active",
    attraction_id: 1,
    visits: [
      {
        visit_date: "2026-05-01",
        tourist_id: "t1",
        tourists: [{ origin_country_id: 1, origin_province_id: null, age_group: "25-34" }],
      },
    ],
    attractions: [
      {
        attraction_id: 1,
        name_th: "หาดทรายขาว",
        name_en: "White Sand Beach",
        province_id: 1,
        district_id: 1,
        attraction_type_id: 1,
      },
    ],
    ...overrides,
  };
}

function surveyRow(overrides: Record<string, unknown> = {}) {
  return {
    survey_id: 1,
    overall_score: 4,
    facility_score: 3,
    cleanliness_score: 4,
    safety_score: 5,
    accessibility_score: 3,
    information_score: 4,
    value_score: 5,
    revisit_intention: "yes",
    recommend_intention: "yes",
    submitted_at: "2026-05-01T10:30:00Z",
    visits: [
      {
        visit_date: "2026-05-01",
        attraction_id: 1,
        tourist_id: "t1",
        tourists: [{ origin_country_id: 1, origin_province_id: null, age_group: "25-34" }],
        attractions: [
          {
            attraction_id: 1,
            name_th: "หาดทรายขาว",
            name_en: "White Sand Beach",
            province_id: 1,
            district_id: 1,
            attraction_type_id: 1,
            provinces: [{ province_name_th: "ยะลา", province_name_en: "Yala" }],
          },
        ],
      },
    ],
    ...overrides,
  };
}

function expenseRow(overrides: Record<string, unknown> = {}) {
  return {
    expense_id: 1,
    estimated_amount: null,
    spending_range_id: 1,
    expense_category_id: 1,
    spending_ranges: [
      { range_label_th: "1,001-3,000 บาท", range_label_en: "1,001-3,000 THB", min_value: 1001, max_value: 3000 },
    ],
    expense_categories: [{ name_th: "อาหาร", name_en: "Food" }],
    visits: [
      {
        visit_date: "2026-05-01",
        attraction_id: 1,
        tourist_id: "t1",
        tourists: [{ origin_country_id: 1, origin_province_id: null, age_group: "25-34" }],
        attractions: [
          {
            attraction_id: 1,
            name_th: "หาดทรายขาว",
            name_en: "White Sand Beach",
            province_id: 1,
            district_id: 1,
            attraction_type_id: 1,
          },
        ],
      },
    ],
    ...overrides,
  };
}

function funnelEventRow(eventType: string, overrides: Record<string, unknown> = {}) {
  return {
    event_id: 1,
    event_type: eventType,
    event_time: "2026-05-01T09:00:00Z",
    checkin_code_id: 1,
    metadata: null,
    checkin_codes: [
      {
        attraction_id: 1,
        photo_spot_id: null,
        attractions: [{ attraction_id: 1, province_id: 1, district_id: 1, attraction_type_id: 1 }],
      },
    ],
    ...overrides,
  };
}

// ──────────────────────────────────────────────
// 6. Tests
// ──────────────────────────────────────────────

describe("getDashboardAnalytics — KPI aggregation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthResult.shouldThrow = false;
    mockRepoShouldThrow.current = false;
    mockFilterResult.success = true;
    mockFilterResult.data = { dateFrom: "2026-05-01", dateTo: "2026-05-31" };
  });

  // ── 6a. Empty data ──────────────────────────

  it("returns No data for all KPIs when there are no visits", async () => {
    mockPayload.current = makePayload();

    const result = await getDashboardAnalytics({});

    expect(result.kpis).toHaveLength(10);

    // Count KPIs show "0" when empty (formatCount(0) = "0"),
    // while ratio/rating/spending KPIs show "No data" (null input)
    expect(result.kpis.find((k) => k.key === "tourist_profiles")?.value).toBe("0");
    expect(result.kpis.find((k) => k.key === "total_visits")?.value).toBe("0");
    expect(result.kpis.find((k) => k.key === "qr_scans")?.value).toBe("0");
    expect(result.kpis.find((k) => k.key === "landing_views")?.value).toBe("0");
    expect(result.kpis.find((k) => k.key === "certificates_generated")?.value).toBe("0");
    expect(result.kpis.find((k) => k.key === "stamps_earned")?.value).toBe("0");
    expect(result.kpis.find((k) => k.key === "survey_completion_rate")?.value).toBe("No data");
    expect(result.kpis.find((k) => k.key === "average_satisfaction")?.value).toBe("No data");
    expect(result.kpis.find((k) => k.key === "estimated_spending")?.value).toBe("No data");
    expect(result.kpis.find((k) => k.key === "top_attraction")?.value).toBe("No data");

    // rawValue should be 0 for count KPIs, null for others when empty
    expect(result.kpis.find((k) => k.key === "total_visits")?.rawValue).toBe(0);
    expect(result.kpis.find((k) => k.key === "survey_completion_rate")?.rawValue).toBeNull();
    expect(result.kpis.find((k) => k.key === "average_satisfaction")?.rawValue).toBeNull();
    expect(result.kpis.find((k) => k.key === "estimated_spending")?.rawValue).toBeNull();
    expect(result.kpis.find((k) => k.key === "top_attraction")?.rawValue).toBeNull();

    // Executive section should be empty
    expect(result.executive.visitTrend).toEqual([]);
    expect(result.executive.visitsByProvince).toEqual([]);
    expect(result.executive.topAttractions).toEqual([]);

    // Data quality insight is generated even with empty data because survey completion rate is null
    expect(result.insights).toHaveLength(1);
    expect(result.insights[0].category).toBe("data_quality");
    expect(result.insights[0].title).toBe("Survey sample limitation");
  });

  it("returns data quality warnings when empty satisfaction and expense data exist", async () => {
    // Even with visits, no surveys/expenses should trigger warnings
    mockPayload.current = makePayload({
      visits: [visitRow()],
      certificates: [certificateRow()],
    });

    const result = await getDashboardAnalytics({});

    const warnings = result.dataQualityWarnings;
    expect(warnings.some((w) => w.includes("satisfaction"))).toBe(true);
    expect(warnings.some((w) => w.includes("expense"))).toBe(true);
  });

  // ── 6b. Single visit ────────────────────────

  it("counts one visit correctly and formats all KPIs", async () => {
    mockPayload.current = makePayload({
      visits: [visitRow()],
      certificates: [certificateRow()],
      stamps: [stampRow()],
      surveys: [surveyRow()],
      expenses: [expenseRow()],
    });

    const result = await getDashboardAnalytics({});

    expect(result.kpis.find((k) => k.key === "tourist_profiles")?.value).toBe("1");
    expect(result.kpis.find((k) => k.key === "total_visits")?.value).toBe("1");
    expect(result.kpis.find((k) => k.key === "certificates_generated")?.value).toBe("1");
    expect(result.kpis.find((k) => k.key === "stamps_earned")?.value).toBe("1");

    // Survey completion rate = 1 survey / 1 cert = 100%
    expect(result.kpis.find((k) => k.key === "survey_completion_rate")?.value).toBe("100%");

    // Average satisfaction from 1 survey with score 4
    expect(result.kpis.find((k) => k.key === "average_satisfaction")?.value).toBe("4.0 / 5");

    // Estimated spending from 1 expense with range 1,001-3,000
    expect(result.kpis.find((k) => k.key === "estimated_spending")?.value).toContain("Estimated");
    expect(result.kpis.find((k) => k.key === "estimated_spending")?.value).toContain("฿");

    // Top attraction
    expect(result.kpis.find((k) => k.key === "top_attraction")?.value).toBe("หาดทรายขาว");
    expect(result.kpis.find((k) => k.key === "top_attraction")?.note).toContain("1 visits");

    // Executive: 1 visit on 2026-05-01
    expect(result.executive.visitTrend).toHaveLength(1);
    expect(result.executive.visitTrend[0].label).toBe("2026-05-01");
    expect(result.executive.visitTrend[0].value).toBe(1);

    // Top attractions
    expect(result.executive.topAttractions).toHaveLength(1);
    expect(result.executive.topAttractions[0].attractionName).toBe("หาดทรายขาว");
    expect(result.executive.topAttractions[0].visitCount).toBe(1);
    expect(result.executive.topAttractions[0].certificateCount).toBe(1);
    expect(result.executive.topAttractions[0].averageSatisfaction).toBe(4);
    expect(result.executive.topAttractions[0].surveyResponseCount).toBe(1);
  });

  // ── 6c. Multiple visits to same attraction ──

  it("aggregates multiple visits to the same attraction", async () => {
    mockPayload.current = makePayload({
      visits: [
        visitRow({ visit_id: 1, visit_date: "2026-05-01", tourist_id: "t1" }),
        visitRow({ visit_id: 2, visit_date: "2026-05-02", tourist_id: "t2" }),
        visitRow({ visit_id: 3, visit_date: "2026-05-03", tourist_id: "t3" }),
      ],
      certificates: [certificateRow(), certificateRow({ certificate_id: 2 })],
      surveys: [
        surveyRow({ overall_score: 4 }),
        surveyRow({ survey_id: 2, overall_score: 5 }),
      ],
    });

    const result = await getDashboardAnalytics({});

    expect(result.kpis.find((k) => k.key === "total_visits")?.value).toBe("3");
    expect(result.kpis.find((k) => k.key === "tourist_profiles")?.value).toBe("3");

    // Top attraction: 3 visits
    expect(result.executive.topAttractions).toHaveLength(1);
    expect(result.executive.topAttractions[0].visitCount).toBe(3);

    // Average satisfaction: (4 + 5) / 2 = 4.5
    expect(result.executive.topAttractions[0].averageSatisfaction).toBe(4.5);

    // Visit trend: 3 dates
    expect(result.executive.visitTrend).toHaveLength(3);
  });

  // ── 6d. Multiple attractions ─────────────────

  it("ranks attractions by visit count", async () => {
    mockPayload.current = makePayload({
      visits: [
        // Attraction 1 (sea): 2 visits
        visitRow({ visit_id: 1, tourist_id: "t1" }),
        visitRow({ visit_id: 2, tourist_id: "t2" }),
        // Attraction 2 (mountain): 3 visits
        visitRow({
          visit_id: 3,
          tourist_id: "t3",
          attraction_id: 2,
          attractions: [
            {
              attraction_id: 2,
              name_th: "ภูเขางาม",
              name_en: "Beautiful Mountain",
              province_id: 1,
              district_id: 2,
              attraction_type_id: 2,
              provinces: [{ province_name_th: "ยะลา", province_name_en: "Yala" }],
              districts: [{ district_name_th: "เมือง", district_name_en: "Mueang" }],
              attraction_types: [{ type_name_th: "ภูเขา", type_name_en: "Mountain" }],
            },
          ],
        }),
        visitRow({
          visit_id: 4,
          tourist_id: "t4",
          attraction_id: 2,
          attractions: [
            {
              attraction_id: 2,
              name_th: "ภูเขางาม",
              name_en: "Beautiful Mountain",
              province_id: 1,
              district_id: 2,
              attraction_type_id: 2,
              provinces: [{ province_name_th: "ยะลา", province_name_en: "Yala" }],
              districts: [{ district_name_th: "เมือง", district_name_en: "Mueang" }],
              attraction_types: [{ type_name_th: "ภูเขา", type_name_en: "Mountain" }],
            },
          ],
        }),
        visitRow({
          visit_id: 5,
          tourist_id: "t5",
          attraction_id: 2,
          attractions: [
            {
              attraction_id: 2,
              name_th: "ภูเขางาม",
              name_en: "Beautiful Mountain",
              province_id: 1,
              district_id: 2,
              attraction_type_id: 2,
              provinces: [{ province_name_th: "ยะลา", province_name_en: "Yala" }],
              districts: [{ district_name_th: "เมือง", district_name_en: "Mueang" }],
              attraction_types: [{ type_name_th: "ภูเขา", type_name_en: "Mountain" }],
            },
          ],
        }),
      ],
    });

    const result = await getDashboardAnalytics({});

    // Top attraction should be มountain (3 visits), then sea (2 visits)
    expect(result.executive.topAttractions).toHaveLength(2);
    expect(result.executive.topAttractions[0].attractionName).toBe("ภูเขางาม");
    expect(result.executive.topAttractions[0].visitCount).toBe(3);
    expect(result.executive.topAttractions[1].attractionName).toBe("หาดทรายขาว");
    expect(result.executive.topAttractions[1].visitCount).toBe(2);

    // Top attraction KPI should reflect the #1 attraction
    expect(result.kpis.find((k) => k.key === "top_attraction")?.value).toBe("ภูเขางาม");
  });

  // ── 6e. Tourist deduplication ────────────────

  it("deduplicates tourists by tourist_id for profile counts", async () => {
    mockPayload.current = makePayload({
      visits: [
        visitRow({ visit_id: 1, tourist_id: "t1" }),
        visitRow({ visit_id: 2, tourist_id: "t1" }), // same tourist, different visit
        visitRow({ visit_id: 3, tourist_id: "t2" }),
        visitRow({ visit_id: 4, tourist_id: "t2" }), // same tourist again
        visitRow({ visit_id: 5, tourist_id: "t3" }),
      ],
    });

    const result = await getDashboardAnalytics({});

    // 3 unique tourists across 5 visits
    expect(result.kpis.find((k) => k.key === "tourist_profiles")?.value).toBe("3");
    expect(result.kpis.find((k) => k.key === "total_visits")?.value).toBe("5");

    // Tourist profile section: 3 unique tourists with origin country = ไทย
    expect(result.touristProfile.originCountries).toHaveLength(1);
    expect(result.touristProfile.originCountries[0].label).toBe("ไทย");
    expect(result.touristProfile.originCountries[0].value).toBe(3);
  });

  // ── 6f. Travel behavior ─────────────────────

  it("aggregates travel behavior with averages", async () => {
    mockPayload.current = makePayload({
      visits: [
        visitRow({
          visit_id: 1,
          group_size: 4,
          overnight_status: "yes",
          nights: 2,
          travel_companion_id: 1,
          transport_mode_id: 1,
          travel_purpose_id: 1,
          travel_companions: [{ name_th: "ครอบครัว", name_en: "Family" }],
          transport_modes: [{ name_th: "รถยนต์", name_en: "Car" }],
          travel_purposes: [{ name_th: "ท่องเที่ยว", name_en: "Tourism" }],
        }),
        visitRow({
          visit_id: 2,
          tourist_id: "t2",
          group_size: 2,
          overnight_status: "no",
          nights: 0,
          travel_companion_id: 2,
          transport_mode_id: 2,
          travel_purpose_id: 2,
          travel_companions: [{ name_th: "คู่รัก", name_en: "Couple" }],
          transport_modes: [{ name_th: "รถจักรยานยนต์", name_en: "Motorcycle" }],
          travel_purposes: [{ name_th: "พักผ่อน", name_en: "Relaxation" }],
        }),
        visitRow({
          visit_id: 3,
          tourist_id: "t3",
          group_size: null, // skipped in average
          overnight_status: null, // "No data" category
          nights: null,
          travel_companions: null,
          transport_modes: null,
          travel_purposes: null,
        }),
      ],
    });

    const result = await getDashboardAnalytics({});

    // Average group size: (4 + 2) / 2 = 3 (null excluded)
    expect(result.travelBehavior.averageGroupSize).toBe(3);
    expect(result.travelBehavior.answeredGroupSizeCount).toBe(2);

    // Average nights: (2 + 0) / 2 = 1
    expect(result.travelBehavior.averageNights).toBe(1);
    expect(result.travelBehavior.answeredNightsCount).toBe(2);

    // Companion types: 2 with data, 1 null → "No data"
    expect(result.travelBehavior.companionTypes).toHaveLength(3);
    const companionLabels = result.travelBehavior.companionTypes.map((c) => c.label);
    expect(companionLabels).toContain("ครอบครัว");
    expect(companionLabels).toContain("คู่รัก");
    expect(companionLabels).toContain("No data");

    // Overnight status: "yes", "no", "No data"
    expect(result.travelBehavior.overnightStatus).toHaveLength(3);
  });

  // ── 6g. Expenses ────────────────────────────

  it("aggregates expense data with estimated range", async () => {
    mockPayload.current = makePayload({
      expenses: [
        expenseRow({ expense_id: 1, spending_ranges: [{ range_label_th: "1,001-3,000 บาท", range_label_en: "1,001-3,000 THB", min_value: 1001, max_value: 3000 }] }),
        expenseRow({ expense_id: 2, spending_ranges: [{ range_label_th: "3,001-5,000 บาท", range_label_en: "3,001-5,000 THB", min_value: 3001, max_value: 5000 }] }),
      ],
      visits: [visitRow(), visitRow({ visit_id: 2, tourist_id: "t2" })],
    });

    const result = await getDashboardAnalytics({});

    // Estimated min = 1001 + 3001 = 4002
    // Estimated max = 3000 + 5000 = 8000
    expect(result.expense.estimatedMin).toBe(4002);
    expect(result.expense.estimatedMax).toBe(8000);
    expect(result.expense.hasOpenEndedRange).toBe(false);
    expect(result.expense.responseCount).toBe(2);

    // 2 spending range labels
    expect(result.expense.spendingRanges).toHaveLength(2);

    // Methodology note present
    expect(result.expense.methodologyNote).toContain("self-reported");
    expect(result.expense.methodologyNote).toContain("not revenue");
  });

  it("handles open-ended spending ranges (null max_value)", async () => {
    mockPayload.current = makePayload({
      expenses: [
        expenseRow({
          expense_id: 1,
          spending_ranges: [{ range_label_th: "10,000+ บาท", range_label_en: "10,000+ THB", min_value: 10000, max_value: null }],
        }),
      ],
      visits: [visitRow()],
    });

    const result = await getDashboardAnalytics({});

    expect(result.expense.hasOpenEndedRange).toBe(true);
    expect(result.expense.estimatedMax).toBeNull();

    // KPI should show open-ended format with + sign
    const spendingKpi = result.kpis.find((k) => k.key === "estimated_spending");
    expect(spendingKpi?.value).toContain("+");
  });

  it("handles empty expense array", async () => {
    mockPayload.current = makePayload({
      visits: [visitRow()],
      expenses: [],
    });

    const result = await getDashboardAnalytics({});

    expect(result.expense.estimatedMin).toBeNull();
    expect(result.expense.estimatedMax).toBeNull();
    expect(result.expense.responseCount).toBe(0);
  });

  // ── 6h. Satisfaction ────────────────────────

  it("aggregates satisfaction scores and intention rates", async () => {
    mockPayload.current = makePayload({
      surveys: [
        surveyRow({
          overall_score: 5,
          facility_score: 4,
          cleanliness_score: 5,
          safety_score: 5,
          accessibility_score: 4,
          information_score: 5,
          value_score: 5,
          revisit_intention: "yes",
          recommend_intention: "yes",
        }),
        surveyRow({
          survey_id: 2,
          overall_score: 3,
          facility_score: 3,
          cleanliness_score: 3,
          safety_score: 4,
          accessibility_score: 3,
          information_score: 4,
          value_score: 3,
          revisit_intention: "no",
          recommend_intention: "yes",
        }),
        surveyRow({
          survey_id: 3,
          overall_score: 4,
          facility_score: 4,
          cleanliness_score: 4,
          safety_score: 4,
          accessibility_score: 5,
          information_score: 3,
          value_score: 4,
          revisit_intention: null, // skipped in yesRate
          recommend_intention: "no",
        }),
      ],
      visits: [visitRow(), visitRow({ visit_id: 2, tourist_id: "t2" }), visitRow({ visit_id: 3, tourist_id: "t3" })],
    });

    const result = await getDashboardAnalytics({});

    // Average overall: (5 + 3 + 4) / 3 = 4
    expect(result.satisfaction.averageOverall).toBe(4);
    expect(result.satisfaction.responseCount).toBe(3);

    // Sub-scores
    expect(result.satisfaction.safetyAverage).toBeCloseTo(4.33, 1);
    expect(result.satisfaction.cleanlinessAverage).toBe(4);
    expect(result.satisfaction.accessibilityAverage).toBe(4);
    expect(result.satisfaction.informationAverage).toBe(4);
    expect(result.satisfaction.valueAverage).toBe(4);
    expect(result.satisfaction.facilityAverage).toBeCloseTo(3.67, 1);

    // Revisit intention: 1 yes out of 2 answered (null excluded)
    expect(result.satisfaction.revisitIntentionRate).toBe(0.5);

    // Recommend intention: 2 yes out of 3 answered
    expect(result.satisfaction.recommendIntentionRate).toBeCloseTo(0.667, 2);

    // Distribution: scores 5, 3, 4
    expect(result.satisfaction.distribution).toHaveLength(3);
  });

  // ── 6i. Funnel ──────────────────────────────

  it("builds all 9 funnel stages with correct counts and conversion rates", async () => {
    mockPayload.current = makePayload({
      funnelEvents: [
        funnelEventRow("qr_scanned", { event_id: 1 }),
        funnelEventRow("qr_scanned", { event_id: 2 }),
        funnelEventRow("qr_scanned", { event_id: 3 }),
        funnelEventRow("landing_viewed", { event_id: 4 }),
        funnelEventRow("landing_viewed", { event_id: 5 }),
        funnelEventRow("certificate_started", { event_id: 6 }),
        funnelEventRow("minimal_form_completed", { event_id: 7 }),
        funnelEventRow("photo_uploaded", { event_id: 8 }),
        funnelEventRow("certificate_generated", { event_id: 9 }),
        funnelEventRow("survey_started", { event_id: 10 }),
        funnelEventRow("survey_completed", { event_id: 11 }),
        funnelEventRow("passport_saved", { event_id: 12 }),
      ],
    });

    const result = await getDashboardAnalytics({}, "funnel");

    expect(result.funnel.stages).toHaveLength(9);

    // Check first stage
    expect(result.funnel.stages[0].key).toBe("qr_scanned");
    expect(result.funnel.stages[0].count).toBe(3);
    expect(result.funnel.stages[0].conversionFromPrevious).toBeNull(); // first stage

    // Check landing_viewed: 2 of 3 = 66.7%
    expect(result.funnel.stages[1].key).toBe("landing_viewed");
    expect(result.funnel.stages[1].count).toBe(2);
    expect(result.funnel.stages[1].conversionFromPrevious).toBeCloseTo(0.667, 2);

    // Remaining stages all have count = 1
    for (let i = 2; i < 9; i++) {
      expect(result.funnel.stages[i].count).toBe(1);
    }

    // passport_saved = stage index 8
    expect(result.funnel.stages[8].key).toBe("passport_saved");
    expect(result.funnel.stages[8].count).toBe(1);
  });

  it("handles zero funnel events gracefully", async () => {
    mockPayload.current = makePayload();

    const result = await getDashboardAnalytics({});

    expect(result.funnel.stages).toHaveLength(9);
    result.funnel.stages.forEach((stage) => {
      expect(stage.count).toBe(0);
      expect(stage.conversionFromPrevious === null || stage.conversionFromPrevious === 0).toBe(true);
    });
    expect(result.funnel.largestDropOffStage).toBeNull();
  });

  // ── 6j. Insights ────────────────────────────

  it("generates improvement priority insight when a popular attraction has low satisfaction", async () => {
    mockPayload.current = makePayload({
      visits: [
        visitRow({ visit_id: 1, tourist_id: "t1" }),
        visitRow({ visit_id: 2, tourist_id: "t2" }),
        visitRow({ visit_id: 3, tourist_id: "t3" }),
        visitRow({ visit_id: 4, tourist_id: "t4" }),
      ],
      surveys: [
        surveyRow({ overall_score: 2 }),
        surveyRow({ survey_id: 2, overall_score: 3, visits: [{ ...surveyRow().visits[0], visit_date: "2026-05-02", tourist_id: "t2" }] }),
      ],
      certificates: [certificateRow(), certificateRow({ certificate_id: 2 })],
    });

    const result = await getDashboardAnalytics({});

    const improvement = result.insights.find((i) => i.category === "improvement");
    expect(improvement).toBeDefined();
    expect(improvement?.title).toBe("Improvement priority");
    expect(improvement?.description).toContain("หาดทรายขาว");
    expect(improvement?.evidence).toContain("4 visits");
  });

  it("generates promotion opportunity insight when a low-visit attraction has high satisfaction", async () => {
    // Requirement: visitCount <= 3 AND surveyResponseCount >= 2 AND avgSatisfaction >= 4
    mockPayload.current = makePayload({
      visits: [
        visitRow({ visit_id: 1, tourist_id: "t1" }),
        visitRow({ visit_id: 2, tourist_id: "t2" }),
      ],
      surveys: [
        surveyRow({ overall_score: 4 }),
        surveyRow({ survey_id: 2, overall_score: 5, visits: [{ ...surveyRow().visits[0], visit_date: "2026-05-02", tourist_id: "t2" }] }),
      ],
    });

    const result = await getDashboardAnalytics({});

    const promotion = result.insights.find((i) => i.category === "promotion");
    expect(promotion).toBeDefined();
    expect(promotion?.title).toBe("Promotion opportunity");
  });

  it("generates province concentration insight when there is at least 1 visit", async () => {
    mockPayload.current = makePayload({
      visits: [visitRow()],
    });

    const result = await getDashboardAnalytics({});

    const concentration = result.insights.find((i) => i.category === "concentration");
    expect(concentration).toBeDefined();
    expect(concentration?.description).toContain("ยะลา");
  });

  it("generates data quality insight when no surveys exist", async () => {
    mockPayload.current = makePayload({
      visits: [visitRow()],
      certificates: [certificateRow()],
      surveys: [],
    });

    const result = await getDashboardAnalytics({});

    const quality = result.insights.find((i) => i.category === "data_quality");
    expect(quality).toBeDefined();
    expect(quality?.title).toBe("Survey sample limitation");
  });

  // ── 6k. Edge cases ──────────────────────────

  it("handles missing nested relations gracefully", async () => {
    // Visit without any nested tourists or attractions
    mockPayload.current = makePayload({
      visits: [
        {
          visit_id: 1,
          tourist_id: "orphan",
          visit_date: "2026-05-01",
          attraction_id: null,
          completion_status: "complete",
          // No nested tourists or attractions
        },
      ],
    });

    const result = await getDashboardAnalytics({});

    // Should not crash; values should be "No data" or empty
    expect(result.kpis.find((k) => k.key === "tourist_profiles")?.value).toBe("1");
    expect(result.kpis.find((k) => k.key === "top_attraction")?.value).toBe("Unnamed attraction");
  });

  it("handles missing certificate with zero survey completion rate", async () => {
    mockPayload.current = makePayload({
      visits: [visitRow()],
      certificates: [],
      surveys: [surveyRow()],
    });

    const result = await getDashboardAnalytics({});

    // surveyCompletionRate = safeRate(1, 0) = null → "No data"
    expect(result.kpis.find((k) => k.key === "survey_completion_rate")?.value).toBe("No data");
  });

  it("handles null satisfaction scores without crashing", async () => {
    mockPayload.current = makePayload({
      surveys: [
        surveyRow({
          overall_score: null,
          facility_score: null,
          cleanliness_score: null,
          safety_score: null,
          accessibility_score: null,
          information_score: null,
          value_score: null,
        }),
      ],
      visits: [visitRow()],
    });

    const result = await getDashboardAnalytics({});

    expect(result.satisfaction.averageOverall).toBeNull();
    expect(result.satisfaction.safetyAverage).toBeNull();
    expect(result.satisfaction.cleanlinessAverage).toBeNull();
    expect(result.satisfaction.accessibilityAverage).toBeNull();
    expect(result.satisfaction.informationAverage).toBeNull();
    expect(result.satisfaction.valueAverage).toBeNull();
    expect(result.satisfaction.facilityAverage).toBeNull();
  });

  it("flags truncated data in quality warnings", async () => {
    mockPayload.current = makePayload({
      visits: Array.from({ length: 5 }, (_, i) => visitRow({ visit_id: i + 1, tourist_id: `t${i + 1}` })),
      isTruncated: true,
    });

    const result = await getDashboardAnalytics({});

    const truncationWarning = result.dataQualityWarnings.find((w) => w.includes("MVP limit"));
    expect(truncationWarning).toBeDefined();
  });

  it("sets dataSource to live_database when summary has no refresh timestamp", async () => {
    mockPayload.current = makePayload({
      visits: [visitRow()],
    });

    const result = await getDashboardAnalytics({});

    expect(result.dataSource).toBe("live_database");
    expect(result.summaryRefreshTimestamp).toBeNull();
  });

  // ── 6l. Reference options pass-through ───────

  it("passes through reference options from repository", async () => {
    mockPayload.current = makePayload({
      visits: [visitRow()],
    });

    const result = await getDashboardAnalytics({});

    expect(result.referenceOptions.provinces).toHaveLength(1);
    expect(result.referenceOptions.provinces[0].label).toBe("ยะลา");
    expect(result.referenceOptions.originCountries[0].label).toBe("ไทย");
  });

  // ── 6m. Error handling ──────────────────────

  it("throws DashboardServiceError with VALIDATION_ERROR code for invalid filters", async () => {
    mockFilterResult.success = false;
    mockFilterResult.data = undefined;
    const zodError: MockDashboardFilterError = Object.assign(new Error("Validation failed"), {
      flatten: () => ({ fieldErrors: { dateFrom: ["Invalid date"] } }),
    });
    mockFilterResult.error = zodError;

    await expect(getDashboardAnalytics({ date_from: "invalid" })).rejects.toThrow(DashboardServiceError);
    await expect(getDashboardAnalytics({ date_from: "invalid" })).rejects.toThrow(
      "Dashboard filters are invalid"
    );
  });

  it("throws DashboardServiceError with UNAUTHORIZED code when auth fails", async () => {
    mockAuthResult.shouldThrow = true;

    await expect(getDashboardAnalytics({})).rejects.toThrow(DashboardServiceError);
    await expect(getDashboardAnalytics({})).rejects.toThrow("Please sign in");
  });

  it("throws DashboardServiceError with QUERY_FAILED code when repository throws", async () => {
    mockRepoShouldThrow.current = true;

    await expect(getDashboardAnalytics({})).rejects.toThrow(DashboardServiceError);
    await expect(getDashboardAnalytics({})).rejects.toThrow("Could not load dashboard data");

    mockRepoShouldThrow.current = false;
  });

  // ── 6n. View metadata ──────────────────────

  it("includes viewer info, filter info, and generation timestamp", async () => {
    mockPayload.current = makePayload({
      visits: [visitRow()],
    });

    const result = await getDashboardAnalytics({});

    expect(result.viewer.displayName).toBe("Test Admin");
    expect(result.viewer.email).toBe("admin@test.com");
    expect(result.viewer.permissions).toContain("dashboard.read");
    expect(result.filters.dateFrom).toBe("2026-05-01");
    expect(result.filters.dateTo).toBe("2026-05-31");
    expect(result.generatedAt).toBeTruthy();
  });
});

// ──────────────────────────────────────────────
// 7. DashboardServiceError class test
// ──────────────────────────────────────────────
describe("DashboardServiceError", () => {
  it("stores code, message, and optional fieldErrors", () => {
    const err = new DashboardServiceError("VALIDATION_ERROR", "Invalid input", {
      dateFrom: ["Required"],
    });

    expect(err.code).toBe("VALIDATION_ERROR");
    expect(err.message).toBe("Invalid input");
    expect(err.fieldErrors?.dateFrom).toEqual(["Required"]);
    expect(err.name).toBe("DashboardServiceError");
  });

  it("works without fieldErrors", () => {
    const err = new DashboardServiceError("UNAUTHORIZED", "Not signed in");

    expect(err.code).toBe("UNAUTHORIZED");
    expect(err.fieldErrors).toBeUndefined();
  });

  it("is instance of Error", () => {
    const err = new DashboardServiceError("FORBIDDEN", "No permission");
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(DashboardServiceError);
  });
});
