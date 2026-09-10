import { beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ from: vi.fn(), select: vi.fn(), eq: vi.fn(), gte: vi.fn(), lt: vi.fn(), lte: vi.fn(), order: vi.fn(), range: vi.fn(), config: vi.fn() }));
vi.mock("@/lib/supabase/service-role", () => ({ createSupabaseServiceRoleClient: () => mocks }));
vi.mock("@/lib/config/checkin-entry", () => ({ getCheckinEntryConfig: mocks.config }));
import { readExecutiveEntryCohort } from "@/lib/repositories/executive-entry.repository";
const filters = { dateFrom: "2026-09-01", dateTo: "2026-09-10", evidenceScope: "field_claim" as const };
beforeEach(() => {
  vi.resetAllMocks(); mocks.config.mockReturnValue({ sessionsEnabled: true });
  for (const fn of [mocks.from,mocks.select,mocks.eq,mocks.gte,mocks.lt,mocks.lte,mocks.order]) fn.mockReturnValue(mocks);
});
it("does not query disabled tracking or unsupported respondent filters", async () => {
  mocks.config.mockReturnValue({ sessionsEnabled: false });
  expect((await readExecutiveEntryCohort(filters)).status).toBe("disabled");
  mocks.config.mockReturnValue({ sessionsEnabled: true });
  expect((await readExecutiveEntryCohort({ ...filters, ageGroup: "18-24" })).status).toBe("unsupported_filters");
  expect(mocks.from).not.toHaveBeenCalled();
});
it("uses immutable entry location, Thai half-open bounds and one as-of cutoff", async () => {
  mocks.range.mockResolvedValue({ data: [], count: 0, error: null });
  const result = await readExecutiveEntryCohort({ ...filters, attractionId: 4, provinceId: 1 });
  expect(result.status).toBe("ready");
  expect(mocks.eq).toHaveBeenCalledWith("attraction_id_snapshot",4);
  expect(mocks.eq).toHaveBeenCalledWith("attractions.province_id",1);
  expect(mocks.gte).toHaveBeenCalledWith("created_at","2026-09-01T00:00:00+07:00");
  expect(mocks.lt).toHaveBeenCalledWith("created_at","2026-09-11T00:00:00+07:00");
  expect(mocks.lte).toHaveBeenCalledWith("created_at",result.asOf);
});
it("does not mistake a provider row cap for the end of a cohort", async () => {
  mocks.range.mockResolvedValueOnce({ data: [{ entry_session_id: "a" }], count: 2, error: null })
    .mockResolvedValueOnce({ data: [{ entry_session_id: "b" }], count: 2, error: null });
  const result = await readExecutiveEntryCohort(filters);
  expect(result.status).toBe("ready"); expect(result.rows).toHaveLength(2);
  expect(mocks.range).toHaveBeenNthCalledWith(2,1,1000);
});
it.each([null,10001])("blocks unknown or excessive counts %s", async count => {
  mocks.range.mockResolvedValue({ data: [], count, error: null });
  expect(await readExecutiveEntryCohort(filters)).toMatchObject({ status: "incomplete", rows: [] });
});
it("discards a changing cohort or duplicate page rather than returning partial totals", async () => {
  mocks.range.mockResolvedValueOnce({ data: [{ entry_session_id: "a" }], count: 2, error: null })
    .mockResolvedValueOnce({ data: [{ entry_session_id: "a" }], count: 2, error: null });
  expect(await readExecutiveEntryCohort(filters)).toMatchObject({ status: "incomplete", rows: [] });
});
it("sanitizes database errors", async () => {
  mocks.range.mockResolvedValue({ data: null, error: { message: "private SQL detail" } });
  await expect(readExecutiveEntryCohort(filters)).rejects.toThrow("EXECUTIVE_ENTRY_QUERY_FAILED");
});
it("bounds the number of requests when the provider applies a tiny row cap", async () => {
  let page = 0;
  mocks.range.mockImplementation(async () => ({ data: [{ entry_session_id: `entry-${++page}` }], count: 26, error: null }));
  expect(await readExecutiveEntryCohort(filters)).toMatchObject({ status: "incomplete", rows: [] });
  expect(mocks.range).toHaveBeenCalledTimes(25);
});
it("rejects a changed total or an empty page before the expected end", async () => {
  for (const response of [{ data: [], count: 2, error: null }, { data: [{ entry_session_id: "b" }], count: 3, error: null }]) {
    mocks.range.mockResolvedValueOnce({ data: [{ entry_session_id: "a" }], count: 2, error: null }).mockResolvedValueOnce(response);
    expect(await readExecutiveEntryCohort(filters)).toMatchObject({ status: "incomplete", rows: [] });
  }
});
