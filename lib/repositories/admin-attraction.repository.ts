import "server-only";

import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import type { AdminAttractionFilters, AdminAttractionMutationInput } from "@/lib/validation/admin-attraction";

export type AdminAttractionRow = {
  attraction_id: number;
  province_id: number;
  district_id: number | null;
  attraction_type_id: number | null;
  slug: string;
  name_th: string;
  name_en: string | null;
  short_description_th: string | null;
  short_description_en: string | null;
  description_th: string | null;
  description_en: string | null;
  history_th: string | null;
  history_en: string | null;
  latitude: number | null;
  longitude: number | null;
  address_text: string | null;
  opening_hours: string | null;
  contact_info: string | null;
  travel_tips_th: string | null;
  travel_tips_en: string | null;
  how_to_get_there_th: string | null;
  how_to_get_there_en: string | null;
  custom_sections_json: any | null;
  sustainability_category: string | null;
  estimated_capacity_per_day: number | null;
  is_published: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
  province_name_th: string | null;
  district_name_th: string | null;
  attraction_type_name_th: string | null;
  photo_spot_count: number;
  checkin_code_count: number;
};

export type PaginatedResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapAttraction(row: any, photoSpotCounts = new Map<number, number>(), checkinCodeCounts = new Map<number, number>()): AdminAttractionRow {
  const province = Array.isArray(row.provinces) ? row.provinces[0] : row.provinces;
  const district = Array.isArray(row.districts) ? row.districts[0] : row.districts;
  const attractionType = Array.isArray(row.attraction_types) ? row.attraction_types[0] : row.attraction_types;

  return {
    attraction_id: Number(row.attraction_id),
    province_id: Number(row.province_id),
    district_id: row.district_id === null ? null : Number(row.district_id),
    attraction_type_id: row.attraction_type_id === null ? null : Number(row.attraction_type_id),
    slug: row.slug,
    name_th: row.name_th,
    name_en: row.name_en,
    short_description_th: row.short_description_th,
    short_description_en: row.short_description_en,
    description_th: row.description_th,
    description_en: row.description_en,
    history_th: row.history_th,
    history_en: row.history_en,
    latitude: row.latitude === null ? null : Number(row.latitude),
    longitude: row.longitude === null ? null : Number(row.longitude),
    address_text: row.address_text,
    opening_hours: row.opening_hours,
    contact_info: row.contact_info,
    travel_tips_th: row.travel_tips_th,
    travel_tips_en: row.travel_tips_en,
    how_to_get_there_th: row.how_to_get_there_th,
    how_to_get_there_en: row.how_to_get_there_en,
    custom_sections_json: row.custom_sections_json,
    sustainability_category: row.sustainability_category,
    estimated_capacity_per_day: row.estimated_capacity_per_day,
    is_published: row.is_published,
    is_active: row.is_active,
    created_at: row.created_at,
    updated_at: row.updated_at,
    province_name_th: province?.province_name_th ?? null,
    district_name_th: district?.district_name_th ?? null,
    attraction_type_name_th: attractionType?.type_name_th ?? null,
    photo_spot_count: photoSpotCounts.get(Number(row.attraction_id)) ?? 0,
    checkin_code_count: checkinCodeCounts.get(Number(row.attraction_id)) ?? 0
  };
}

function toPayload(input: AdminAttractionMutationInput) {
  return {
    province_id: input.provinceId,
    district_id: input.districtId,
    attraction_type_id: input.attractionTypeId,
    slug: input.slug,
    name_th: input.nameTh,
    name_en: input.nameEn,
    short_description_th: input.shortDescriptionTh,
    short_description_en: input.shortDescriptionEn,
    description_th: input.descriptionTh,
    description_en: input.descriptionEn,
    history_th: input.historyTh,
    history_en: input.historyEn,
    latitude: input.latitude,
    longitude: input.longitude,
    address_text: input.addressText,
    opening_hours: input.openingHours,
    contact_info: input.contactInfo,
    travel_tips_th: input.travelTipsTh,
    travel_tips_en: input.travelTipsEn,
    how_to_get_there_th: input.howToGetThereTh,
    how_to_get_there_en: input.howToGetThereEn,
    custom_sections_json: input.customSectionsJson,
    sustainability_category: input.sustainabilityCategory,
    estimated_capacity_per_day: input.estimatedCapacityPerDay,
    is_published: input.isPublished,
    is_active: input.isActive
  };
}

function countByAttraction(rows: { attraction_id: number }[]) {
  const counts = new Map<number, number>();
  rows.forEach((row) => counts.set(Number(row.attraction_id), (counts.get(Number(row.attraction_id)) ?? 0) + 1));
  return counts;
}

