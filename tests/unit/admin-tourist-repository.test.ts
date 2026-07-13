import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

type QueryResult = {
  data: Array<Record<string, unknown>> | Record<string, unknown> | null;
  error: unknown;
  count?: number | null;
};

type MockFn = ReturnType<typeof vi.fn>;
type MockBuilder = {
  select: MockFn;
  eq: MockFn;
  ilike: MockFn;
  in: MockFn;
  order: MockFn;
  range: MockFn;
  limit: MockFn;
  maybeSingle: MockFn;
  then: <TResult1 = QueryResult, TResult2 = never>(
    onfulfilled?: ((value: QueryResult) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ) => Promise<TResult1 | TResult2>;
};

const serviceRoleMocks = vi.hoisted(() => ({ from: vi.fn() }));

vi.mock("@/lib/supabase/service-role", () => ({
  createSupabaseServiceRoleClient: () => ({ from: serviceRoleMocks.from }),
}));

import {
  getAdminTouristDetail,
  listAdminTourists,
} from "@/lib/repositories/admin-tourist.repository";
import { adminTouristFiltersSchema } from "@/lib/validation/admin-tourist";

const buildersByTable = new Map<string, MockBuilder[]>();
const resultsByTable = new Map<string, QueryResult[]>();

function createBuilder(result: QueryResult): MockBuilder {
  const builder = {} as MockBuilder;
  for (const method of ["select", "eq", "ilike", "in", "order", "range", "limit"] as const) {
    builder[method] = vi.fn(() => builder);
  }
  builder.maybeSingle = vi.fn(() => Promise.resolve(result));
  builder.then = (onfulfilled, onrejected) => Promise.resolve(result).then(onfulfilled, onrejected);
  return builder;
}

function setResults(table: string, ...results: QueryResult[]): void {
  resultsByTable.set(table, [...results]);
}

function result(data: QueryResult["data"] = [], count: number | null = 0): QueryResult {
  return { data, error: null, count };
}

describe("admin tourist repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    buildersByTable.clear();
    resultsByTable.clear();
    serviceRoleMocks.from.mockImplementation((table: string) => {
      const nextResult = resultsByTable.get(table)?.shift() ?? result();
      const builder = createBuilder(nextResult);
      buildersByTable.set(table, [...(buildersByTable.get(table) ?? []), builder]);
      return builder;
    });
  });

  it("validates bounded server-side filter parameters", () => {
    expect(adminTouristFiltersSchema.parse({ search: "  สมชาย  " })).toMatchObject({
      page: 1,
      pageSize: 20,
      search: "สมชาย",
      sort: "newest",
    });
    expect(adminTouristFiltersSchema.safeParse({ pageSize: 101 }).success).toBe(false);
    expect(adminTouristFiltersSchema.safeParse({ provider: "unknown" }).success).toBe(false);
  });

  it("applies pagination, filters, provider join, and sort on the server", async () => {
    const touristId = "11111111-1111-4111-8111-111111111111";
    setResults(
      "tourists",
      result([
        {
          tourist_id: touristId,
          display_name: "นักท่องเที่ยวทดสอบ",
          age_group: "25-34",
          created_at: "2026-07-01T00:00:00.000Z",
          countries: { country_name_th: "ไทย" },
          provinces: { province_name_th: "ปัตตานี" },
        },
      ], 1)
    );
    setResults("tourist_identities", result([{ tourist_id: touristId, provider: "line" }]));
    setResults("visits", result([{ visit_id: "visit-1", tourist_id: touristId }]));
    setResults("tourist_stamps", result([{ tourist_id: touristId }]));
    setResults("satisfaction_surveys", result([{ tourist_id: touristId }]));
    setResults("certificates", result([{ visit_id: "visit-1" }]));

    const response = await listAdminTourists({
      page: 2,
      pageSize: 20,
      search: "นักท่องเที่ยว_100%",
      countryId: 1,
      provinceId: 2,
      provider: "line",
      sort: "name_asc",
    });

    const touristQuery = buildersByTable.get("tourists")?.[0];
    expect(touristQuery?.select.mock.calls[0]?.[0]).toContain("tourist_identities!inner(provider)");
    expect(touristQuery?.ilike).toHaveBeenCalledWith("display_name", "%นักท่องเที่ยว\\_100\\%%");
    expect(touristQuery?.eq).toHaveBeenCalledWith("origin_country_id", 1);
    expect(touristQuery?.eq).toHaveBeenCalledWith("origin_province_id", 2);
    expect(touristQuery?.eq).toHaveBeenCalledWith("tourist_identities.provider", "line");
    expect(touristQuery?.order).toHaveBeenCalledWith("display_name", { ascending: true });
    expect(touristQuery?.range).toHaveBeenCalledWith(20, 39);
    expect(response.items[0]).toMatchObject({
      reference: "T-11111111",
      displayName: "นักท่องเที่ยวทดสอบ",
      identityProviders: ["line"],
      visitCount: 1,
      certificateCount: 1,
      stampCount: 1,
      surveyCount: 1,
    });
  });

  it("returns a privacy-safe detail DTO without identity IDs, comments, or storage paths", async () => {
    const touristId = "22222222-2222-4222-8222-222222222222";
    setResults(
      "tourists",
      result({
        tourist_id: touristId,
        display_name: "ผู้ใช้ทดสอบ",
        age_group: "35-44",
        preferred_language: "th",
        profile_completed_at: null,
        created_at: "2026-07-01T00:00:00.000Z",
        updated_at: null,
        countries: { country_name_th: "ไทย" },
        provinces: { province_name_th: "ยะลา" },
        tourist_identities: [{ provider: "anonymous_device", provider_user_id: "guest-secret" }],
      })
    );
    setResults(
      "visits",
      result([
        {
          visit_id: "visit-1",
          visit_date: "2026-07-02",
          visited_at: null,
          created_at: "2026-07-02T00:00:00.000Z",
          completion_status: "survey_completed",
          attractions: { name_th: "สถานที่ทดสอบ", provinces: { province_name_th: "ยะลา" } },
          photo_spots: { spot_name_th: "จุดชมวิว" },
          checkin_codes: { label: "ประตูหลัก" },
          certificates: [{ generated_at: "2026-07-02T01:00:00.000Z", download_count: 1, certificate_path: "private/path" }],
          satisfaction_surveys: [{ survey_id: "44444444-4444-4444-8444-444444444444", overall_score: 5, submitted_at: "2026-07-02T02:00:00.000Z", comments: "private comment" }],
        },
      ]),
      result([], 1)
    );
    setResults(
      "tourist_stamps",
      result([{ earned_at: "2026-07-02T01:00:00.000Z", status: "earned", attractions: { name_th: "สถานที่ทดสอบ" }, stamp_definitions: { stamp_name_th: "ตราทดสอบ" } }]),
      result([], 1)
    );
    setResults("certificates", result([], 1));
    setResults("satisfaction_surveys", result([], 1));

    const detail = await getAdminTouristDetail(touristId);
    const serialized = JSON.stringify(detail);

    expect(detail?.totals).toEqual({ visits: 1, certificates: 1, stamps: 1, surveys: 1 });
    expect(detail?.identityProviders).toEqual(["anonymous_device"]);
    expect(detail?.recentVisits[0]?.survey?.overallScore).toBe(5);
    expect(detail?.recentVisits[0]?.survey?.surveyId).toBe("44444444-4444-4444-8444-444444444444");
    expect(serialized).not.toContain("guest-secret");
    expect(serialized).not.toContain("private/path");
    expect(serialized).not.toContain("private comment");
    expect(serialized).not.toContain("provider_user_id");
    expect(serialized).not.toContain("certificate_path");
  });
});
