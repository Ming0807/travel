import "server-only";

import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { listLiveDestinationProvinceIds } from "@/lib/repositories/destination-scope.repository";
import { asRecord, nullableNumber, nullableString, numberValue, stringValue } from "@/lib/utils/record";
import type { AttractionAnalyticsFilters } from "@/lib/validation/attraction-analytics";

export type AttractionAnalyticsOption = { value: number; label: string };
export type AttractionCheckinOption = { checkinCodeId: number; code: string; label: string; campaignId: number | null };

export type AttractionAnalyticsRows = {
  attraction: { attractionId: number; nameTh: string; districtNameTh: string | null };
  attractions: AttractionAnalyticsOption[];
  checkinCodes: AttractionCheckinOption[];
  visits: Record<string, unknown>[];
  funnelEvents: Record<string, unknown>[];
  peerVisits: Record<string, unknown>[];
  truncated: boolean;
};

export const ATTRACTION_ANALYTICS_VISIT_LIMIT = 5000;
export const ATTRACTION_ANALYTICS_FUNNEL_LIMIT = 10000;

export async function listAttractionAnalyticsOptions(): Promise<AttractionAnalyticsOption[]> {
  const liveProvinceIds = await listLiveDestinationProvinceIds();
  if (liveProvinceIds.length === 0) return [];
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase.from("attractions").select("attraction_id, name_th").eq("is_active", true).in("province_id", liveProvinceIds).order("name_th").limit(500);
  if (error) throw new Error("ATTRACTION_ANALYTICS_OPTIONS_FAILED");
  return (data ?? []).map((raw) => {
    const row = asRecord(raw);
    return { value: numberValue(row.attraction_id), label: stringValue(row.name_th) };
  });
}

