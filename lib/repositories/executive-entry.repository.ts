import "server-only";
import { getCheckinEntryConfig } from "@/lib/config/checkin-entry";
import { getEntryCohortFilterSupport } from "@/lib/dashboard/entry-cohort-filter-support";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { bangkokDateRangeBounds } from "@/lib/utils/bangkok-datetime";
import { asRecord } from "@/lib/utils/record";
import type { DashboardFiltersInput } from "@/lib/validation/dashboard-filters";

const ROW_LIMIT = 10_000;
const PAGE_SIZE = 1000;
const MAX_PAGES = 25;

// Server-only read layer. The calling service must authorize dashboard.read.
export async function readExecutiveEntryCohort(filters: DashboardFiltersInput) {
  const asOf = new Date().toISOString();
  const support = getEntryCohortFilterSupport(filters);
  const blocked = (status: "disabled" | "unsupported_filters" | "incomplete") => ({
    status, asOf, rows: [] as Record<string, unknown>[], unsupportedFilters: support.unsupportedFilters,
  });
  if (!getCheckinEntryConfig().sessionsEnabled) return blocked("disabled");
  if (!support.supported) return blocked("unsupported_filters");
  const bounds = bangkokDateRangeBounds(filters.dateFrom, filters.dateTo);
  const supabase = createSupabaseServiceRoleClient();
  const rows: Record<string, unknown>[] = [];
  const ids = new Set<string>();
  let expectedCount: number | undefined;
  let pages = 0;
  do {
    if (pages++ >= MAX_PAGES) return blocked("incomplete");
    let query = supabase.from("checkin_entry_sessions").select(`
      entry_session_id,entry_channel,evidence_scope,visit_id,created_at,
      attractions!inner(attraction_id,province_id,district_id,attraction_type_id),
      visits(visit_id,created_at,certificates(certificate_id,generated_at),satisfaction_surveys(survey_id,submitted_at))
    `, { count: "exact" })
      .gte("created_at",bounds.fromInclusive).lt("created_at",bounds.toExclusive)
      .lte("created_at",asOf)
      .order("created_at",{ ascending: true }).order("entry_session_id",{ ascending: true });
    if (filters.attractionId !== undefined) query = query.eq("attraction_id_snapshot",filters.attractionId);
    if (filters.provinceId !== undefined) query = query.eq("attractions.province_id",filters.provinceId);
    if (filters.districtId !== undefined) query = query.eq("attractions.district_id",filters.districtId);
    if (filters.attractionTypeId !== undefined) query = query.eq("attractions.attraction_type_id",filters.attractionTypeId);
    const { data, count, error } = await query.range(rows.length,Math.min(rows.length + PAGE_SIZE - 1,ROW_LIMIT - 1));
    if (error) throw new Error("EXECUTIVE_ENTRY_QUERY_FAILED");
    if (count === null || !Number.isInteger(count) || count < 0 || count > ROW_LIMIT
      || (expectedCount !== undefined && expectedCount !== count) || !Array.isArray(data)) return blocked("incomplete");
    expectedCount = count;
    if (data.length > PAGE_SIZE || rows.length + data.length > count
      || (data.length === 0 && rows.length < count)) return blocked("incomplete");
    for (const value of data) {
      const row = asRecord(value);
      if (typeof row.entry_session_id !== "string" || !row.entry_session_id || ids.has(row.entry_session_id)) return blocked("incomplete");
      ids.add(row.entry_session_id); rows.push(row);
    }
    // Advance by actual rows: provider-side row limits may be below PAGE_SIZE.
  } while (rows.length < expectedCount);
  return { status: "ready" as const, asOf, rows, unsupportedFilters: support.unsupportedFilters };
}
