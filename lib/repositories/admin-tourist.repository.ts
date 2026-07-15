import "server-only";

import { createHash } from "node:crypto";
import type { PaginatedResult } from "@/lib/repositories/admin-attraction.repository";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { firstJoin } from "@/lib/utils/supabase-joins";
import { asRecord, nullableNumber, nullableString, numberValue, stringValue } from "@/lib/utils/record";
import type { AdminTouristFilters } from "@/lib/validation/admin-tourist";

export type AdminTouristListRow = {
  id: string;
  reference: string;
  displayName: string;
  countryName: string | null;
  provinceName: string | null;
  ageGroup: string | null;
  joinedAt: string;
  identityProviders: string[];
  visitCount: number;
  certificateCount: number;
  stampCount: number;
  surveyCount: number;
};

export type AdminTouristExportRow = {
  "รหัสอ้างอิง": string;
  "ประเทศ": string;
  "จังหวัด": string;
  "ช่วงอายุ": string;
  "ช่องทางบัญชี": string;
  "จำนวนการเยี่ยมชม": number;
  "จำนวนประกาศนียบัตร": number;
  "จำนวนตราประทับ": number;
  "จำนวนแบบสำรวจ": number;
  "เดือนที่ลงทะเบียน": string;
};

export type AdminTouristVisitHistory = {
  visitId: string;
  visitDate: string;
  visitedAt: string | null;
  createdAt: string;
  completionStatus: string;
  attractionName: string | null;
  attractionProvince: string | null;
  photoSpotName: string | null;
  checkinLabel: string | null;
  certificates: Array<{ generatedAt: string; downloadCount: number }>;
  survey: {
    surveyId: string;
    overallScore: number | null;
    facilityScore: number | null;
    cleanlinessScore: number | null;
    safetyScore: number | null;
    accessibilityScore: number | null;
    informationScore: number | null;
    valueScore: number | null;
    submittedAt: string;
  } | null;
};

export type AdminTouristStampHistory = {
  attractionName: string | null;
  stampName: string | null;
  earnedAt: string;
  status: string;
};

export type AdminTouristDetail = {
  id: string;
  reference: string;
  displayName: string;
  countryName: string | null;
  provinceName: string | null;
  ageGroup: string | null;
  preferredLanguage: string | null;
  profileCompletedAt: string | null;
  createdAt: string;
  updatedAt: string | null;
  identityProviders: string[];
  totals: {
    visits: number;
    certificates: number;
    stamps: number;
    surveys: number;
  };
  recentVisits: AdminTouristVisitHistory[];
  recentStamps: AdminTouristStampHistory[];
};