export async function getAttractionAnalyticsRows(filters: AttractionAnalyticsFilters): Promise<AttractionAnalyticsRows | null> {
  const liveProvinceIds = await listLiveDestinationProvinceIds();
  if (liveProvinceIds.length === 0) return null;
  const supabase = createSupabaseServiceRoleClient();
  const [{ data: attractionData, error: attractionError }, { data: attractionOptions, error: optionsError }, { data: codeData, error: codeError }] = await Promise.all([
    supabase.from("attractions").select("attraction_id, name_th, districts(district_name_th)").eq("attraction_id", filters.attractionId).in("province_id", liveProvinceIds).maybeSingle(),
    supabase.from("attractions").select("attraction_id, name_th").eq("is_active", true).in("province_id", liveProvinceIds).order("name_th").limit(500),
    supabase.from("checkin_codes").select("checkin_code_id, code, label, campaign_id").eq("attraction_id", filters.attractionId).order("code").limit(500),
  ]);
  if (attractionError || optionsError || codeError) throw new Error("ATTRACTION_ANALYTICS_REFERENCE_FAILED");
  if (!attractionData) return null;

  const checkinCodes = (codeData ?? []).map((raw) => {
    const row = asRecord(raw);
    return {
      checkinCodeId: numberValue(row.checkin_code_id),
      code: stringValue(row.code),
      label: nullableString(row.label) ?? stringValue(row.code),
      campaignId: nullableNumber(row.campaign_id),
    };
  });
  let allowedCodeIds: number[] | null = null;
  if (filters.campaignId) allowedCodeIds = checkinCodes.filter((code) => code.campaignId === filters.campaignId).map((code) => code.checkinCodeId);
  if (filters.checkinCodeId) {
    allowedCodeIds = allowedCodeIds === null
      ? [filters.checkinCodeId]
      : allowedCodeIds.filter((checkinCodeId) => checkinCodeId === filters.checkinCodeId);
  }

  let visitQuery = supabase
    .from("visits")
    .select(`
      visit_id, tourist_id, attraction_id, checkin_code_id, visit_date, completion_status,
      group_size, overnight_status, nights, entry_channel,
      tourists(age_group, preferred_language, countries(country_name_th), provinces(province_name_th)),
      travel_companions(name_th), transport_modes(name_th), travel_purposes(name_th),
      visit_photos(photo_id), certificates(certificate_id), tourist_stamps(stamp_id, status),
      visit_expenses(visit_id, expense_categories(name_th), spending_ranges(range_label_th)),
      satisfaction_surveys(overall_score, facility_score, cleanliness_score, safety_score, accessibility_score, information_score, value_score, revisit_intention, recommend_intention, comments),
      research_sessions(collection_mode, status, inclusion_status, research_studies(study_kind), research_responses(status))
    `)
    .eq("attraction_id", filters.attractionId)
    .gte("visit_date", filters.dateFrom)
    .lte("visit_date", filters.dateTo)
    .order("visit_date", { ascending: true })
    .limit(ATTRACTION_ANALYTICS_VISIT_LIMIT + 1);
  if (filters.entryChannel) visitQuery = visitQuery.eq("entry_channel", filters.entryChannel);
  if (allowedCodeIds !== null) {
    if (allowedCodeIds.length === 0) {
      visitQuery = visitQuery.eq("checkin_code_id", -1);
    } else {
      visitQuery = visitQuery.in("checkin_code_id", allowedCodeIds);
    }
  }
  const [{ data: visitData, error: visitError }, peerResult] = await Promise.all([
    visitQuery,
    allowedCodeIds === null && !filters.entryChannel
      ? supabase.from("visits").select("visit_id, tourist_id, attraction_id, attractions!inner(province_id), research_sessions(collection_mode, status, inclusion_status, research_studies(study_kind)), satisfaction_surveys(overall_score)").in("attractions.province_id", liveProvinceIds).gte("visit_date", filters.dateFrom).lte("visit_date", filters.dateTo).limit(ATTRACTION_ANALYTICS_VISIT_LIMIT + 1)
      : Promise.resolve({ data: [], error: null }),
  ]);
  if (visitError) throw new Error("ATTRACTION_ANALYTICS_VISITS_FAILED");
  if (peerResult.error) throw new Error("ATTRACTION_ANALYTICS_PEERS_FAILED");

  const funnelCodeIds = allowedCodeIds ?? checkinCodes.map((code) => code.checkinCodeId);
  let funnelEvents: Record<string, unknown>[] = [];
  let funnelTruncated = false;
  if (funnelCodeIds.length > 0) {
    const { data, error } = await supabase
      .from("funnel_events")
      .select("event_id, visit_id, checkin_code_id, research_session_id, event_type, event_time, metadata")
      .in("checkin_code_id", funnelCodeIds)
      .gte("event_time", `${filters.dateFrom}T00:00:00+07:00`)
      .lte("event_time", `${filters.dateTo}T23:59:59.999+07:00`)
      .order("event_time", { ascending: true })
      .limit(ATTRACTION_ANALYTICS_FUNNEL_LIMIT + 1);
    if (error) throw new Error("ATTRACTION_ANALYTICS_FUNNEL_FAILED");
    funnelTruncated = (data?.length ?? 0) > ATTRACTION_ANALYTICS_FUNNEL_LIMIT;
    funnelEvents = (data ?? []).slice(0, ATTRACTION_ANALYTICS_FUNNEL_LIMIT).map(asRecord);
  }

  const attraction = asRecord(attractionData);
  const district = Array.isArray(attraction.districts) ? asRecord(attraction.districts[0]) : asRecord(attraction.districts);
  return {
    attraction: {
      attractionId: numberValue(attraction.attraction_id),
      nameTh: stringValue(attraction.name_th),
      districtNameTh: nullableString(district.district_name_th),
    },
    attractions: (attractionOptions ?? []).map((raw) => {
      const row = asRecord(raw);
      return { value: numberValue(row.attraction_id), label: stringValue(row.name_th) };
    }),
    checkinCodes,
    visits: (visitData ?? []).slice(0, ATTRACTION_ANALYTICS_VISIT_LIMIT).map(asRecord),
    funnelEvents,
    peerVisits: (peerResult.data ?? []).slice(0, ATTRACTION_ANALYTICS_VISIT_LIMIT).map(asRecord),
    truncated: (visitData?.length ?? 0) > ATTRACTION_ANALYTICS_VISIT_LIMIT || (peerResult.data?.length ?? 0) > ATTRACTION_ANALYTICS_VISIT_LIMIT || funnelTruncated,
  };
}
