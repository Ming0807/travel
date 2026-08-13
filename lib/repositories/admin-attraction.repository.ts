import "server-only";

import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import type { AdminAttractionFilters, AdminAttractionMutationInput } from "@/lib/validation/admin-attraction";
import type { Json } from "@/types/database";
import { firstJoin, type SupabaseJoin } from "@/lib/utils/supabase-joins";
import {
  assertLiveDestinationProvinceId,
  listLiveDestinationProvinceIds,
} from "@/lib/repositories/destination-scope.repository";
import { listAttractionIdsByType } from "@/lib/repositories/attraction-category.repository";
import {
  RELATED_CONTENT_MODES,
  RELATED_CONTENT_TYPES,
  type RelatedContentMode,
  type RelatedContentType,
} from "@/lib/content/attraction-related-content";

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
  custom_sections_json: Json | null;
  sustainability_category: string | null;
  estimated_capacity_per_day: number | null;
  is_published: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
  province_name_th: string | null;
  district_name_th: string | null;
  attraction_type_name_th: string | null;
  attraction_type_names_th: string[];
  photo_spot_count: number;
  checkin_code_count: number;
};

export type PaginatedResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

type AdminAttractionQueryRow = Omit<
  AdminAttractionRow,
  "province_name_th" | "district_name_th" | "attraction_type_name_th" | "photo_spot_count" | "checkin_code_count"
> & {
  provinces?: SupabaseJoin<{ province_name_th: string | null }>;
  districts?: SupabaseJoin<{ district_name_th: string | null }>;
  attraction_types?: SupabaseJoin<{ type_name_th: string | null }>;
  attraction_type_assignments?: Array<{
    is_primary: boolean;
    display_order: number;
    attraction_types?: SupabaseJoin<{ type_name_th: string | null }>;
  }>;
};

type ContentListProvince = { province_name_th: string | null };
type ContentListAttraction = { attraction_id: number; name_th: string; provinces?: SupabaseJoin<ContentListProvince> };
type ContentListRestaurant = { restaurant_id: number; name_th: string; provinces?: SupabaseJoin<ContentListProvince> };
type ContentListAccommodation = { accommodation_id: number; name_th: string; provinces?: SupabaseJoin<ContentListProvince> };
type ContentListStory = { story_id: number; title: string };

export type AdminRelatedContentSetting = {
  attractionId: number;
  contentType: RelatedContentType;
  mode: RelatedContentMode;
  maxItems: number;
};

export type RelatedContentSearchInput = {
  attractionId: number;
  contentType: RelatedContentType;
  query: string;
  page?: number;
  pageSize?: number;
};

export type AdminRelatedContentSearchItem = {
  id: number;
  name: string;
  slug: string;
  provinceName: string | null;
  status: "published";
  editHref: string;
};

export type AdminRelatedContentSearchResult = PaginatedResult<AdminRelatedContentSearchItem>;

export type AdminSelectedRelatedContentItem = {
  id: number;
  name: string | null;
  slug: string | null;
  provinceName: string | null;
  isPublished: boolean;
  isActive: boolean | null;
  status: "published" | "unavailable" | "missing";
  available: boolean;
  editHref: string;
};

export type UpdateAdminRelatedContentInput = {
  attractionId: number;
  contentType: RelatedContentType;
  mode: RelatedContentMode;
  maxItems: number;
  relatedIds: number[];
};

export type UpdateAdminRelatedContentResult = {
  attractionId: number;
  contentType: RelatedContentType;
  mode: RelatedContentMode;
  maxItems: number;
  curatedCount: number;
};

type RepositoryErrorLike = { code?: unknown; message?: unknown };

type QueryResponse<T> = {
  data: T[] | null;
  error: RepositoryErrorLike | null;
  count?: number | null;
};

type QueryBuilder<T> = PromiseLike<QueryResponse<T>> & {
  select: (columns: string, options?: { count?: "exact"; head?: boolean }) => QueryBuilder<T>;
  eq: (column: string, value: unknown) => QueryBuilder<T>;
  neq: (column: string, value: unknown) => QueryBuilder<T>;
  in: (column: string, values: readonly unknown[]) => QueryBuilder<T>;
  or: (filters: string) => QueryBuilder<T>;
  order: (column: string, options?: { ascending?: boolean; nullsFirst?: boolean }) => QueryBuilder<T>;
  range: (from: number, to: number) => QueryBuilder<T>;
};

