import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ from: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("@/lib/config/checkin-entry", () => ({ getCheckinEntryConfig: () => ({ sessionsEnabled: false }) }));
vi.mock("@/lib/repositories/destination-scope.repository", () => ({ listLiveDestinationProvinceIds: () => Promise.resolve([1]) }));
vi.mock("@/lib/supabase/service-role", () => ({ createSupabaseServiceRoleClient: () => ({ from: mocks.from }) }));

import { getAttractionAnalyticsRows } from "@/lib/repositories/attraction-analytics.repository";

const foreignEvent = { event_id: 99, checkin_code_id: 99, event_type: "qr_scanned", event_time: "2026-09-10T12:00:00Z" };
const localEvent = { event_id: 10, checkin_code_id: 10, event_type: "qr_scanned", event_time: "2026-09-10T12:00:00Z" };
const localCode = { checkin_code_id: 10, code: "local-code", label: "ทางเข้าหลัก", campaign_id: 7 };
const baseFilters = { attractionId: 4, dateFrom: "2026-09-01", dateTo: "2026-09-30", evidenceScope: "all_records" as const };
let checkinCodeRows: Record<string, unknown>[] = [localCode];

function query(table: string) {
  const equalities = new Map<string, unknown>();
  const lists = new Map<string, unknown[]>();
  const result = {
    select: vi.fn(() => result),
    eq: vi.fn((field: string, value: unknown) => { equalities.set(field, value); return result; }),
    in: vi.fn((field: string, values: unknown[]) => { lists.set(field, values); return result; }),
    gte: vi.fn(() => result),
    lte: vi.fn(() => result),
    lt: vi.fn(() => result),
    order: vi.fn(() => result),
    limit: vi.fn(() => result),
    maybeSingle: vi.fn(async () => ({
      data: { attraction_id: 4, name_th: "วัดหน้าถ้ำ", province_id: 1, attraction_type_id: null },
      error: null,
    })),
    then: (resolve: (value: { data: Record<string, unknown>[]; error: null }) => unknown) => {
      let data: Record<string, unknown>[] = [];
      if (table === "attractions") data = [{ attraction_id: 4, name_th: "วัดหน้าถ้ำ" }];
      if (table === "checkin_codes") data = checkinCodeRows;
      if (table === "funnel_events") {
        data = [localEvent, foreignEvent].filter((event) => lists.get("checkin_code_id")?.includes(event.checkin_code_id));
      }
      if (table === "visits" && equalities.get("attraction_id") !== 4) data = [];
      return resolve({ data, error: null });
    },
  };
  return result;
}

describe("attraction analytics repository scope", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    checkinCodeRows = [localCode];
    mocks.from.mockImplementation(query);
  });

  it("fails closed when the check-in reference exceeds the bounded read", async () => {
    checkinCodeRows = Array.from({ length: 501 }, (_, index) => ({
      checkin_code_id: index + 1, code: `code-${index + 1}`, label: `จุด ${index + 1}`, campaign_id: null,
    }));
    await expect(getAttractionAnalyticsRows(baseFilters)).rejects.toThrow("ATTRACTION_ANALYTICS_CHECKIN_SCOPE_LIMIT");
    expect(mocks.from).not.toHaveBeenCalledWith("funnel_events");
  });

  it("never loads another attraction's funnel events from a forged check-in code filter", async () => {
    const rows = await getAttractionAnalyticsRows({ ...baseFilters, checkinCodeId: 99 });
    expect(rows?.visits).toEqual([]);
    expect(rows?.funnelEvents).toEqual([]);
    expect(mocks.from).not.toHaveBeenCalledWith("funnel_events");
  });

  it("retains the selected attraction's own code filter", async () => {
    const rows = await getAttractionAnalyticsRows({ ...baseFilters, checkinCodeId: 10 });
    expect(rows?.funnelEvents).toEqual([localEvent]);
  });
});