async function getRelatedCounts(attractionIds: number[]) {
  if (attractionIds.length === 0) {
    return {
      photoSpotCounts: new Map<number, number>(),
      checkinCodeCounts: new Map<number, number>()
    };
  }

  const supabase = createSupabaseServiceRoleClient();
  const [photoSpots, checkinCodes] = await Promise.all([
    supabase.from("photo_spots").select("attraction_id").in("attraction_id", attractionIds),
    supabase.from("checkin_codes").select("attraction_id").in("attraction_id", attractionIds)
  ]);

  if (photoSpots.error || checkinCodes.error) {
    throw new Error("ADMIN_ATTRACTION_COUNT_FAILED");
  }

  return {
    photoSpotCounts: countByAttraction(photoSpots.data ?? []),
    checkinCodeCounts: countByAttraction(checkinCodes.data ?? [])
  };
}

export async function listAdminAttractions(filters: AdminAttractionFilters): Promise<PaginatedResult<AdminAttractionRow>> {
  const supabase = createSupabaseServiceRoleClient();
  const from = (filters.page - 1) * filters.pageSize;
  const to = from + filters.pageSize - 1;

  let query = supabase
    .from("attractions")
    .select(
      `
        *,
        provinces (province_name_th),
        districts (district_name_th),
        attraction_types (type_name_th)
      `,
      { count: "exact" }
    )
    .order("updated_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (filters.search) {
    query = query.or(`name_th.ilike.%${filters.search}%,name_en.ilike.%${filters.search}%,slug.ilike.%${filters.search}%`);
  }
  if (filters.provinceId) query = query.eq("province_id", filters.provinceId);
  if (filters.districtId) query = query.eq("district_id", filters.districtId);
  if (filters.attractionTypeId) query = query.eq("attraction_type_id", filters.attractionTypeId);
  if (filters.isPublished !== undefined) query = query.eq("is_published", filters.isPublished);
  if (filters.isActive !== undefined) query = query.eq("is_active", filters.isActive);

  const { data, error, count } = await query;

  if (error) {
    throw new Error("ADMIN_ATTRACTION_LIST_FAILED");
  }

  const attractionIds = (data ?? []).map((row) => Number(row.attraction_id));
  const { photoSpotCounts, checkinCodeCounts } = await getRelatedCounts(attractionIds);

  return {
    items: (data ?? []).map((row) => mapAttraction(row, photoSpotCounts, checkinCodeCounts)),
    total: count ?? 0,
    page: filters.page,
    pageSize: filters.pageSize
  };
}

export async function getAdminAttractionById(attractionId: number): Promise<AdminAttractionRow | null> {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("attractions")
    .select(
      `
        *,
        provinces (province_name_th),
        districts (district_name_th),
        attraction_types (type_name_th)
      `
    )
    .eq("attraction_id", attractionId)
    .maybeSingle();

  if (error) {
    throw new Error("ADMIN_ATTRACTION_READ_FAILED");
  }

  if (!data) return null;

  const { photoSpotCounts, checkinCodeCounts } = await getRelatedCounts([attractionId]);
  return mapAttraction(data, photoSpotCounts, checkinCodeCounts);
}

export async function findAttractionBySlug(slug: string, excludeAttractionId?: number) {
  const supabase = createSupabaseServiceRoleClient();
  let query = supabase.from("attractions").select("attraction_id").eq("slug", slug).limit(1);
  if (excludeAttractionId) query = query.neq("attraction_id", excludeAttractionId);

  const { data, error } = await query.maybeSingle();
  if (error) {
    throw new Error("ADMIN_ATTRACTION_READ_FAILED");
  }

  return data ? Number(data.attraction_id) : null;
}

export async function createAdminAttraction(input: AdminAttractionMutationInput): Promise<AdminAttractionRow> {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("attractions")
    .insert(toPayload(input))
    .select("*")
    .single();

  if (error) {
    throw new Error(error.code === "23505" ? "DUPLICATE_SLUG" : "ADMIN_ATTRACTION_CREATE_FAILED");
  }

  return mapAttraction(data);
}

export async function updateAdminAttraction(attractionId: number, input: AdminAttractionMutationInput): Promise<AdminAttractionRow> {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("attractions")
    .update(toPayload(input))
    .eq("attraction_id", attractionId)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.code === "23505" ? "DUPLICATE_SLUG" : "ADMIN_ATTRACTION_UPDATE_FAILED");
  }

  return mapAttraction(data);
}

export async function updateAdminAttractionStatus(
  attractionId: number,
  patch: { is_published?: boolean; is_active?: boolean }
): Promise<AdminAttractionRow> {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("attractions")
    .update(patch)
    .eq("attraction_id", attractionId)
    .select("*")
    .single();

  if (error) {
    throw new Error("ADMIN_ATTRACTION_UPDATE_FAILED");
  }

  return mapAttraction(data);
}

export async function deleteAdminAttraction(attractionId: number): Promise<void> {
  const supabase = createSupabaseServiceRoleClient();
  const { error } = await supabase
    .from("attractions")
    .delete()
    .eq("attraction_id", attractionId);

  if (error) {
    throw new Error("ADMIN_ATTRACTION_DELETE_FAILED");
  }
}