type ProvinceRow = { province_name_th?: string | null; province_name_en?: string | null };

type RelatedAttractionRow = {
  attraction_id?: unknown;
  name_th?: unknown;
  name_en?: unknown;
  slug?: unknown;
  province_id?: unknown;
  is_published?: unknown;
  is_active?: unknown;
  provinces?: SupabaseJoin<ProvinceRow>;
};

type RelatedRestaurantRow = {
  restaurant_id?: unknown;
  name_th?: unknown;
  name_en?: unknown;
  slug?: unknown;
  province_id?: unknown;
  is_published?: unknown;
  is_active?: unknown;
  provinces?: SupabaseJoin<ProvinceRow>;
};

type RelatedAccommodationRow = {
  accommodation_id?: unknown;
  name_th?: unknown;
  name_en?: unknown;
  slug?: unknown;
  province_id?: unknown;
  is_published?: unknown;
  is_active?: unknown;
  provinces?: SupabaseJoin<ProvinceRow>;
};

type RelatedStoryRow = {
  story_id?: unknown;
  title?: unknown;
  slug?: unknown;
  province_id?: unknown;
  is_published?: unknown;
  status?: unknown;
  provinces?: SupabaseJoin<ProvinceRow>;
};

type RelatedSettingsRow = {
  attraction_id?: unknown;
  content_type?: unknown;
  mode?: unknown;
  max_items?: unknown;
};

const DEFAULT_RELATED_CONTENT_LIMITS: Record<RelatedContentType, number> = {
  attractions: 4,
  restaurants: 4,
  accommodations: 4,
  stories: 3,
};

function asQueryBuilder<T>(value: unknown): QueryBuilder<T> {
  return value as QueryBuilder<T>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function errorCode(error: RepositoryErrorLike | null): string | null {
  return typeof error?.code === "string" ? error.code : null;
}

function errorMessage(error: RepositoryErrorLike | null): string {
  return typeof error?.message === "string" ? error.message : "";
}

function isMissingRelatedSettingsTable(error: RepositoryErrorLike | null): boolean {
  const code = errorCode(error);
  const message = errorMessage(error).toLowerCase();
  return code === "42P01"
    || code === "PGRST205"
    || ((code === "PGRST204" || message.includes("schema cache")) && message.includes("attraction_related_content_settings"));
}

function isRelatedContentType(value: unknown): value is RelatedContentType {
  return typeof value === "string" && (RELATED_CONTENT_TYPES as readonly string[]).includes(value);
}

function isRelatedContentMode(value: unknown): value is RelatedContentMode {
  return typeof value === "string" && (RELATED_CONTENT_MODES as readonly string[]).includes(value);
}

function positiveInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0;
}

function nonNegativeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}

function normalizePage(value: number | undefined): number {
  return positiveInteger(value) ? value : 1;
}

function normalizePageSize(value: number | undefined): number {
  if (!positiveInteger(value)) return 20;
  return Math.min(20, value);
}

function escapeSearchPattern(value: string): string {
  return value.trim().replace(/[\\%_]/g, "\\$&").replace(/[,()]/g, " ");
}

function provinceName(value: SupabaseJoin<ProvinceRow> | undefined): string | null {
  const province = firstJoin(value);
  return province?.province_name_th ?? province?.province_name_en ?? null;
}

