import "server-only";

import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import type { PaginatedResult } from "@/lib/repositories/admin-attraction.repository";
import type { AdminSurveyFilters } from "@/lib/validation/admin-survey";
import { firstJoin } from "@/lib/utils/supabase-joins";
import { asRecord, nullableNumber, nullableString, stringValue } from "@/lib/utils/record";

export type AdminSurveyRow = {
  survey_id: string;
  visit_id: string;
  tourist_id: string;
  overall_score: number | null;
  facility_score: number | null;
  cleanliness_score: number | null;
  safety_score: number | null;
  accessibility_score: number | null;
  information_score: number | null;
  value_score: number | null;
  revisit_intention: string | null;
  recommend_intention: string | null;
  comments: string | null;
  submitted_at: string;
  completed_at: string | null;
  tourist_display_name: string | null;
  attraction_name_th: string | null;
  province_name_th: string | null;
  has_travel_behavior: boolean;
  has_expense: boolean;
  has_satisfaction: boolean;
  has_comment: boolean;
  answered_field_count: number;
};

export type AdminSurveyDetail = {
  surveyId: string;
  visitId: string;
  submittedAt: string;
  completedAt: string | null;
  respondent: {
    touristId: string;
    reference: string;
    displayName: string;
    countryName: string | null;
    provinceName: string | null;
    ageGroup: string | null;
    preferredLanguage: string | null;
  };
  visit: {
    visitDate: string;
    visitedAt: string | null;
    createdAt: string;
    completionStatus: string;
    attractionName: string | null;
    attractionProvince: string | null;
    photoSpotName: string | null;
    checkinLabel: string | null;
  };
  travelBehavior: {
    companion: string | null;
    groupSize: number | null;
    transportMode: string | null;
    travelPurpose: string | null;
    overnightStatus: string | null;
    nights: number | null;
  };
  expense: {
    category: string | null;
    spendingRange: string | null;
    estimatedAmount: number | null;
    minimum: number | null;
    maximum: number | null;
  } | null;
  satisfaction: {
    overallScore: number | null;
    facilityScore: number | null;
    cleanlinessScore: number | null;
    safetyScore: number | null;
    accessibilityScore: number | null;
    informationScore: number | null;
    valueScore: number | null;
    revisitIntention: string | null;
    recommendIntention: string | null;
    comment: string | null;
  };
  answerSummary: {
    hasTravelBehavior: boolean;
    hasExpense: boolean;
    hasSatisfaction: boolean;
    hasComment: boolean;
    answeredFieldCount: number;
  };
};

export type AdminSurveyExportRow = {
  submitted_at: string;
  attraction_name_th: string | null;
  province_name_th: string | null;
  overall_score: number | null;
  facility_score: number | null;
  cleanliness_score: number | null;
  safety_score: number | null;
  accessibility_score: number | null;
  information_score: number | null;
  value_score: number | null;
  revisit_intention: string | null;
  recommend_intention: string | null;
  completed_at: string | null;
};