export async function getAdminProvinces() {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase.from("provinces").select("province_id, province_name_th").order("province_name_th");
  if (error) throw new Error("FAILED_TO_FETCH_PROVINCES");
  return data;
}

export async function getAdminAttractionTypes() {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase.from("attraction_types").select("attraction_type_id, type_name_th").order("type_name_th");
  if (error) throw new Error("FAILED_TO_FETCH_ATTRACTION_TYPES");
  return data;
}

export async function getAdminDistricts() {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("districts")
    .select("district_id, province_id, district_name_th")
    .order("district_name_th");
  if (error) throw new Error("FAILED_TO_FETCH_DISTRICTS");
  return data;
}

export async function getAdminAttractionsList() {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("attractions")
    .select("attraction_id, name_th, is_active, is_published")
    .order("name_th");
  if (error) throw new Error("ADMIN_ATTRACTIONS_LIST_FAILED");
  return data || [];
}

export async function getAdminPhotoSpotsList() {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("photo_spots")
    .select("photo_spot_id, attraction_id, spot_name_th")
    .order("spot_name_th");
  if (error) throw new Error("ADMIN_PHOTO_SPOTS_LIST_FAILED");
  return data || [];
}

export async function getAdminAttractionRelatedContent(attractionId: number) {
  const supabase = createSupabaseServiceRoleClient();
  const [attractions, restaurants, accommodations, stories] = await Promise.all([
    supabase.from("attraction_related_attractions").select("*").eq("attraction_id", attractionId).order("display_order"),
    supabase.from("attraction_related_restaurants").select("*").eq("attraction_id", attractionId).order("display_order"),
    supabase.from("attraction_related_accommodations").select("*").eq("attraction_id", attractionId).order("display_order"),
    supabase.from("attraction_related_stories").select("*").eq("attraction_id", attractionId).order("display_order")
  ]);

  return {
    attractions: attractions.data || [],
    restaurants: restaurants.data || [],
    accommodations: accommodations.data || [],
    stories: stories.data || []
  };
}

export async function updateAdminAttractionRelatedContent(attractionId: number, type: 'attractions' | 'restaurants' | 'accommodations' | 'stories', relatedIds: number[]) {
  const supabase = createSupabaseServiceRoleClient();
  const table = `attraction_related_${type}`;
  const idColumn = type === 'attractions' ? 'related_attraction_id' : type === 'restaurants' ? 'restaurant_id' : type === 'accommodations' ? 'accommodation_id' : 'story_id';

  // Delete existing
  const { error: deleteError } = await supabase.from(table).delete().eq("attraction_id", attractionId);
  if (deleteError) throw new Error("ADMIN_ATTRACTION_RELATED_UPDATE_FAILED");

  // Insert new
  if (relatedIds.length > 0) {
    const payload = relatedIds.map((id, index) => ({
      attraction_id: attractionId,
      [idColumn]: id,
      display_order: index + 1
    }));
    const { error: insertError } = await supabase.from(table).insert(payload);
    if (insertError) throw new Error("ADMIN_ATTRACTION_RELATED_UPDATE_FAILED");
  }
}

export async function getAdminAllContentList() {
  const supabase = createSupabaseServiceRoleClient();
  const [attractions, restaurants, stories] = await Promise.all([
    supabase.from("attractions").select("attraction_id, name_th, province_id, provinces(province_name_th)").eq("is_published", true),
    supabase.from("restaurants").select("restaurant_id, name_th, province_id, provinces(province_name_th)").eq("is_published", true),
    supabase.from("travel_stories").select("story_id, title").eq("is_published", true)
  ]);

  // Note: accommodations won't work locally since migration failed, but we query it safely if it exists.
  // Actually, we'll skip accommodations for now to prevent 500 errors in this function if the table is missing,
  // or we can use maybeSingle/error catching. Let's just catch it.

  let accommodationsList: any[] = [];
  try {
    const { data } = await supabase.from("accommodations").select("accommodation_id, name_th, province_id, provinces(province_name_th)").eq("is_published", true);
    accommodationsList = data || [];
  } catch (e) {
    // Ignore if table missing
  }

  const getProvinceName = (p: any) => Array.isArray(p) ? p[0]?.province_name_th : p?.province_name_th;

  return {
    attractions: (attractions.data || []).map(a => ({ id: a.attraction_id, name: a.name_th, province: getProvinceName(a.provinces) })),
    restaurants: (restaurants.data || []).map(r => ({ id: r.restaurant_id, name: r.name_th, province: getProvinceName(r.provinces) })),
    accommodations: accommodationsList.map(a => ({ id: a.accommodation_id, name: a.name_th, province: getProvinceName(a.provinces) })),
    stories: (stories.data || []).map(s => ({ id: s.story_id, name: s.title }))
  };
}