type CountMaps = {
  identities: Map<string, Set<string>>;
  visits: Map<string, number>;
  certificates: Map<string, number>;
  stamps: Map<string, number>;
  surveys: Map<string, number>;
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function increment(map: Map<string, number>, key: string): void {
  map.set(key, (map.get(key) ?? 0) + 1);
}

function referenceFor(touristId: string): string {
  const digest = createHash("sha256").update(touristId).digest("hex").slice(0, 10).toUpperCase();
  return `T-${digest}`;
}

function relationRecord(value: unknown): Record<string, unknown> {
  return asRecord(firstJoin(value as Record<string, unknown> | Record<string, unknown>[] | null));
}

function mapListRow(rawRow: unknown, counts: CountMaps): AdminTouristListRow {
  const row = asRecord(rawRow);
  const touristId = stringValue(row.tourist_id);
  const country = relationRecord(row.countries);
  const province = relationRecord(row.provinces);

  return {
    id: touristId,
    reference: referenceFor(touristId),
    displayName: nullableString(row.display_name) ?? "ผู้ใช้งานแบบผู้เยี่ยมชม",
    countryName: nullableString(country.country_name_th) ?? nullableString(country.country_name_en),
    provinceName: nullableString(province.province_name_th) ?? nullableString(province.province_name_en),
    ageGroup: nullableString(row.age_group),
    joinedAt: stringValue(row.created_at),
    identityProviders: Array.from(counts.identities.get(touristId) ?? []).sort(),
    visitCount: counts.visits.get(touristId) ?? 0,
    certificateCount: counts.certificates.get(touristId) ?? 0,
    stampCount: counts.stamps.get(touristId) ?? 0,
    surveyCount: counts.surveys.get(touristId) ?? 0,
  };
}

function summarizeIdentityProviders(providers: string[]): string {
  const uniqueProviders = new Set(providers);
  if (uniqueProviders.size === 0) return "unknown";
  if (uniqueProviders.size > 1) return "multiple";
  if (uniqueProviders.has("anonymous_device")) return "guest_only";
  if (uniqueProviders.has("line")) return "line_linked";
  if (uniqueProviders.has("email")) return "email_linked";
  if (uniqueProviders.has("google") || uniqueProviders.has("google_optional")) return "google_linked";
  return "linked";
}

type FilterableTouristQuery<T> = {
  eq(column: string, value: unknown): T;
  ilike(column: string, pattern: string): T;
  order(column: string, options: { ascending: boolean }): T;
};

function applyTouristFiltersAndSort<T extends FilterableTouristQuery<T>>(
  query: T,
  filters: Omit<AdminTouristFilters, "page" | "pageSize">
): T {
  let filteredQuery = query;
  if (filters.search) {
    filteredQuery = UUID_PATTERN.test(filters.search)
      ? filteredQuery.eq("tourist_id", filters.search)
      : filteredQuery.ilike("display_name", `%${filters.search.replace(/%/g, "\\%").replace(/_/g, "\\_")}%`);
  }
  if (filters.countryId) filteredQuery = filteredQuery.eq("origin_country_id", filters.countryId);
  if (filters.provinceId) filteredQuery = filteredQuery.eq("origin_province_id", filters.provinceId);
  if (filters.provider) filteredQuery = filteredQuery.eq("tourist_identities.provider", filters.provider);

  if (filters.sort === "name_asc" || filters.sort === "name_desc") {
    return filteredQuery.order("display_name", { ascending: filters.sort === "name_asc" });
  }
  return filteredQuery.order("created_at", { ascending: filters.sort === "oldest" });
}

async function loadPageCounts(touristIds: string[]): Promise<CountMaps> {
  const empty: CountMaps = {
    identities: new Map(),
    visits: new Map(),
    certificates: new Map(),
    stamps: new Map(),
    surveys: new Map(),
  };
  if (touristIds.length === 0) return empty;

  const supabase = createSupabaseServiceRoleClient();
  const visitToTourist = new Map<string, string>();
  const batchSize = 200;

  for (let index = 0; index < touristIds.length; index += batchSize) {
    const batch = touristIds.slice(index, index + batchSize);
    const [identityResult, visitResult, stampResult, surveyResult] = await Promise.all([
      supabase.from("tourist_identities").select("tourist_id, provider").in("tourist_id", batch),
      supabase.from("visits").select("visit_id, tourist_id").in("tourist_id", batch),
      supabase.from("tourist_stamps").select("tourist_id").in("tourist_id", batch),
      supabase.from("satisfaction_surveys").select("tourist_id").in("tourist_id", batch),
    ]);

    if (identityResult.error || visitResult.error || stampResult.error || surveyResult.error) {
      throw new Error("ADMIN_TOURIST_SUMMARY_FAILED");
    }

    for (const raw of identityResult.data ?? []) {
      const row = asRecord(raw);
      const touristId = stringValue(row.tourist_id);
      const provider = nullableString(row.provider);
      if (!provider) continue;
      const providers = empty.identities.get(touristId) ?? new Set<string>();
      providers.add(provider);
      empty.identities.set(touristId, providers);
    }

    for (const raw of visitResult.data ?? []) {
      const row = asRecord(raw);
      const touristId = stringValue(row.tourist_id);
      const visitId = stringValue(row.visit_id);
      increment(empty.visits, touristId);
      visitToTourist.set(visitId, touristId);
    }

    for (const raw of stampResult.data ?? []) increment(empty.stamps, stringValue(asRecord(raw).tourist_id));
    for (const raw of surveyResult.data ?? []) increment(empty.surveys, stringValue(asRecord(raw).tourist_id));
  }

  const visitIds = Array.from(visitToTourist.keys());
  for (let index = 0; index < visitIds.length; index += batchSize) {
    const certificateResult = await supabase
      .from("certificates")
      .select("visit_id")
      .in("visit_id", visitIds.slice(index, index + batchSize));
    if (certificateResult.error) throw new Error("ADMIN_TOURIST_SUMMARY_FAILED");
    for (const raw of certificateResult.data ?? []) {
      const touristId = visitToTourist.get(stringValue(asRecord(raw).visit_id));
      if (touristId) increment(empty.certificates, touristId);
    }
  }

  return empty;
}

export async function listAdminTourists(
  filters: AdminTouristFilters
): Promise<PaginatedResult<AdminTouristListRow>> {
  const supabase = createSupabaseServiceRoleClient();
  const from = (filters.page - 1) * filters.pageSize;
  const to = from + filters.pageSize - 1;
  const identityJoin = filters.provider ? ", tourist_identities!inner(provider)" : "";

  let query = supabase
    .from("tourists")
    .select(
      `tourist_id, display_name, age_group, created_at,
       countries (country_name_th, country_name_en),
       provinces (province_name_th, province_name_en)${identityJoin}`,
      { count: "exact" }
    );

  query = applyTouristFiltersAndSort(query, filters);

  const { data, error, count } = await query.range(from, to);
  if (error) throw new Error("ADMIN_TOURIST_LIST_FAILED");

  const touristIds = (data ?? []).map((row) => stringValue(asRecord(row).tourist_id));
  const counts = await loadPageCounts(touristIds);

  return {
    items: (data ?? []).map((row) => mapListRow(row, counts)),
    total: count ?? 0,
    page: filters.page,
    pageSize: filters.pageSize,
  };
}

export async function exportAdminTourists(
  filters: Omit<AdminTouristFilters, "page" | "pageSize">,
  limit: number
): Promise<AdminTouristListRow[]> {
  const supabase = createSupabaseServiceRoleClient();
  const identityJoin = filters.provider ? ", tourist_identities!inner(provider)" : "";
  let query = supabase
    .from("tourists")
    .select(
      `tourist_id, display_name, age_group, created_at,
       countries (country_name_th, country_name_en),
       provinces (province_name_th, province_name_en)${identityJoin}`
    );

  query = applyTouristFiltersAndSort(query, filters);
  const { data, error } = await query.limit(limit);
  if (error) throw new Error("ADMIN_TOURIST_EXPORT_FAILED");

  const exportRows = data ?? [];
  if (exportRows.length >= limit) {
    const emptyCounts: CountMaps = {
      identities: new Map(),
      visits: new Map(),
      certificates: new Map(),
      stamps: new Map(),
      surveys: new Map(),
    };
    return exportRows.map((row) => mapListRow(row, emptyCounts));
  }

  const touristIds = exportRows.map((row) => stringValue(asRecord(row).tourist_id));
  const counts = await loadPageCounts(touristIds);
  return exportRows.map((row) => mapListRow(row, counts));
}

export function toSafeTouristExportRows(rows: AdminTouristListRow[]): AdminTouristExportRow[] {
  return rows.map((row) => ({
    "รหัสอ้างอิง": row.reference,
    "ประเทศ": row.countryName ?? "",
    "จังหวัด": row.provinceName ?? "",
    "ช่วงอายุ": row.ageGroup ?? "",
    "ช่องทางบัญชี": summarizeIdentityProviders(row.identityProviders),
    "จำนวนการเยี่ยมชม": row.visitCount,
    "จำนวนประกาศนียบัตร": row.certificateCount,
    "จำนวนตราประทับ": row.stampCount,
    "จำนวนแบบสำรวจ": row.surveyCount,
    "เดือนที่ลงทะเบียน": row.joinedAt.slice(0, 7),
  }));
}

function mapSurvey(rawValue: unknown): AdminTouristVisitHistory["survey"] {
  const raw = firstJoin(rawValue as Record<string, unknown> | Record<string, unknown>[] | null);
  if (!raw) return null;
  const row = asRecord(raw);
  return {
    surveyId: stringValue(row.survey_id),
    overallScore: nullableNumber(row.overall_score),
    facilityScore: nullableNumber(row.facility_score),
    cleanlinessScore: nullableNumber(row.cleanliness_score),
    safetyScore: nullableNumber(row.safety_score),
    accessibilityScore: nullableNumber(row.accessibility_score),
    informationScore: nullableNumber(row.information_score),
    valueScore: nullableNumber(row.value_score),
    submittedAt: stringValue(row.submitted_at),
  };
}

function mapVisitHistory(rawRow: unknown): AdminTouristVisitHistory {
  const row = asRecord(rawRow);
  const attraction = relationRecord(row.attractions);
  const province = relationRecord(attraction.provinces);
  const photoSpot = relationRecord(row.photo_spots);
  const checkinCode = relationRecord(row.checkin_codes);
  const certificates = Array.isArray(row.certificates) ? row.certificates : [];

  return {
    visitId: stringValue(row.visit_id),
    visitDate: stringValue(row.visit_date),
    visitedAt: nullableString(row.visited_at),
    createdAt: stringValue(row.created_at),
    completionStatus: stringValue(row.completion_status),
    attractionName: nullableString(attraction.name_th),
    attractionProvince: nullableString(province.province_name_th),
    photoSpotName: nullableString(photoSpot.spot_name_th),
    checkinLabel: nullableString(checkinCode.label),
    certificates: certificates.map((value) => {
      const certificate = asRecord(value);
      return {
        generatedAt: stringValue(certificate.generated_at),
        downloadCount: numberValue(certificate.download_count),
      };
    }),
    survey: mapSurvey(row.satisfaction_surveys),
  };
}

export async function getAdminTouristDetail(touristId: string): Promise<AdminTouristDetail | null> {
  const supabase = createSupabaseServiceRoleClient();
  const profileResult = await supabase
    .from("tourists")
    .select(
      `tourist_id, display_name, age_group, preferred_language, profile_completed_at, created_at, updated_at,
       countries (country_name_th, country_name_en),
       provinces (province_name_th, province_name_en),
       tourist_identities (provider)`
    )
    .eq("tourist_id", touristId)
    .maybeSingle();

  if (profileResult.error) throw new Error("ADMIN_TOURIST_DETAIL_FAILED");
  if (!profileResult.data) return null;

  const [visitsResult, stampsResult, visitCount, certificateCount, stampCount, surveyCount] = await Promise.all([
    supabase
      .from("visits")
      .select(
        `visit_id, visit_date, visited_at, created_at, completion_status,
         attractions (name_th, provinces (province_name_th)),
         photo_spots (spot_name_th),
         checkin_codes (label),
         certificates (generated_at, download_count),
         satisfaction_surveys (survey_id, overall_score, facility_score, cleanliness_score, safety_score,
           accessibility_score, information_score, value_score, submitted_at)`
      )
      .eq("tourist_id", touristId)
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("tourist_stamps")
      .select("earned_at, status, attractions (name_th), stamp_definitions (stamp_name_th)")
      .eq("tourist_id", touristId)
      .order("earned_at", { ascending: false })
      .limit(50),
    supabase.from("visits").select("visit_id", { count: "exact", head: true }).eq("tourist_id", touristId),
    supabase
      .from("certificates")
      .select("certificate_id, visits!inner(tourist_id)", { count: "exact", head: true })
      .eq("visits.tourist_id", touristId),
    supabase.from("tourist_stamps").select("stamp_id", { count: "exact", head: true }).eq("tourist_id", touristId),
    supabase.from("satisfaction_surveys").select("survey_id", { count: "exact", head: true }).eq("tourist_id", touristId),
  ]);

  if (
    visitsResult.error || stampsResult.error || visitCount.error || certificateCount.error ||
    stampCount.error || surveyCount.error
  ) {
    throw new Error("ADMIN_TOURIST_DETAIL_FAILED");
  }

  const profile = asRecord(profileResult.data);
  const country = relationRecord(profile.countries);
  const province = relationRecord(profile.provinces);
  const identities = Array.isArray(profile.tourist_identities) ? profile.tourist_identities : [];

  return {
    id: touristId,
    reference: referenceFor(touristId),
    displayName: nullableString(profile.display_name) ?? "ผู้ใช้งานแบบผู้เยี่ยมชม",
    countryName: nullableString(country.country_name_th) ?? nullableString(country.country_name_en),
    provinceName: nullableString(province.province_name_th) ?? nullableString(province.province_name_en),
    ageGroup: nullableString(profile.age_group),
    preferredLanguage: nullableString(profile.preferred_language),
    profileCompletedAt: nullableString(profile.profile_completed_at),
    createdAt: stringValue(profile.created_at),
    updatedAt: nullableString(profile.updated_at),
    identityProviders: Array.from(
      new Set(identities.map((value) => nullableString(asRecord(value).provider)).filter((value): value is string => Boolean(value)))
    ).sort(),
    totals: {
      visits: visitCount.count ?? 0,
      certificates: certificateCount.count ?? 0,
      stamps: stampCount.count ?? 0,
      surveys: surveyCount.count ?? 0,
    },
    recentVisits: (visitsResult.data ?? []).map(mapVisitHistory),
    recentStamps: (stampsResult.data ?? []).map((value) => {
      const row = asRecord(value);
      return {
        attractionName: nullableString(relationRecord(row.attractions).name_th),
        stampName: nullableString(relationRecord(row.stamp_definitions).stamp_name_th),
        earnedAt: stringValue(row.earned_at),
        status: stringValue(row.status),
      };
    }),
  };
}

export async function getAdminTouristFilterOptions() {
  const supabase = createSupabaseServiceRoleClient();
  const [countries, provinces] = await Promise.all([
    supabase.from("countries").select("country_id, country_name_th, country_name_en").order("country_name_th"),
    supabase.from("provinces").select("province_id, province_name_th, province_name_en").order("province_name_th"),
  ]);
  if (countries.error || provinces.error) throw new Error("ADMIN_TOURIST_FILTER_OPTIONS_FAILED");
  return { countries: countries.data ?? [], provinces: provinces.data ?? [] };
}
