import "server-only";

import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import type { PaginatedResult } from "@/lib/repositories/admin-attraction.repository";
import type { AdminSurveyFilters } from "@/lib/validation/admin-survey";

export type AdminSurveyRow = {
  survey_id: string;
  visit_id: string;
  tourist_id: string;
  overall_score: number | null;
  facility_score: number | null;
  cleanliness_score: number | null;
  safety_score: number | null;
  revisit_intention: string | null;
  recommend_intention: string | null;
  comments: string | null;
  submitted_at: string;
  tourist_display_name: string | null;
  attraction_name_th: string | null;
  province_name_th: string | null;
};

export type AdminSurveyExportRow = {
  submitted_at: string;
  attraction_name_th: string | null;
  province_name_th: string | null;
  overall_score: number | null;
  facility_score: number | null;
  cleanliness_score: number | null;
  safety_score: number | null;
  revisit_intention: string | null;
  recommend_intention: string | null;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapSurvey(row: any): AdminSurveyRow {
  const visit = Array.isArray(row.visits) ? row.visits[0] : row.visits;
  const tourist = Array.isArray(row.tourists) ? row.tourists[0] : row.tourists;
  const attraction = visit
    ? Array.isArray(visit.attractions) ? visit.attractions[0] : visit.attractions
    : null;
  const province = attraction
    ? Array.isArray(attraction.provinces) ? attraction.provinces[0] : attraction.provinces
    : null;

  return {
    survey_id: row.survey_id,
    visit_id: row.visit_id,
    tourist_id: row.tourist_id,
    overall_score: row.overall_score,
    facility_score: row.facility_score,
    cleanliness_score: row.cleanliness_score,
    safety_score: row.safety_score,
    revisit_intention: row.revisit_intention,
    recommend_intention: row.recommend_intention,
    comments: row.comments,
    submitted_at: row.submitted_at,
    tourist_display_name: tourist?.display_name ?? null,
    attraction_name_th: attraction?.name_th ?? null,
    province_name_th: province?.province_name_th ?? null,
  };
}

export async function listAdminSurveys(filters: AdminSurveyFilters): Promise<PaginatedResult<AdminSurveyRow>> {
  const supabase = createSupabaseServiceRoleClient();
  const from = (filters.page - 1) * filters.pageSize;
  const to = from + filters.pageSize - 1;

  let query = supabase
    .from("satisfaction_surveys")
    .select(
      `survey_id, visit_id, tourist_id, overall_score, facility_score, cleanliness_score, safety_score,
       revisit_intention, recommend_intention, comments, submitted_at,
       tourists (display_name),
       visits (attractions (name_th, provinces (province_name_th)))`,
      { count: "exact" }
    )
    .order("submitted_at", { ascending: false })
    .range(from, to);

  if (filters.minScore) query = query.gte("overall_score", filters.minScore);
  if (filters.maxScore) query = query.lte("overall_score", filters.maxScore);

  const { data, error, count } = await query;
  if (error) throw new Error("ADMIN_SURVEY_LIST_FAILED");

  return {
    items: (data ?? []).map(mapSurvey),
    total: count ?? 0,
    page: filters.page,
    pageSize: filters.pageSize,
  };
}

export async function exportAdminSurveys(
  filters: Omit<AdminSurveyFilters, "page" | "pageSize">,
  limit?: number
): Promise<AdminSurveyRow[]> {
  const supabase = createSupabaseServiceRoleClient();

  let query = supabase
    .from("satisfaction_surveys")
    .select(
      `survey_id, visit_id, tourist_id, overall_score, facility_score, cleanliness_score, safety_score,
       revisit_intention, recommend_intention, comments, submitted_at,
       tourists (display_name),
       visits (attractions (name_th, provinces (province_name_th)))`
    )
    .order("submitted_at", { ascending: false });

  if (filters.minScore) query = query.gte("overall_score", filters.minScore);
  if (filters.maxScore) query = query.lte("overall_score", filters.maxScore);
  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  if (error) throw new Error("ADMIN_SURVEY_EXPORT_FAILED");

  return (data ?? []).map(mapSurvey);
}

export function toSafeSurveyExportRows(rows: AdminSurveyRow[]): AdminSurveyExportRow[] {
  return rows.map((row) => ({
    submitted_at: row.submitted_at,
    attraction_name_th: row.attraction_name_th,
    province_name_th: row.province_name_th,
    overall_score: row.overall_score,
    facility_score: row.facility_score,
    cleanliness_score: row.cleanliness_score,
    safety_score: row.safety_score,
    revisit_intention: row.revisit_intention,
    recommend_intention: row.recommend_intention
  }));
}
