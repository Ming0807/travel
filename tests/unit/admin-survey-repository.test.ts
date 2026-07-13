import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

type QueryResult = {
  data: unknown;
  error: unknown;
  count?: number | null;
};

type MockFn = ReturnType<typeof vi.fn>;

type MockQueryBuilder = {
  select: MockFn;
  order: MockFn;
  range: MockFn;
  gte: MockFn;
  lte: MockFn;
  ilike: MockFn;
  eq: MockFn;
  limit: MockFn;
  maybeSingle: MockFn;
  then: <TResult1 = QueryResult, TResult2 = never>(
    onfulfilled?: ((value: QueryResult) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ) => Promise<TResult1 | TResult2>;
};

const serviceRoleMocks = vi.hoisted(() => ({
  from: vi.fn(),
}));

vi.mock("@/lib/supabase/service-role", () => ({
  createSupabaseServiceRoleClient: () => ({
    from: serviceRoleMocks.from,
  }),
}));

import * as adminSurveyRepository from "@/lib/repositories/admin-survey.repository";

const { exportAdminSurveys, listAdminSurveys } = adminSurveyRepository;

function createBuilder(result: QueryResult = { data: [], error: null, count: 0 }): MockQueryBuilder {
  const builder = {} as MockQueryBuilder;
  const chainMethods = ["select", "order", "range", "gte", "lte", "ilike", "eq", "limit"] as const;

  for (const method of chainMethods) {
    builder[method] = vi.fn(() => builder);
  }

  builder.then = (onfulfilled, onrejected) => Promise.resolve(result).then(onfulfilled, onrejected);
  builder.maybeSingle = vi.fn(async () => result);

  return builder;
}

describe("admin survey repository filters", () => {
  let builder: MockQueryBuilder;

  beforeEach(() => {
    vi.clearAllMocks();
    builder = createBuilder();
    serviceRoleMocks.from.mockReturnValue(builder);
  });

  it("applies score, attraction, province, and pagination filters when listing surveys", async () => {
    await listAdminSurveys({
      page: 2,
      pageSize: 10,
      minScore: 3,
      maxScore: 5,
      attractionId: 42,
      provinceId: 7,
    });

    expect(serviceRoleMocks.from).toHaveBeenCalledWith("satisfaction_surveys");
    expect(builder.select).toHaveBeenCalledWith(expect.stringContaining("visits!inner"), { count: "exact" });
    expect(builder.select).toHaveBeenCalledWith(expect.stringContaining("attractions!inner"), { count: "exact" });
    expect(builder.range).toHaveBeenCalledWith(10, 19);
    expect(builder.gte).toHaveBeenCalledWith("overall_score", 3);
    expect(builder.lte).toHaveBeenCalledWith("overall_score", 5);
    expect(builder.eq).toHaveBeenCalledWith("visits.attraction_id", 42);
    expect(builder.eq).toHaveBeenCalledWith("visits.attractions.province_id", 7);
  });

  it("applies the same operational filters when exporting surveys", async () => {
    await exportAdminSurveys(
      {
        minScore: 2,
        maxScore: 4,
        attractionId: 12,
        provinceId: 3,
      },
      500
    );

    expect(serviceRoleMocks.from).toHaveBeenCalledWith("satisfaction_surveys");
    expect(builder.select).toHaveBeenCalledWith(expect.stringContaining("visits!inner"));
    expect(builder.select).toHaveBeenCalledWith(expect.stringContaining("attractions!inner"));
    expect(builder.gte).toHaveBeenCalledWith("overall_score", 2);
    expect(builder.lte).toHaveBeenCalledWith("overall_score", 4);
    expect(builder.eq).toHaveBeenCalledWith("visits.attraction_id", 12);
    expect(builder.eq).toHaveBeenCalledWith("visits.attractions.province_id", 3);
    expect(builder.limit).toHaveBeenCalledWith(500);
  });

  it("exposes a detail read model for one voluntary response", () => {
    expect(adminSurveyRepository).toHaveProperty("getAdminSurveyDetail");
  });

  it("summarizes which voluntary-data sections were answered in the list", async () => {
    builder = createBuilder({
      data: [{
        survey_id: "11111111-1111-4111-8111-111111111111",
        visit_id: "22222222-2222-4222-8222-222222222222",
        tourist_id: "33333333-3333-4333-8333-333333333333",
        overall_score: 5,
        comments: "ประทับใจ",
        submitted_at: "2026-07-13T10:00:00.000Z",
        tourists: { display_name: "สมชาย" },
        visits: {
          group_size: 4,
          attractions: { name_th: "ทะเลหมอก", provinces: { province_name_th: "ยะลา" } },
          visit_expenses: [{ expense_category_id: 1, spending_range_id: 2 }],
        },
      }],
      error: null,
      count: 1,
    });
    serviceRoleMocks.from.mockReturnValue(builder);

    const result = await listAdminSurveys({ page: 1, pageSize: 20 });

    expect(result.items[0]).toMatchObject({
      has_travel_behavior: true,
      has_expense: true,
      has_satisfaction: true,
      has_comment: true,
      answered_field_count: 5,
    });
  });

  it("returns respondent, visit, behavior, expense, and satisfaction context for detail", async () => {
    const surveyBuilder = createBuilder({
      data: {
        survey_id: "11111111-1111-4111-8111-111111111111",
        visit_id: "22222222-2222-4222-8222-222222222222",
        tourist_id: "33333333-3333-4333-8333-333333333333",
        overall_score: 5,
        safety_score: 4,
        revisit_intention: "yes",
        comments: "ประทับใจ",
        submitted_at: "2026-07-13T10:00:00.000Z",
        tourists: {
          display_name: "สมชาย",
          age_group: "25-34",
          preferred_language: "th",
          countries: { country_name_th: "ไทย" },
          provinces: { province_name_th: "ปัตตานี" },
        },
        visits: {
          visit_date: "2026-07-13",
          visited_at: "2026-07-13T09:00:00.000Z",
          completion_status: "survey_completed",
          group_size: 4,
          overnight_status: "overnight",
          nights: 2,
          travel_companions: { name_th: "ครอบครัว" },
          transport_modes: { name_th: "รถยนต์ส่วนตัว" },
          travel_purposes: { name_th: "พักผ่อน" },
          attractions: { name_th: "ทะเลหมอก", provinces: { province_name_th: "ยะลา" } },
          photo_spots: { spot_name_th: "จุดชมวิว" },
          checkin_codes: { label: "ทางเข้าหลัก" },
        },
      },
      error: null,
    });
    const expenseBuilder = createBuilder({
      data: {
        estimated_amount: null,
        expense_categories: { name_th: "อาหาร" },
        spending_ranges: { range_label_th: "1,001-2,000 บาท", min_value: 1001, max_value: 2000 },
      },
      error: null,
    });
    serviceRoleMocks.from.mockImplementation((table: string) =>
      table === "visit_expenses" ? expenseBuilder : surveyBuilder
    );

    const result = await adminSurveyRepository.getAdminSurveyDetail(
      "11111111-1111-4111-8111-111111111111"
    );

    expect(result).toMatchObject({
      surveyId: "11111111-1111-4111-8111-111111111111",
      respondent: { displayName: "สมชาย", countryName: "ไทย", provinceName: "ปัตตานี" },
      visit: { attractionName: "ทะเลหมอก", attractionProvince: "ยะลา" },
      travelBehavior: { groupSize: 4, companion: "ครอบครัว", nights: 2 },
      expense: { category: "อาหาร", spendingRange: "1,001-2,000 บาท" },
      satisfaction: { overallScore: 5, safetyScore: 4, comment: "ประทับใจ" },
      answerSummary: { hasTravelBehavior: true, hasExpense: true, hasSatisfaction: true, hasComment: true },
    });
  });
});