export async function getAdminSurveyDetail(surveyId: string): Promise<AdminSurveyDetail | null> {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("satisfaction_surveys")
    .select(
      `survey_id, visit_id, tourist_id, overall_score, facility_score, cleanliness_score, safety_score,
       accessibility_score, information_score, value_score,
       revisit_intention, recommend_intention, comments, submitted_at, completed_at,
       tourists (display_name, age_group, preferred_language,
         countries (country_name_th, country_name_en), provinces (province_name_th, province_name_en)),
       visits!inner (visit_date, visited_at, created_at, completion_status,
         travel_companion_id, group_size, transport_mode_id, travel_purpose_id, overnight_status, nights,
         travel_companions (name_th, name_en), transport_modes (name_th, name_en),
         travel_purposes (name_th, name_en), photo_spots (spot_name_th), checkin_codes (label),
         attractions!inner (name_th, province_id, provinces (province_name_th)))`
    )
    .eq("survey_id", surveyId)
    .maybeSingle();

  if (error) throw new Error("ADMIN_SURVEY_DETAIL_FAILED");
  if (!data) return null;

  const row = asRecord(data);
  const visitId = stringValue(row.visit_id);
  const expenseResult = await supabase
    .from("visit_expenses")
    .select(
      `estimated_amount,
       expense_categories (name_th, name_en),
       spending_ranges (range_label_th, range_label_en, min_value, max_value)`
    )
    .eq("visit_id", visitId)
    .limit(1)
    .maybeSingle();

  if (expenseResult.error) throw new Error("ADMIN_SURVEY_DETAIL_FAILED");

  const visit = asRecord(firstJoin(row.visits as Record<string, unknown> | Record<string, unknown>[] | null));
  const tourist = asRecord(firstJoin(row.tourists as Record<string, unknown> | Record<string, unknown>[] | null));
  const country = asRecord(firstJoin(tourist.countries as Record<string, unknown> | Record<string, unknown>[] | null));
  const originProvince = asRecord(firstJoin(tourist.provinces as Record<string, unknown> | Record<string, unknown>[] | null));
  const attraction = asRecord(firstJoin(visit.attractions as Record<string, unknown> | Record<string, unknown>[] | null));
  const attractionProvince = asRecord(firstJoin(attraction.provinces as Record<string, unknown> | Record<string, unknown>[] | null));
  const companion = asRecord(firstJoin(visit.travel_companions as Record<string, unknown> | Record<string, unknown>[] | null));
  const transport = asRecord(firstJoin(visit.transport_modes as Record<string, unknown> | Record<string, unknown>[] | null));
  const purpose = asRecord(firstJoin(visit.travel_purposes as Record<string, unknown> | Record<string, unknown>[] | null));
  const photoSpot = asRecord(firstJoin(visit.photo_spots as Record<string, unknown> | Record<string, unknown>[] | null));
  const checkinCode = asRecord(firstJoin(visit.checkin_codes as Record<string, unknown> | Record<string, unknown>[] | null));
  const expenseRow = asRecord(expenseResult.data);
  const expenseCategory = asRecord(firstJoin(expenseRow.expense_categories as Record<string, unknown> | Record<string, unknown>[] | null));
  const spendingRange = asRecord(firstJoin(expenseRow.spending_ranges as Record<string, unknown> | Record<string, unknown>[] | null));
  const touristId = stringValue(row.tourist_id);
  const listSummary = mapSurvey({ ...row, visits: { ...visit, visit_expenses: expenseResult.data } });
  const expenseFieldCount = expenseResult.data
    ? [expenseCategory.name_th ?? expenseCategory.name_en, spendingRange.range_label_th ?? spendingRange.range_label_en]
        .filter((value) => value !== null && value !== undefined && value !== "").length
    : 0;

  return {
    surveyId: stringValue(row.survey_id),
    visitId,
    submittedAt: stringValue(row.submitted_at),
    completedAt: nullableString(row.completed_at),
    respondent: {
      touristId,
      reference: `T-${touristId.slice(0, 8).toUpperCase()}`,
      displayName: nullableString(tourist.display_name) ?? "ผู้ใช้งานแบบผู้เยี่ยมชม",
      countryName: nullableString(country.country_name_th) ?? nullableString(country.country_name_en),
      provinceName: nullableString(originProvince.province_name_th) ?? nullableString(originProvince.province_name_en),
      ageGroup: nullableString(tourist.age_group),
      preferredLanguage: nullableString(tourist.preferred_language),
    },
    visit: {
      visitDate: stringValue(visit.visit_date),
      visitedAt: nullableString(visit.visited_at),
      createdAt: stringValue(visit.created_at),
      completionStatus: stringValue(visit.completion_status),
      attractionName: nullableString(attraction.name_th),
      attractionProvince: nullableString(attractionProvince.province_name_th),
      photoSpotName: nullableString(photoSpot.spot_name_th),
      checkinLabel: nullableString(checkinCode.label),
    },
    travelBehavior: {
      companion: nullableString(companion.name_th) ?? nullableString(companion.name_en),
      groupSize: nullableNumber(visit.group_size),
      transportMode: nullableString(transport.name_th) ?? nullableString(transport.name_en),
      travelPurpose: nullableString(purpose.name_th) ?? nullableString(purpose.name_en),
      overnightStatus: nullableString(visit.overnight_status),
      nights: nullableNumber(visit.nights),
    },
    expense: expenseResult.data ? {
      category: nullableString(expenseCategory.name_th) ?? nullableString(expenseCategory.name_en),
      spendingRange: nullableString(spendingRange.range_label_th) ?? nullableString(spendingRange.range_label_en),
      estimatedAmount: nullableNumber(expenseRow.estimated_amount),
      minimum: nullableNumber(spendingRange.min_value),
      maximum: nullableNumber(spendingRange.max_value),
    } : null,
    satisfaction: {
      overallScore: nullableNumber(row.overall_score),
      facilityScore: nullableNumber(row.facility_score),
      cleanlinessScore: nullableNumber(row.cleanliness_score),
      safetyScore: nullableNumber(row.safety_score),
      accessibilityScore: nullableNumber(row.accessibility_score),
      informationScore: nullableNumber(row.information_score),
      valueScore: nullableNumber(row.value_score),
      revisitIntention: nullableString(row.revisit_intention),
      recommendIntention: nullableString(row.recommend_intention),
      comment: nullableString(row.comments),
    },
    answerSummary: {
      hasTravelBehavior: listSummary.has_travel_behavior,
      hasExpense: expenseResult.data !== null,
      hasSatisfaction: listSummary.has_satisfaction,
      hasComment: listSummary.has_comment,
      answeredFieldCount: listSummary.answered_field_count + expenseFieldCount,
    },
  };
}

