import "server-only";

import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import type { PaginatedResult } from "@/lib/repositories/admin-attraction.repository";
import type { AdminVisitFilters } from "@/lib/validation/admin-visit";

export type AdminVisitRow = {
  visit_id: string;
  tourist_id: string;
  attraction_id: number;
  visit_date: string;
  completion_status: string;
  created_at: string;
  tourist_display_name: string | null;
  attraction_name_th: string | null;
  province_name_th: string | null;
  has_certificate: boolean;
  has_stamp: boolean;
};

export type AdminVisitExportRow = {
  visit_date: string;
  attraction_name_th: string | null;
  province_name_th: string | null;
  completion_status: string;
  has_certificate: boolean;
  has_stamp: boolean;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapVisit(row: any, certSet: Set<string>, stampSet: Set<string>): AdminVisitRow {
  const tourist = Array.isArray(row.tourists) ? row.tourists[0] : row.tourists;
  const attraction = Array.isArray(row.attractions) ? row.attractions[0] : row.attractions;
  const province = attraction
    ? Array.isArray(attraction.provinces) ? attraction.provinces[0] : attraction.provinces
    : null;

  return {
    visit_id: row.visit_id,
    tourist_id: row.tourist_id,
    attraction_id: Number(row.attraction_id),
    visit_date: row.visit_date,
    completion_status: row.completion_status,
    created_at: row.created_at,
    tourist_display_name: tourist?.display_name ?? null,
    attraction_name_th: attraction?.name_th ?? null,
    province_name_th: province?.province_name_th ?? null,
    has_certificate: certSet.has(row.visit_id),
    has_stamp: stampSet.has(row.visit_id),
  };
}

export async function listAdminVisits(filters: AdminVisitFilters): Promise<PaginatedResult<AdminVisitRow>> {
  const supabase = createSupabaseServiceRoleClient();
  const from = (filters.page - 1) * filters.pageSize;
  const to = from + filters.pageSize - 1;

  let query = supabase
    .from("visits")
    .select(
      `visit_id, tourist_id, attraction_id, visit_date, completion_status, created_at,
       tourists (display_name),
       attractions (name_th, provinces (province_name_th))`,
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (filters.search) {
    // Can't easily filter by joined tourist name in Supabase, so filter by visit_id pattern
    query = query.or(`tourist_id.ilike.%${filters.search}%`);
  }
  if (filters.attractionId) query = query.eq("attraction_id", filters.attractionId);
  if (filters.completionStatus) query = query.eq("completion_status", filters.completionStatus);
  if (filters.dateFrom) query = query.gte("visit_date", filters.dateFrom);
  if (filters.dateTo) query = query.lte("visit_date", filters.dateTo);

  const { data, error, count } = await query;
  if (error) throw new Error("ADMIN_VISIT_LIST_FAILED");

  const visitIds = (data ?? []).map((row) => row.visit_id);

  // Batch check certificates and stamps
  let certSet = new Set<string>();
  let stampSet = new Set<string>();

  if (visitIds.length > 0) {
    const [certs, stamps] = await Promise.all([
      supabase.from("certificates").select("visit_id").in("visit_id", visitIds),
      supabase.from("tourist_stamps").select("visit_id").in("visit_id", visitIds),
    ]);
    certSet = new Set((certs.data ?? []).map((r) => r.visit_id));
    stampSet = new Set((stamps.data ?? []).map((r) => r.visit_id));
  }

  return {
    items: (data ?? []).map((row) => mapVisit(row, certSet, stampSet)),
    total: count ?? 0,
    page: filters.page,
    pageSize: filters.pageSize,
  };
}

export async function exportAdminVisits(
  filters: Omit<AdminVisitFilters, "page" | "pageSize">,
  limit?: number
): Promise<AdminVisitRow[]> {
  const supabase = createSupabaseServiceRoleClient();

  let query = supabase
    .from("visits")
    .select(
      `visit_id, tourist_id, attraction_id, visit_date, completion_status, created_at,
       tourists (display_name),
       attractions (name_th, provinces (province_name_th))`
    )
    .order("created_at", { ascending: false });

  if (filters.search) {
    query = query.or(`tourist_id.ilike.%${filters.search}%`);
  }
  if (filters.attractionId) query = query.eq("attraction_id", filters.attractionId);
  if (filters.completionStatus) query = query.eq("completion_status", filters.completionStatus);
  if (filters.dateFrom) query = query.gte("visit_date", filters.dateFrom);
  if (filters.dateTo) query = query.lte("visit_date", filters.dateTo);
  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  if (error) throw new Error("ADMIN_VISIT_EXPORT_FAILED");

  const visitIds = (data ?? []).map((row) => row.visit_id);

  let certSet = new Set<string>();
  let stampSet = new Set<string>();

  if (visitIds.length > 0) {
    const [certs, stamps] = await Promise.all([
      supabase.from("certificates").select("visit_id").in("visit_id", visitIds),
      supabase.from("tourist_stamps").select("visit_id").in("visit_id", visitIds),
    ]);
    certSet = new Set((certs.data ?? []).map((r) => r.visit_id));
    stampSet = new Set((stamps.data ?? []).map((r) => r.visit_id));
  }

  return (data ?? []).map((row) => mapVisit(row, certSet, stampSet));
}

export function toSafeVisitExportRows(rows: AdminVisitRow[]): AdminVisitExportRow[] {
  return rows.map((row) => ({
    visit_date: row.visit_date,
    attraction_name_th: row.attraction_name_th,
    province_name_th: row.province_name_th,
    completion_status: row.completion_status,
    has_certificate: row.has_certificate,
    has_stamp: row.has_stamp
  }));
}