function publicName(thai: unknown, english: unknown, fallback: unknown = null): string | null {
  for (const value of [thai, english, fallback]) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

function publicSlug(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function editHref(contentType: RelatedContentType, id: number): string {
  const resource = contentType === "attractions"
    ? "attractions"
    : contentType === "restaurants"
      ? "restaurants"
      : contentType === "accommodations"
        ? "accommodations"
        : "stories";
  return `/admin/${resource}/${id}/edit`;
}

function parseSettingsRow(row: RelatedSettingsRow): AdminRelatedContentSetting | null {
  const attractionId = Number(row.attraction_id);
  const contentType = row.content_type;
  const mode = row.mode;
  const maxItems = Number(row.max_items);
  if (!positiveInteger(attractionId) || !isRelatedContentType(contentType) || !isRelatedContentMode(mode)) return null;
  if (!Number.isSafeInteger(maxItems) || maxItems < 1 || maxItems > 8) return null;
  return { attractionId, contentType, mode, maxItems };
}

function mapAttraction(row: AdminAttractionQueryRow, photoSpotCounts = new Map<number, number>(), checkinCodeCounts = new Map<number, number>()): AdminAttractionRow {
  const province = firstJoin(row.provinces);
  const district = firstJoin(row.districts);
  const attractionType = firstJoin(row.attraction_types);
  const assignedTypeNames = (row.attraction_type_assignments ?? [])
    .slice()
    .sort((left, right) => Number(right.is_primary) - Number(left.is_primary) || left.display_order - right.display_order)
    .map((assignment) => firstJoin(assignment.attraction_types)?.type_name_th ?? null)
    .filter((name): name is string => Boolean(name));
  const primaryTypeName = attractionType?.type_name_th ?? null;
  const attractionTypeNames = Array.from(new Set(
    assignedTypeNames.length > 0 ? assignedTypeNames : primaryTypeName ? [primaryTypeName] : [],
  ));

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
    attraction_type_name_th: primaryTypeName,
    attraction_type_names_th: attractionTypeNames,
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
  const categoryAttractionIds = filters.attractionTypeId
    ? await listAttractionIdsByType(filters.attractionTypeId)
    : null;

  if (categoryAttractionIds?.length === 0) {
    return { items: [], total: 0, page: filters.page, pageSize: filters.pageSize };
  }

  let query = supabase
    .from("attractions")
    .select(
      `
        *,
        provinces (province_name_th),
        districts (district_name_th),
        attraction_types!attractions_attraction_type_id_fkey (type_name_th),
        attraction_type_assignments (
          is_primary,
          display_order,
          attraction_types (type_name_th)
        )
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
  if (categoryAttractionIds) query = query.in("attraction_id", categoryAttractionIds);
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
        attraction_types!attractions_attraction_type_id_fkey (type_name_th),
        attraction_type_assignments (
          is_primary,
          display_order,
          attraction_types (type_name_th)
        )
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
  await assertLiveDestinationProvinceId(input.provinceId);
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
  const { data, error } = await supabase.from("attraction_types").select("attraction_type_id, type_name_th, type_name_en, is_active").order("type_name_th");
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
    .select("photo_spot_id, attraction_id, spot_name_th, is_active")
    .order("spot_name_th");
  if (error) throw new Error("ADMIN_PHOTO_SPOTS_LIST_FAILED");
  return data || [];
}

type AttractionRelationRow = {
  id: number;
  attraction_id: number;
  related_attraction_id: number;
  display_order: number;
};

type RestaurantRelationRow = {
  id: number;
  attraction_id: number;
  restaurant_id: number;
  display_order: number;
};

type AccommodationRelationRow = {
  id: number;
  attraction_id: number;
  accommodation_id: number;
  display_order: number;
};

type StoryRelationRow = {
  id: number;
  attraction_id: number;
  story_id: number;
  display_order: number;
};

export type AdminAttractionRelatedContent = {
  attractions: AttractionRelationRow[];
  restaurants: RestaurantRelationRow[];
  accommodations: AccommodationRelationRow[];
  stories: StoryRelationRow[];
};

function relationRows<T>(data: unknown): T[] {
  return Array.isArray(data) ? data as T[] : [];
}

export async function getAdminAttractionRelatedContent(
  attractionId: number,
): Promise<AdminAttractionRelatedContent> {
  if (!positiveInteger(attractionId)) throw new Error("ADMIN_ATTRACTION_RELATED_INVALID_INPUT");
  const supabase = createSupabaseServiceRoleClient();
  const [attractions, restaurants, accommodations, stories] = await Promise.all([
    supabase.from("attraction_related_attractions").select("*").eq("attraction_id", attractionId).order("display_order"),
    supabase.from("attraction_related_restaurants").select("*").eq("attraction_id", attractionId).order("display_order"),
    supabase.from("attraction_related_accommodations").select("*").eq("attraction_id", attractionId).order("display_order"),
    supabase.from("attraction_related_stories").select("*").eq("attraction_id", attractionId).order("display_order"),
  ]);

  if (attractions.error || restaurants.error || accommodations.error || stories.error) {
    throw new Error("ADMIN_ATTRACTION_RELATED_READ_FAILED");
  }

  return {
    attractions: relationRows<AttractionRelationRow>(attractions.data),
    restaurants: relationRows<RestaurantRelationRow>(restaurants.data),
    accommodations: relationRows<AccommodationRelationRow>(accommodations.data),
    stories: relationRows<StoryRelationRow>(stories.data),
  };
}

function settingsFromLegacy(
  attractionId: number,
  related: AdminAttractionRelatedContent,
): AdminRelatedContentSetting[] {
  const relations: Record<RelatedContentType, number> = {
    attractions: related.attractions.length,
    restaurants: related.restaurants.length,
    accommodations: related.accommodations.length,
    stories: related.stories.length,
  };
  return RELATED_CONTENT_TYPES.map((contentType) => ({
    attractionId,
    contentType,
    mode: relations[contentType] > 0 ? "manual" : "automatic",
    maxItems: DEFAULT_RELATED_CONTENT_LIMITS[contentType],
  }));
}

export async function getAdminAttractionRelatedContentSettings(
  attractionId: number,
): Promise<AdminRelatedContentSetting[]> {
  if (!positiveInteger(attractionId)) throw new Error("ADMIN_ATTRACTION_RELATED_INVALID_INPUT");
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await asQueryBuilder<RelatedSettingsRow>(
    supabase
      .from("attraction_related_content_settings")
      .select("attraction_id, content_type, mode, max_items")
      .eq("attraction_id", attractionId),
  );

  if (error && !isMissingRelatedSettingsTable(error)) {
    throw new Error("ADMIN_ATTRACTION_RELATED_SETTINGS_READ_FAILED");
  }

  if (error && isMissingRelatedSettingsTable(error)) {
    return settingsFromLegacy(attractionId, await getAdminAttractionRelatedContent(attractionId));
  }

  const rawSettings = relationRows<RelatedSettingsRow>(data);
  const parsed = rawSettings
    .map(parseSettingsRow);
  if (parsed.some((setting) => setting === null)) {
    throw new Error("ADMIN_ATTRACTION_RELATED_SETTINGS_READ_FAILED");
  }
  const validSettings = parsed.filter((setting): setting is AdminRelatedContentSetting => setting !== null);
  const byType = new Map(validSettings.map((setting) => [setting.contentType, setting]));
  const missingTypes = RELATED_CONTENT_TYPES.filter((contentType) => !byType.has(contentType));
  if (missingTypes.length === 0) return validSettings.sort((left, right) => RELATED_CONTENT_TYPES.indexOf(left.contentType) - RELATED_CONTENT_TYPES.indexOf(right.contentType));

  const legacy = settingsFromLegacy(attractionId, await getAdminAttractionRelatedContent(attractionId));
  return RELATED_CONTENT_TYPES.map((contentType) => byType.get(contentType) ?? legacy.find((setting) => setting.contentType === contentType)!)
    .filter((setting): setting is AdminRelatedContentSetting => setting !== undefined);
}

function searchQuery<T>(
  supabase: ReturnType<typeof createSupabaseServiceRoleClient>,
  table: string,
  columns: string,
  idColumn: string,
  source: RelatedContentSearchInput,
  liveProvinceIds: number[],
  includeActive: boolean,
  searchColumns: string[],
): QueryBuilder<T> {
  const page = normalizePage(source.page);
  const pageSize = normalizePageSize(source.pageSize);
  const query = asQueryBuilder<T>(
    supabase.from(table as never).select(columns, { count: "exact" }),
  );
  query.eq("is_published", true);
  if (includeActive) query.eq("is_active", true);
  query.in("province_id", liveProvinceIds);
  if (source.contentType === "attractions") query.neq(idColumn, source.attractionId);
  const escaped = escapeSearchPattern(source.query);
  if (escaped) query.or(searchColumns.map((column) => `${column}.ilike.%${escaped}%`).join(","));
  query.order(searchColumns[0] ?? idColumn, { ascending: true });
  query.range((page - 1) * pageSize, page * pageSize - 1);
  return query;
}

function mapSearchItem(
  contentType: RelatedContentType,
  row: RelatedAttractionRow | RelatedRestaurantRow | RelatedAccommodationRow | RelatedStoryRow,
): AdminRelatedContentSearchItem | null {
  const isStory = contentType === "stories";
  const id = Number(isStory ? (row as RelatedStoryRow).story_id : contentType === "attractions" ? (row as RelatedAttractionRow).attraction_id : contentType === "restaurants" ? (row as RelatedRestaurantRow).restaurant_id : (row as RelatedAccommodationRow).accommodation_id);
  const typedRow = row as RelatedAttractionRow & RelatedRestaurantRow & RelatedAccommodationRow & RelatedStoryRow;
  const name = isStory ? publicName(typedRow.title, null) : publicName(typedRow.name_th, typedRow.name_en);
  const slug = publicSlug(typedRow.slug);
  if (!positiveInteger(id) || !name || !slug) return null;
  return {
    id,
    name,
    slug,
    provinceName: provinceName(typedRow.provinces),
    status: "published",
    editHref: editHref(contentType, id),
  };
}

export async function searchAdminAttractionRelatedContent(
  input: RelatedContentSearchInput,
): Promise<AdminRelatedContentSearchResult> {
  if (!positiveInteger(input.attractionId) || !isRelatedContentType(input.contentType) || typeof input.query !== "string") {
    throw new Error("ADMIN_ATTRACTION_RELATED_INVALID_INPUT");
  }
  const page = normalizePage(input.page);
  const pageSize = normalizePageSize(input.pageSize);
  const liveProvinceIds = await listLiveDestinationProvinceIds();
  if (liveProvinceIds.length === 0) return { items: [], total: 0, page, pageSize };

  const supabase = createSupabaseServiceRoleClient();
  let response: QueryResponse<RelatedAttractionRow | RelatedRestaurantRow | RelatedAccommodationRow | RelatedStoryRow>;
  if (input.contentType === "attractions") {
    response = await searchQuery<RelatedAttractionRow>(supabase, "attractions", "attraction_id, name_th, name_en, slug, province_id, is_published, is_active, provinces(province_name_th, province_name_en)", "attraction_id", input, liveProvinceIds, true, ["name_th", "name_en", "slug"]);
  } else if (input.contentType === "restaurants") {
    response = await searchQuery<RelatedRestaurantRow>(supabase, "restaurants", "restaurant_id, name_th, name_en, slug, province_id, is_published, is_active, provinces(province_name_th, province_name_en)", "restaurant_id", input, liveProvinceIds, true, ["name_th", "name_en", "slug"]);
  } else if (input.contentType === "accommodations") {
    response = await searchQuery<RelatedAccommodationRow>(supabase, "accommodations", "accommodation_id, name_th, name_en, slug, province_id, is_published, is_active, provinces(province_name_th, province_name_en)", "accommodation_id", input, liveProvinceIds, true, ["name_th", "name_en", "slug"]);
  } else {
    const storyQuery = searchQuery<RelatedStoryRow>(supabase, "travel_stories", "story_id, title, slug, province_id, is_published, status, provinces(province_name_th, province_name_en)", "story_id", input, liveProvinceIds, false, ["title", "slug"]);
    storyQuery.eq("status", "published");
    response = await storyQuery;
  }

  if (response.error) throw new Error("ADMIN_ATTRACTION_RELATED_SEARCH_FAILED");
  const items = relationRows<RelatedAttractionRow | RelatedRestaurantRow | RelatedAccommodationRow | RelatedStoryRow>(response.data)
    .map((row) => mapSearchItem(input.contentType, row))
    .filter((item): item is AdminRelatedContentSearchItem => item !== null);
  return { items, total: response.count ?? items.length, page, pageSize };
}

function selectedRowsQuery<T>(
  supabase: ReturnType<typeof createSupabaseServiceRoleClient>,
  table: string,
  columns: string,
  idColumn: string,
  ids: number[],
): QueryBuilder<T> {
  return asQueryBuilder<T>(
    supabase.from(table as never).select(columns).in(idColumn, ids),
  );
}

export async function getAdminSelectedRelatedContent(
  attractionId: number,
  contentType: RelatedContentType,
  relatedIds: number[],
): Promise<AdminSelectedRelatedContentItem[]> {
  if (!positiveInteger(attractionId) || !isRelatedContentType(contentType) || !Array.isArray(relatedIds) || relatedIds.some((id) => !positiveInteger(id))) {
    throw new Error("ADMIN_ATTRACTION_RELATED_INVALID_INPUT");
  }
  const ids = Array.from(new Set(relatedIds));
  if (ids.length === 0) return [];
  const supabase = createSupabaseServiceRoleClient();
  let response: QueryResponse<RelatedAttractionRow | RelatedRestaurantRow | RelatedAccommodationRow | RelatedStoryRow>;
  const columns = contentType === "stories"
    ? "story_id, title, slug, province_id, is_published, status, provinces(province_name_th, province_name_en)"
    : "*, provinces(province_name_th, province_name_en)";
  if (contentType === "attractions") response = await selectedRowsQuery<RelatedAttractionRow>(supabase, "attractions", columns, "attraction_id", ids);
  else if (contentType === "restaurants") response = await selectedRowsQuery<RelatedRestaurantRow>(supabase, "restaurants", columns, "restaurant_id", ids);
  else if (contentType === "accommodations") response = await selectedRowsQuery<RelatedAccommodationRow>(supabase, "accommodations", columns, "accommodation_id", ids);
  else response = await selectedRowsQuery<RelatedStoryRow>(supabase, "travel_stories", columns, "story_id", ids);
  if (response.error) throw new Error("ADMIN_ATTRACTION_RELATED_SELECTED_READ_FAILED");

  const rows = relationRows<RelatedAttractionRow | RelatedRestaurantRow | RelatedAccommodationRow | RelatedStoryRow>(response.data);
  const liveProvinceIds = new Set(await listLiveDestinationProvinceIds());
  const byId = new Map<number, AdminSelectedRelatedContentItem>();
  for (const row of rows) {
    const typedRow = row as RelatedAttractionRow & RelatedRestaurantRow & RelatedAccommodationRow & RelatedStoryRow;
    const id = Number(contentType === "stories" ? typedRow.story_id : contentType === "attractions" ? typedRow.attraction_id : contentType === "restaurants" ? typedRow.restaurant_id : typedRow.accommodation_id);
    const name = contentType === "stories" ? publicName(typedRow.title, null) : publicName(typedRow.name_th, typedRow.name_en);
    const slug = publicSlug(typedRow.slug);
    const isPublished = typedRow.is_published === true;
    const isActive = contentType === "stories" ? null : typedRow.is_active === true;
    const storyIsPublished = contentType !== "stories" || typedRow.status === "published";
    const provinceId = Number(typedRow.province_id);
    const inScope = contentType === "stories" && !positiveInteger(provinceId) ? true : liveProvinceIds.has(provinceId);
    const available = positiveInteger(id) && Boolean(name) && Boolean(slug) && isPublished && (isActive ?? true) && storyIsPublished && inScope;
    byId.set(id, {
      id,
      name,
      slug,
      provinceName: provinceName(typedRow.provinces),
      isPublished,
      isActive,
      status: available ? "published" : "unavailable",
      available,
      editHref: editHref(contentType, id),
    });
  }
  return ids.map((id) => byId.get(id) ?? {
    id,
    name: null,
    slug: null,
    provinceName: null,
    isPublished: false,
    isActive: false,
    status: "missing",
    available: false,
    editHref: editHref(contentType, id),
  });
}

// ─── Inline field update (used by InlineEditableText) ─────────────────────

const INLINE_FIELD_MAP: Record<string, string> = {
  nameTh: "name_th",
  nameEn: "name_en",
  slug: "slug",
  shortDescriptionTh: "short_description_th",
  shortDescriptionEn: "short_description_en",
  descriptionTh: "description_th",
  descriptionEn: "description_en",
  historyTh: "history_th",
  historyEn: "history_en",
  travelTipsTh: "travel_tips_th",
  travelTipsEn: "travel_tips_en",
  howToGetThereTh: "how_to_get_there_th",
  howToGetThereEn: "how_to_get_there_en",
  addressText: "address_text",
  openingHours: "opening_hours",
  contactInfo: "contact_info",
  sustainabilityCategory: "sustainability_category",
};

export function getInlineFieldColumn(fieldName: string): string | null {
  return INLINE_FIELD_MAP[fieldName] ?? null;
}

export async function updateAdminAttractionField(
  attractionId: number,
  fieldName: string,
  value: string | null
): Promise<void> {
  const dbField = getInlineFieldColumn(fieldName);
  if (!dbField) throw new Error(`INVALID_INLINE_FIELD: ${fieldName}`);

  const supabase = createSupabaseServiceRoleClient();
  const { error } = await supabase
    .from("attractions")
    .update({ [dbField]: value === "" ? null : value })
    .eq("attraction_id", attractionId);

  if (error) {
    throw new Error("ADMIN_ATTRACTION_UPDATE_FAILED");
  }
}

function validateUpdateInput(input: UpdateAdminRelatedContentInput): void {
  if (!positiveInteger(input.attractionId) || !isRelatedContentType(input.contentType) || !isRelatedContentMode(input.mode) || !Array.isArray(input.relatedIds)) {
    throw new Error("ADMIN_ATTRACTION_RELATED_INVALID_INPUT");
  }
  if (!Number.isSafeInteger(input.maxItems) || input.maxItems < 1 || input.maxItems > 8) {
    throw new Error("ADMIN_ATTRACTION_RELATED_INVALID_INPUT");
  }
  const seen = new Set<number>();
  for (const id of input.relatedIds) {
    if (!positiveInteger(id) || seen.has(id)) throw new Error("ADMIN_ATTRACTION_RELATED_INVALID_INPUT");
    seen.add(id);
    if (input.contentType === "attractions" && id === input.attractionId) {
      throw new Error("ADMIN_ATTRACTION_RELATED_INVALID_INPUT");
    }
  }
}

function rpcPayload(value: unknown): Record<string, unknown> | null {
  return isRecord(value) ? value : null;
}

export async function updateAdminAttractionRelatedContentV2(
  input: UpdateAdminRelatedContentInput,
): Promise<UpdateAdminRelatedContentResult> {
  validateUpdateInput(input);
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase.rpc("sync_attraction_related_content_v2", {
    p_attraction_id: input.attractionId,
    p_entity_type: input.contentType,
    p_related_ids: input.relatedIds,
    p_mode: input.mode,
    p_max_items: input.maxItems,
  });
  const payload = rpcPayload(data);
  const curatedCount = payload?.curated_count;
  const success = payload?.success === true
    && payload?.content_type === input.contentType
    && payload?.mode === input.mode
    && Number(payload?.max_items) === input.maxItems;
  if (error || !success || (curatedCount !== undefined && !nonNegativeInteger(Number(curatedCount)))) {
    console.error("sync_attraction_related_content_v2 RPC error:", error);
    throw new Error("ADMIN_ATTRACTION_RELATED_UPDATE_FAILED");
  }
  return {
    attractionId: input.attractionId,
    contentType: input.contentType,
    mode: input.mode,
    maxItems: input.maxItems,
    curatedCount: Number(curatedCount ?? input.relatedIds.length),
  };
}

export async function updateAdminAttractionRelatedContent(
  attractionId: number,
  type: RelatedContentType,
  relatedIds: number[],
): Promise<void> {
  if (!positiveInteger(attractionId) || !isRelatedContentType(type) || !Array.isArray(relatedIds) || relatedIds.some((id) => !positiveInteger(id))) {
    throw new Error("ADMIN_ATTRACTION_RELATED_INVALID_INPUT");
  }
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase.rpc("sync_attraction_related_content", {
    p_attraction_id: attractionId,
    p_entity_type: type,
    p_related_ids: relatedIds,
  });
  const payload = rpcPayload(data);
  if (error || payload?.success !== true) {
    console.error("sync_attraction_related_content RPC error:", error);
    throw new Error("ADMIN_ATTRACTION_RELATED_UPDATE_FAILED");
  }
}

export type ContentReadiness = {
  attractions: { total: number; published: number; publishedWithCover: number };
  stories: { total: number; published: number; publishedWithHero: number };
  routes: { total: number; published: number; publishedWithStops: number };
  checkinCodes: { total: number; active: number };
  media: { totalActive: number; withAltText: number };
};

export async function getContentReadiness(): Promise<ContentReadiness> {
  const supabase = createSupabaseServiceRoleClient();

  const [
    attractionsRes,
    storiesRes,
    routesRes,
    checkinRes,
    mediaRes,
    attractionsPublishedRes,
    storiesPublishedRes,
    activeCheckinRes,
  ] = await Promise.all([
    supabase.from("attractions").select("attraction_id, is_published", { count: "exact", head: true }),
    supabase.from("travel_stories").select("story_id, is_published", { count: "exact", head: true }),
    supabase.from("suggested_routes").select("route_id, is_published", { count: "exact", head: true }),
    supabase.from("checkin_codes").select("checkin_code_id, is_active", { count: "exact", head: true }),
    supabase.from("content_media").select("media_id, alt_text_th, is_active", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("attractions").select("attraction_id", { count: "exact", head: true }).eq("is_published", true).eq("is_active", true),
    supabase.from("travel_stories").select("story_id", { count: "exact", head: true }).eq("is_published", true),
    supabase.from("checkin_codes").select("checkin_code_id", { count: "exact", head: true }).eq("is_active", true),
  ]);

  // Published attractions with active cover media (join via content_media)
  let publishedWithCover = 0;
  try {
    const { data: coverData } = await supabase
      .from("content_media")
      .select("attraction_id")
      .eq("is_cover", true)
      .eq("is_active", true)
      .eq("lifecycle_status", "active")
      .not("attraction_id", "is", null);
    if (coverData) {
      // Deduplicate by attraction_id — only count each attraction once
      const uniqueCovers = new Set(coverData.map((r: { attraction_id: number | null }) => r.attraction_id));
      // Further filter to only published attractions
      const { data: publishedIds } = await supabase
        .from("attractions")
        .select("attraction_id")
        .eq("is_published", true)
        .eq("is_active", true)
        .in("attraction_id", Array.from(uniqueCovers).filter(Boolean) as number[]);
      publishedWithCover = publishedIds?.length ?? 0;
    }
  } catch {
    // Gracefully handle missing view or table
  }

  // Published stories with active hero image (any active content_media)
  let publishedWithHero = 0;
  try {
    const { data: storyMedia } = await supabase
      .from("content_media")
      .select("story_id")
      .eq("is_active", true)
      .eq("lifecycle_status", "active")
      .not("story_id", "is", null);
    if (storyMedia) {
      const uniqueStories = new Set(storyMedia.map((r: { story_id: number | null }) => r.story_id));
      const { data: publishedStories } = await supabase
        .from("travel_stories")
        .select("story_id")
        .eq("is_published", true)
        .in("story_id", Array.from(uniqueStories).filter(Boolean) as number[]);
      publishedWithHero = publishedStories?.length ?? 0;
    }
  } catch {
    // Gracefully handle missing data
  }

  // Published routes (total) and published routes with at least 1 stop
  let routesPublished = 0;
  let publishedWithStops = 0;
  try {
    const { data: publishedRoutes } = await supabase
      .from("suggested_routes")
      .select("route_id")
      .eq("is_published", true)
      .eq("is_active", true);
    if (publishedRoutes && publishedRoutes.length > 0) {
      routesPublished = publishedRoutes.length;
      const routeIds = publishedRoutes.map((r: { route_id: number }) => r.route_id);
      const { data: stopCounts } = await supabase
        .from("suggested_route_stops")
        .select("route_id")
        .in("route_id", routeIds);
      if (stopCounts) {
        const routesWithStops = new Set(stopCounts.map((r: { route_id: number }) => r.route_id));
        publishedWithStops = routesWithStops.size;
      }
    }
  } catch {
    // Gracefully handle missing data
  }

  // Active media with alt_text_th filled in
  let withAltText = 0;
  try {
    const { data: altTextData, count: altCount } = await supabase
      .from("content_media")
      .select("media_id", { count: "exact", head: true })
      .eq("is_active", true)
      .not("alt_text_th", "is", null)
      .neq("alt_text_th", "");
    withAltText = altCount ?? altTextData?.length ?? 0;
  } catch {
    // Gracefully handle
  }

  return {
    attractions: {
      total: attractionsRes.count ?? 0,
      published: attractionsPublishedRes.count ?? 0,
      publishedWithCover,
    },
    stories: {
      total: storiesRes.count ?? 0,
      published: storiesPublishedRes.count ?? 0,
      publishedWithHero,
    },
    routes: {
      total: routesRes.count ?? 0,
      published: routesPublished,
      publishedWithStops,
    },
    checkinCodes: {
      total: checkinRes.count ?? 0,
      active: activeCheckinRes.count ?? 0,
    },
    media: {
      totalActive: mediaRes.count ?? 0,
      withAltText,
    },
  };
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

  let accommodationsList: ContentListAccommodation[] = [];
  try {
    const { data } = await supabase.from("accommodations").select("accommodation_id, name_th, province_id, provinces(province_name_th)").eq("is_published", true);
    accommodationsList = (data || []) as ContentListAccommodation[];
  } catch {
    // Ignore if table missing
  }

  const getProvinceName = (p: SupabaseJoin<ContentListProvince>) => firstJoin(p)?.province_name_th ?? undefined;

  return {
    attractions: ((attractions.data || []) as ContentListAttraction[]).map(a => ({ id: a.attraction_id, name: a.name_th, province: getProvinceName(a.provinces) })),
    restaurants: ((restaurants.data || []) as ContentListRestaurant[]).map(r => ({ id: r.restaurant_id, name: r.name_th, province: getProvinceName(r.provinces) })),
    accommodations: accommodationsList.map(a => ({ id: a.accommodation_id, name: a.name_th, province: getProvinceName(a.provinces) })),
    stories: ((stories.data || []) as ContentListStory[]).map(s => ({ id: s.story_id, name: s.title }))
  };
}
