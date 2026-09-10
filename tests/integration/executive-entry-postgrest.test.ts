// @vitest-environment node
import { createClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ requests: 0 }));
vi.mock("@/lib/config/checkin-entry", () => ({ getCheckinEntryConfig: () => ({ sessionsEnabled: true }) }));
vi.mock("@/lib/supabase/service-role", () => ({
  createSupabaseServiceRoleClient: () => {
    const url = process.env.EXECUTIVE_ENTRY_QA_URL;
    if (!url || !/^http:\/\/127\.0\.0\.1:\d+$/.test(url)) throw new Error("Disposable loopback QA URL required");
    return createClient(url, "local-fixture-only", {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { fetch: async (input, init) => {
        state.requests++;
        const headers = new Headers(init?.headers);
        headers.delete("authorization"); headers.delete("apikey");
        return fetch(String(input).replace(`${url}/rest/v1`, url), { ...init, headers });
      } },
    });
  },
}));
import { readExecutiveEntryCohort } from "@/lib/repositories/executive-entry.repository";
const filters = { dateFrom: "2026-08-01", dateTo: "2026-08-01", evidenceScope: "field_claim" as const };

describe.skipIf(!process.env.EXECUTIVE_ENTRY_QA_URL)("real PostgREST entry cohort", () => {
  it("reads every entry despite the provider's two-row cap and tied timestamps", async () => {
    state.requests = 0;
    const result = await readExecutiveEntryCohort(filters);
    expect(result.status).toBe("ready");
    expect(result.rows).toHaveLength(8);
    expect(state.requests).toBe(4);
    expect(new Set(result.rows.map(row => row.entry_session_id)).size).toBe(8);
  });
  it("retains abandoned entries and resolves real nested outcome relationships", async () => {
    const result = await readExecutiveEntryCohort(filters);
    expect(result.rows.filter(row => row.visits === null)).toHaveLength(7);
    expect(result.rows[0].visits).toMatchObject({
      visit_id: "20000000-0000-4000-8000-000000000001",
      certificates: [{ certificate_id: "30000000-0000-4000-8000-000000000001" }],
      satisfaction_surveys: [{ survey_id: "40000000-0000-4000-8000-000000000001" }],
    });
  });
  it("includes final microseconds but excludes next-day midnight", async () => {
    const { rows } = await readExecutiveEntryCohort(filters);
    expect(rows.at(-1)?.entry_session_id).toBe("10000000-0000-4000-8000-000000000008");
    expect(rows.some(row => row.entry_session_id === "10000000-0000-4000-8000-000000000009")).toBe(false);
  });
  it.each([{ attractionId: 4 }, { provinceId: 1 }, { districtId: 11 }, { attractionTypeId: 2 }])("applies scoped relationship filter %j", async scope => {
    const result = await readExecutiveEntryCohort({ ...filters, ...scope });
    expect(result.status).toBe("ready"); expect(result.rows).toHaveLength(5);
  });
  it("does not issue HTTP requests for unsupported post-entry filters", async () => {
    state.requests = 0;
    expect(await readExecutiveEntryCohort({ ...filters, ageGroup: "18-24" })).toMatchObject({ status: "unsupported_filters", rows: [] });
    expect(state.requests).toBe(0);
  });
});