function mapSurvey(rawRow: unknown): AdminSurveyRow {
  const row = asRecord(rawRow);
  const visit = asRecord(firstJoin(row.visits as { attractions?: unknown } | { attractions?: unknown }[] | null));
  const tourist = asRecord(firstJoin(row.tourists as { display_name?: unknown } | { display_name?: unknown }[] | null));
  const attraction = asRecord(firstJoin(visit.attractions as { name_th?: unknown; provinces?: unknown } | { name_th?: unknown; provinces?: unknown }[] | null));
  const province = asRecord(firstJoin(attraction.provinces as { province_name_th?: unknown } | { province_name_th?: unknown }[] | null));
  const expense = asRecord(firstJoin(visit.visit_expenses as Record<string, unknown> | Record<string, unknown>[] | null));
  const behaviorValues = [
    visit.travel_companion_id,
    visit.group_size,
    visit.transport_mode_id,
    visit.travel_purpose_id,
    visit.overnight_status,
    visit.nights,
  ];
  const expenseValues = [expense.expense_category_id, expense.spending_range_id, expense.estimated_amount];
  const satisfactionValues = [
    row.overall_score,
    row.facility_score,
    row.cleanliness_score,
    row.safety_score,
    row.accessibility_score,
    row.information_score,
    row.value_score,
    row.revisit_intention,
    row.recommend_intention,
  ];
  const hasValue = (value: unknown) => value !== null && value !== undefined && value !== "";
  const hasComment = typeof row.comments === "string" && row.comments.trim().length > 0;

  return {
    survey_id: stringValue(row.survey_id),
    visit_id: stringValue(row.visit_id),
    tourist_id: stringValue(row.tourist_id),
    overall_score: nullableNumber(row.overall_score),
    facility_score: nullableNumber(row.facility_score),
    cleanliness_score: nullableNumber(row.cleanliness_score),
    safety_score: nullableNumber(row.safety_score),
    accessibility_score: nullableNumber(row.accessibility_score),
    information_score: nullableNumber(row.information_score),
    value_score: nullableNumber(row.value_score),
    revisit_intention: nullableString(row.revisit_intention),
    recommend_intention: nullableString(row.recommend_intention),
    comments: nullableString(row.comments),
    submitted_at: stringValue(row.submitted_at),
    completed_at: nullableString(row.completed_at),
    tourist_display_name: nullableString(tourist.display_name),
    attraction_name_th: nullableString(attraction.name_th),
    province_name_th: nullableString(province.province_name_th),
    has_travel_behavior: behaviorValues.some(hasValue),
    has_expense: expenseValues.some(hasValue),
    has_satisfaction: satisfactionValues.some(hasValue),
    has_comment: hasComment,
    answered_field_count:
      behaviorValues.filter(hasValue).length +
      expenseValues.filter(hasValue).length +
      satisfactionValues.filter(hasValue).length +
      (hasComment ? 1 : 0),
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
       accessibility_score, information_score, value_score,
       revisit_intention, recommend_intention, comments, submitted_at, completed_at,
       tourists!inner (display_name),
       visits!inner (attraction_id, travel_companion_id, group_size, transport_mode_id, travel_purpose_id,
         overnight_status, nights, visit_expenses (expense_category_id, spending_range_id, estimated_amount),
         attractions!inner (name_th, province_id, provinces (province_name_th)))`,
      { count: "exact" }
    )
    .order("submitted_at", { ascending: false })
    .range(from, to);

  if (filters.minScore) query = query.gte("overall_score", filters.minScore);
  if (filters.maxScore) query = query.lte("overall_score", filters.maxScore);
  if (filters.search) {
    const search = filters.search.replace(/[\\%_]/g, "\\$&");
    query = query.ilike("tourists.display_name", `%${search}%`);
  }
  if (filters.attractionId) query = query.eq("visits.attraction_id", filters.attractionId);
  if (filters.provinceId) query = query.eq("visits.attractions.province_id", filters.provinceId);
  if (filters.dateFrom) query = query.gte("submitted_at", `${filters.dateFrom}T00:00:00.000Z`);
  if (filters.dateTo) query = query.lte("submitted_at", `${filters.dateTo}T23:59:59.999Z`);

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
       accessibility_score, information_score, value_score,
       revisit_intention, recommend_intention, comments, submitted_at, completed_at,
       tourists!inner (display_name),
       visits!inner (attraction_id, travel_companion_id, group_size, transport_mode_id, travel_purpose_id,
         overnight_status, nights, visit_expenses (expense_category_id, spending_range_id, estimated_amount),
         attractions!inner (name_th, province_id, provinces (province_name_th)))`
    )
    .order("submitted_at", { ascending: false });

  if (filters.minScore) query = query.gte("overall_score", filters.minScore);
  if (filters.maxScore) query = query.lte("overall_score", filters.maxScore);
  if (filters.search) {
    const search = filters.search.replace(/[\\%_]/g, "\\$&");
    query = query.ilike("tourists.display_name", `%${search}%`);
  }
  if (filters.attractionId) query = query.eq("visits.attraction_id", filters.attractionId);
  if (filters.provinceId) query = query.eq("visits.attractions.province_id", filters.provinceId);
  if (filters.dateFrom) query = query.gte("submitted_at", `${filters.dateFrom}T00:00:00.000Z`);
  if (filters.dateTo) query = query.lte("submitted_at", `${filters.dateTo}T23:59:59.999Z`);
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
    accessibility_score: row.accessibility_score,
    information_score: row.information_score,
    value_score: row.value_score,
    revisit_intention: row.revisit_intention,
    recommend_intention: row.recommend_intention,
    completed_at: row.completed_at
  }));
}
