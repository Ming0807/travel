import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { siteMediaImageUrl } from "@/lib/media/storage-paths";
import {
  selectPublicAttractionMedia,
  type PublicAttractionImage,
  type PublicAttractionMediaRow,
  type PublicAttractionVirtualTour,
} from "@/lib/attractions/public-detail";
import type { PublicStoryQuery } from "@/lib/content/public-story-query";
import {
  storyDocumentSchema,
  type StoryDocument,
} from "@/lib/content/story-document";
import {
  rankStoryRecommendations,
  type StoryRecommendationReason,
} from "@/lib/content/story-recommendation";
import {
  routeStopsArePublicForLaunch,
  sanitizeDestinationProvinceFilter,
} from "@/lib/destinations/launch-scope";
import {
  buildRouteDirectionsUrl,
  safeExternalTourUrl,
  type PublicRouteStop,
} from "@/lib/routes/public-route";
import {
  listLiveDestinationProvinceIds,
  listLiveDestinationProvinces,
} from "@/lib/repositories/destination-scope.repository";
import { listStoryEngagementSignals } from "@/lib/repositories/story-engagement.repository";
import type { AttractionCard } from "@/types/tourism";

type DbRecord = Record<string, unknown>;

type InternalAttractionCard = AttractionCard & {
  attractionId: number;
  district: string | null;
};

type PublicAttractionListOptions = {
  search?: string;
  province?: string;
  type?: string;
  featuredSlugs?: string[];
};

export const PUBLIC_ATTRACTION_MAX_PAGE = 10_000;

export type PublicAttractionCard = Omit<AttractionCard, "rating" | "reviewCount"> & {
  district: string | null;
  rating: number | null;
  reviewCount: number | null;
  reviewState: "available" | "empty" | "unavailable";
};

export type PublicAttractionPageInput = {
  query?: string;
  province?: "Yala";
  type?: string;
  page: number;
  pageSize: number;
};

export type PublicAttractionPage = {
  items: PublicAttractionCard[];
  total: number;
  page: number;
  pageCount: number;
};

export type PublicStoryCard = {
  storyId: number;
  id: string;
  title: string;
  excerpt: string;
  province: string;
  date: string;
  publishedAt: string | null;
  updatedAt: string | null;
  imageUrl: string | null;
  thumbnailUrl?: string | null;
  imageAlt: string;
  category: string;
  authorType: string;
  authorName: string;
  readingMinutes: number;
  primaryLanguage: string;
  primaryTopic: { key: string; name: string } | null;
  status?: string;
};

export type PublicStoryDetail = PublicStoryCard & {
  content: string | null;
  contentDocument: StoryDocument | null;
  seoTitle: string | null;
  seoDescription: string | null;
};

export type PublicStoryPage = {
  items: PublicStoryCard[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  loadError: boolean;
};

export type PublicStoryTopicOption = {
  key: string;
  name: string;
};

export type PublicStoryRecommendation = {
  story: PublicStoryCard;
  reasonKey: StoryRecommendationReason;
  reasonLabel: string;
};

export type PublicStoryDestination = {
  slug: string;
  name: string;
  province: string;
  imageUrl: string | null;
  imageAlt: string;
};

export type PublicStoryData = {
  story: PublicStoryDetail;
  relatedStories: PublicStoryRecommendation[];
  relatedDestinations: PublicStoryDestination[];
};

export type PublicAttractionRelatedItem = {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  category?: string;
  recommendationReason?: string;
  rating?: number;
  reviews?: string;
  price?: string;
};

export type PublicAttractionDetail = {
  attractionId: number;
  slug: string;
  name: string;
  province: string;
  attractionType: string;
  description: string;
  mainImage: PublicAttractionImage | null;
  gallery: PublicAttractionImage[];
  virtualTour: PublicAttractionVirtualTour | null;
  thingsToDo: PublicAttractionRelatedItem[];
  whereToStay: PublicAttractionRelatedItem[];
  foodAndDrink: PublicAttractionRelatedItem[];
  travelTips: string[];
  howToGetThere: string | null;
  addressText: string | null;
  latitude: number | null;
  longitude: number | null;
  openingHours: string | null;
  contactInfo: string | null;
  articles: PublicAttractionRelatedItem[];
};

function one(value: unknown): DbRecord | null {
  if (Array.isArray(value)) return (value[0] as DbRecord | undefined) ?? null;
  return value && typeof value === "object" ? (value as DbRecord) : null;
}

function records(value: unknown): DbRecord[] {
  return Array.isArray(value)
    ? value.filter((item): item is DbRecord => Boolean(item) && typeof item === "object")
    : [];
}

function text(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim().length > 0 ? value : fallback;
}

function numberValue(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function nullableNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function escapeIlikePattern(value: string) {
  return value.replace(/[\\%_]/g, "\\$&").replace(/,/g, " ").trim();
}

function imageUrlFromStoragePath(value: unknown): string | null {
  const storagePath = text(value);
  return siteMediaImageUrl(storagePath);
}

function storagePathFromMedia(media: DbRecord | null): string {
  return text(media?.storage_path);
}

function publicAttractionMedia(row: DbRecord): DbRecord | null {
  const media = Array.isArray(row.content_media)
    ? (row.content_media as DbRecord[])
    : [];
  const publicReadyMedia = media.filter((item) => {
    const lifecycleStatus = text(item.lifecycle_status);
    return item.is_active !== false && (!lifecycleStatus || lifecycleStatus === "active");
  });

  return publicReadyMedia.find((item) => item.is_cover === true) ?? publicReadyMedia[0] ?? null;
}

function publicImage(row: DbRecord, thumbnailByStoragePath?: Map<string, string>): string | null {
  const media = publicAttractionMedia(row);
  if (!media) return null;
  const storagePath = storagePathFromMedia(media);
  return imageUrlFromStoragePath(thumbnailByStoragePath?.get(storagePath) ?? storagePath);
}

function publicManagedImage(
  row: DbRecord,
  thumbnailByStoragePath?: Map<string, string>,
): string | null {
  const media = publicAttractionMedia(row);
  const storagePath = storagePathFromMedia(media);
  if (!storagePath || /^https?:\/\//i.test(storagePath)) return null;
  return imageUrlFromStoragePath(thumbnailByStoragePath?.get(storagePath) ?? storagePath);
}

function publicImageAlt(row: DbRecord, fallback: string): string {
  const media = publicAttractionMedia(row);
  return text(media?.alt_text_th, text(media?.alt_text_en, fallback));
}

function publicManagedStoryImage(
  row: DbRecord,
  thumbnailByStoragePath?: Map<string, string>,
): string | null {
  return publicManagedImage(row, thumbnailByStoragePath);
}

function mapAttractionCard(row: DbRecord, thumbnailByStoragePath?: Map<string, string>): InternalAttractionCard {
  const province = one(row.provinces);
  const attractionType = one(row.attraction_types);
  const district = one(row.districts);
  const media = publicAttractionMedia(row);
  const name = text(row.name_th, text(row.name_en, "Untitled attraction"));
  const category = text(attractionType?.type_name_th, text(attractionType?.type_name_en, "Uncategorized"));
  const provinceName = text(province?.province_name_th, text(province?.province_name_en));

  return {
    attractionId: numberValue(row.attraction_id),
    district: text(district?.district_name_th, text(district?.district_name_en)) || null,
    slug: text(row.slug),
    name,
    province: provinceName,
    category,
    description: text(row.short_description_th, text(row.short_description_en)),
    imageUrl: publicImage(row, thumbnailByStoragePath),
    imageAlt: text(media?.alt_text_th, text(media?.alt_text_en, `${name} destination image`)),
    tags: [category, provinceName].filter(Boolean),
    latitude: row.latitude === null || row.latitude === undefined ? null : numberValue(row.latitude),
    longitude: row.longitude === null || row.longitude === undefined ? null : numberValue(row.longitude),
  };
}

function toPublicAttractionCard(card: InternalAttractionCard, summary?: { rating: number; reviewCount: number }): AttractionCard {
  return {
    slug: card.slug,
    name: card.name,
    province: card.province,
    category: card.category,
    description: card.description,
    imageUrl: card.imageUrl,
    imageAlt: card.imageAlt,
    tags: card.tags,
    latitude: card.latitude,
    longitude: card.longitude,
    ...(summary ? { rating: summary.rating, reviewCount: summary.reviewCount } : {}),
  };
}

async function withReviewSummaries(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  cards: InternalAttractionCard[]
): Promise<AttractionCard[]> {
  const attractionIds = cards
    .map((card) => card.attractionId)
    .filter((id) => Number.isInteger(id) && id > 0);

  if (attractionIds.length === 0) {
    return cards.map((card) => toPublicAttractionCard(card));
  }

  const { data, error } = await supabase
    .from("reviews")
    .select("attraction_id, rating")
    .in("attraction_id", attractionIds)
    .eq("is_approved", true)
    .eq("is_published", true)
    .is("deleted_at", null);

  if (error) {
    return cards.map((card) => toPublicAttractionCard(card));
  }

  const stats = new Map<number, { total: number; sum: number }>();
  (data ?? []).forEach((row) => {
    const attractionId = numberValue((row as DbRecord).attraction_id);
    const rating = numberValue((row as DbRecord).rating);
    if (!attractionId || rating < 1 || rating > 5) return;
    const current = stats.get(attractionId) ?? { total: 0, sum: 0 };
    current.total += 1;
    current.sum += rating;
    stats.set(attractionId, current);
  });

  return cards.map((card) => {
    const itemStats = stats.get(card.attractionId);
    if (!itemStats || itemStats.total === 0) return toPublicAttractionCard(card);
    return toPublicAttractionCard(card, {
      rating: Number((itemStats.sum / itemStats.total).toFixed(1)),
      reviewCount: itemStats.total,
    });
  });
}

async function withNullableReviewSummaries(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  cards: InternalAttractionCard[],
): Promise<PublicAttractionCard[]> {
  const attractionIds = cards
    .map((card) => card.attractionId)
    .filter((id) => Number.isInteger(id) && id > 0);

  if (attractionIds.length === 0) {
    return cards.map((card) => ({
      ...toPublicAttractionCard(card),
      district: card.district,
      rating: null,
      reviewCount: null,
      reviewState: "empty",
    }));
  }

  const { data, error } = await supabase
    .from("reviews")
    .select("attraction_id, rating")
    .in("attraction_id", attractionIds)
    .eq("is_approved", true)
    .eq("is_published", true)
    .is("deleted_at", null);

  if (error) {
    return cards.map((card) => ({
      ...toPublicAttractionCard(card),
      district: card.district,
      rating: null,
      reviewCount: null,
      reviewState: "unavailable",
    }));
  }

  const stats = new Map<number, { total: number; sum: number }>();
  (data ?? []).forEach((row) => {
    const attractionId = numberValue((row as DbRecord).attraction_id);
    const rating = numberValue((row as DbRecord).rating);
    if (!attractionId || rating < 1 || rating > 5) return;
    const current = stats.get(attractionId) ?? { total: 0, sum: 0 };
    current.total += 1;
    current.sum += rating;
    stats.set(attractionId, current);
  });

  return cards.map((card) => {
    const summary = stats.get(card.attractionId);
    if (!summary || summary.total === 0) {
      return {
        ...toPublicAttractionCard(card),
        district: card.district,
        rating: null,
        reviewCount: null,
        reviewState: "empty" as const,
      };
    }

    return {
      ...toPublicAttractionCard(card),
      district: card.district,
      rating: Number((summary.sum / summary.total).toFixed(1)),
      reviewCount: summary.total,
      reviewState: "available" as const,
    };
  });
}

async function loadMediaAssetThumbnails(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  rows: DbRecord[]
): Promise<Map<string, string>> {
  const storagePaths = Array.from(
    new Set(
      rows
        .map((row) => storagePathFromMedia(publicAttractionMedia(row)))
        .filter(Boolean)
    )
  );

  if (storagePaths.length === 0) return new Map();

  try {
    const { data, error } = await supabase
      .from("media_assets")
      .select("storage_path, thumbnail_storage_path")
      .in("storage_path", storagePaths);

    if (error || !Array.isArray(data)) return new Map();

    const thumbnails = new Map<string, string>();
    data.forEach((row) => {
      const storagePath = text((row as DbRecord).storage_path);
      const thumbnailPath = text((row as DbRecord).thumbnail_storage_path);
      if (storagePath && thumbnailPath) thumbnails.set(storagePath, thumbnailPath);
    });

    return thumbnails;
  } catch {
    return new Map();
  }
}

function formatStoryDate(value: unknown) {
  const date = typeof value === "string" ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("th-TH", { dateStyle: "medium" }).format(date);
}

function mapStory(
  row: DbRecord,
  thumbnailByStoragePath?: Map<string, string>,
): PublicStoryCard {
  const province = one(row.provinces);
  const coverMedia = publicAttractionMedia(row);
  const topicLinks = Array.isArray(row.story_topic_links)
    ? (row.story_topic_links as DbRecord[])
    : [];
  const primaryLink =
    topicLinks.find((link) => link.is_primary === true) ?? topicLinks[0] ?? null;
  const primaryTopic = primaryLink ? one(primaryLink.story_topics) : null;
  const primaryTopicName = primaryTopic
    ? text(primaryTopic.name_th, text(primaryTopic.name_en))
    : "";
  return {
    storyId: numberValue(row.story_id),
    id: text(row.slug),
    title: text(row.title, "Untitled story"),
    excerpt: text(row.excerpt),
    province: text(province?.province_name_th, text(province?.province_name_en)),
    date: formatStoryDate(row.published_at || row.created_at),
    publishedAt:
      typeof row.published_at === "string"
        ? row.published_at
        : typeof row.created_at === "string"
          ? row.created_at
          : null,
    updatedAt: typeof row.updated_at === "string" ? row.updated_at : null,
    imageUrl: publicManagedStoryImage(row),
    thumbnailUrl: publicManagedStoryImage(row, thumbnailByStoragePath),
    imageAlt: text(
      coverMedia?.alt_text_th,
      text(coverMedia?.alt_text_en, text(row.title, "ภาพประกอบเรื่องราว"))
    ),
    category: primaryTopicName || text(row.category, "เรื่องราว"),
    authorType: text(row.author_type, "admin"),
    authorName: row.author_type === "tourist" ? "นักเดินทาง" : "กองบรรณาธิการ",
    readingMinutes: Math.max(1, numberValue(row.reading_minutes, 1)),
    primaryLanguage: text(row.primary_language, "th"),
    primaryTopic: primaryTopic
      ? {
          key: text(primaryTopic.topic_key),
          name: primaryTopicName,
        }
      : null,
    status: text(row.status),
  };
}

function mapStoryDetail(row: DbRecord): PublicStoryDetail {
  return {
    ...mapStory(row),
    content: text(row.content) || null,
    contentDocument:
      storyDocumentSchema.safeParse(row.content_document).success
        ? (row.content_document as StoryDocument)
        : null,
    seoTitle: text(row.seo_title) || null,
    seoDescription: text(row.seo_description) || null,
  };
}

export async function listPublicAttractionCards(limit = 16, options?: PublicAttractionListOptions): Promise<AttractionCard[]> {
  try {
    const supabase = await createSupabaseServerClient();
    const liveProvinces = await listLiveDestinationProvinces();
    const liveProvinceIds = liveProvinces.map((province) => province.provinceId);
    if (liveProvinceIds.length === 0) return [];
    const provinceFilter = sanitizeDestinationProvinceFilter(
      options?.province,
      liveProvinces.map((province) => ({ province_name_en: province.nameEn })),
    );
    const buildBaseQuery = () => {
      const attractionTypesRelation = options?.type ? "attraction_types!inner" : "attraction_types";
      let q = supabase
        .from("attractions")
        .select(`
          attraction_id,
          slug,
          name_th,
          name_en,
          short_description_th,
          short_description_en,
          latitude,
          longitude,
          provinces!inner (province_name_th, province_name_en),
          ${attractionTypesRelation} (type_name_th, type_name_en),
          content_media (storage_path, alt_text_th, alt_text_en, is_cover, is_active, lifecycle_status, display_order)
        `)
        .eq("is_published", true)
        .eq("is_active", true)
        .in("province_id", liveProvinceIds);

      if (options?.search) {
        const search = escapeIlikePattern(options.search);
        if (search) {
          q = q.or(`name_th.ilike.%${search}%,name_en.ilike.%${search}%,slug.ilike.%${search}%`);
        }
      }

      if (provinceFilter) {
        q = q.eq('provinces.province_name_en', provinceFilter);
      }

      if (options?.type) {
        q = q.eq('attraction_types.type_name_en', options.type);
      }

      return q;
    };

    let finalRows: DbRecord[] = [];
    const usedSlugs = new Set<string>();

    if (options?.featuredSlugs && options.featuredSlugs.length > 0) {
      const { data, error } = await buildBaseQuery().in('slug', options.featuredSlugs).limit(limit);

      if (!error && data && data.length > 0) {
        finalRows = (data as DbRecord[])
          .filter((row) => text(row.slug))
          .sort((a, b) => options.featuredSlugs!.indexOf(text(a.slug)) - options.featuredSlugs!.indexOf(text(b.slug)));
        finalRows.forEach((row) => usedSlugs.add(text(row.slug)));
      }
    }

    if (finalRows.length < limit) {
      const remaining = limit - finalRows.length;
      const { data, error } = await buildBaseQuery()
        .order("created_at", { ascending: false })
        .limit(remaining + usedSlugs.size); // Fetch extra in case of overlap

      if (!error && data && data.length > 0) {
        const fallbackRows = (data as DbRecord[])
          .filter((row) => {
            const slug = text(row.slug);
            return slug && !usedSlugs.has(slug);
          })
          .slice(0, remaining);

        finalRows = [...finalRows, ...fallbackRows];
      }
    }

    const thumbnailByStoragePath = await loadMediaAssetThumbnails(supabase, finalRows);
    const finalResults = finalRows.map((row) => mapAttractionCard(row, thumbnailByStoragePath));

    return withReviewSummaries(supabase, finalResults);
  } catch {
    return [];
  }
}

export async function listPublicAttractionPage(
  input: PublicAttractionPageInput,
): Promise<PublicAttractionPage> {
  const page = Number.isSafeInteger(input.page)
    && input.page > 0
    && input.page <= PUBLIC_ATTRACTION_MAX_PAGE
    ? input.page
    : 1;
  const pageSize = Number.isInteger(input.pageSize) && input.pageSize > 0
    ? Math.min(input.pageSize, 48)
    : 12;
  const supabase = await createSupabaseServerClient();
  const liveProvinces = await listLiveDestinationProvinces();
  const liveProvinceIds = liveProvinces.map((province) => province.provinceId);

  if (liveProvinceIds.length === 0) {
    return { items: [], total: 0, page, pageCount: 0 };
  }

  const provinceFilter = sanitizeDestinationProvinceFilter(
    input.province,
    liveProvinces.map((province) => ({ province_name_en: province.nameEn })),
  );
  const attractionTypesRelation = input.type ? "attraction_types!inner" : "attraction_types";
  let query = supabase
    .from("attractions")
    .select(`
      attraction_id,
      slug,
      name_th,
      name_en,
      short_description_th,
      short_description_en,
      latitude,
      longitude,
      provinces!inner (province_name_th, province_name_en),
      districts (district_name_th, district_name_en),
      ${attractionTypesRelation} (type_name_th, type_name_en),
      content_media (storage_path, alt_text_th, alt_text_en, is_cover, is_active, lifecycle_status, display_order)
    `, { count: "exact" })
    .eq("is_published", true)
    .eq("is_active", true)
    .in("province_id", liveProvinceIds);

  const search = input.query ? escapeIlikePattern(input.query) : "";
  if (search) {
    query = query.or(
      `name_th.ilike.%${search}%,name_en.ilike.%${search}%,slug.ilike.%${search}%`,
    );
  }

  if (provinceFilter) {
    query = query.eq("provinces.province_name_en", provinceFilter);
  }

  if (input.type) {
    query = query.eq("attraction_types.type_name_en", input.type);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .order("attraction_id", { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error("PUBLIC_ATTRACTION_LIST_FAILED");
  }

  const rows = (data ?? []) as DbRecord[];
  const thumbnailByStoragePath = await loadMediaAssetThumbnails(supabase, rows);
  const cards = rows.map((row) => mapAttractionCard(row, thumbnailByStoragePath));
  const items = await withNullableReviewSummaries(supabase, cards);
  const total = typeof count === "number" ? count : 0;

  return {
    items,
    total,
    page,
    pageCount: total > 0 ? Math.ceil(total / pageSize) : 0,
  };
}

async function loadAttractionDetail(
  slug: string,
  visibility: "public" | "admin-preview",
): Promise<PublicAttractionDetail | null> {
    const supabase = await createSupabaseServerClient();
    let query = supabase
      .from("attractions")
      .select(`
        attraction_id,
        slug,
        name_th,
        name_en,
        short_description_th,
        short_description_en,
        description_th,
        description_en,
        travel_tips_th,
        how_to_get_there_th,
        address_text,
        opening_hours,
        contact_info,
        latitude,
        longitude,
        provinces (province_name_th, province_name_en),
        attraction_types (type_name_th, type_name_en),
        content_media (storage_path, media_type, alt_text_th, alt_text_en, is_cover, is_active, lifecycle_status, display_order)
      `)
      .eq("slug", slug);

    if (visibility === "public") {
      const liveProvinceIds = await listLiveDestinationProvinceIds();
      if (liveProvinceIds.length === 0) return null;
      query = query
        .eq("is_published", true)
        .eq("is_active", true)
        .in("province_id", liveProvinceIds);
    }

    const { data, error } = await query.maybeSingle();

    if (error) throw new Error("PUBLIC_ATTRACTION_DETAIL_FAILED");
    if (!data) return null;

    const row = data as DbRecord;
    const province = one(row.provinces);
    const name = text(row.name_th, text(row.name_en, "Untitled attraction"));
    const media = Array.isArray(row.content_media)
      ? (row.content_media as PublicAttractionMediaRow[])
      : [];
    const publicMedia = selectPublicAttractionMedia(media);
    const attractionType = one(row.attraction_types);
    const attractionId = numberValue(row.attraction_id);

    const baseDetail: PublicAttractionDetail = {
      attractionId,
      slug: text(row.slug, slug),
      name,
      province: text(province?.province_name_th, text(province?.province_name_en)),
      attractionType: text(attractionType?.type_name_th, text(attractionType?.type_name_en)),
      description: text(row.description_th, text(row.description_en, text(row.short_description_th, text(row.short_description_en)))),
      mainImage: publicMedia.mainImage,
      gallery: publicMedia.gallery,
      virtualTour: publicMedia.virtualTour,
      travelTips: row.travel_tips_th
        ? String(row.travel_tips_th).split('\n').map(s => s.trim()).filter(Boolean)
        : [],
      howToGetThere: text(row.how_to_get_there_th) || null,
      addressText: text(row.address_text) || null,
      latitude: row.latitude === null || row.latitude === undefined ? null : numberValue(row.latitude),
      longitude: row.longitude === null || row.longitude === undefined ? null : numberValue(row.longitude),
      openingHours: text(row.opening_hours) || null,
      contactInfo: text(row.contact_info) || null,
      thingsToDo: [],
      whereToStay: [],
      foodAndDrink: [],
      articles: []
    };

    // 1. Fetch curated relations
    const [curatedAttractions, curatedRestaurants, curatedAccommodations, curatedStories] = await Promise.all([
      supabase.from("attraction_related_attractions").select("related_attraction_id, attractions!related_attraction_id (slug)").eq("attraction_id", attractionId).order("display_order"),
      supabase.from("attraction_related_restaurants").select("restaurants (slug)").eq("attraction_id", attractionId).order("display_order"),
      supabase.from("attraction_related_accommodations").select("accommodations (slug)").eq("attraction_id", attractionId).order("display_order"),
      supabase.from("attraction_related_stories").select("travel_stories (slug)").eq("attraction_id", attractionId).order("display_order")
    ]);

    const extractSlugs = (data: unknown, key: string) => {
      if (!data) return [];
      return (data as DbRecord[]).map((item) => text(one(item[key])?.slug)).filter(Boolean);
    };

    const curatedAttractionSlugs = extractSlugs(curatedAttractions.data, "attractions");
    const curatedRestaurantSlugs = extractSlugs(curatedRestaurants.data, "restaurants");
    const curatedAccommodationSlugs = extractSlugs(curatedAccommodations.data, "accommodations");
    const curatedStorySlugs = extractSlugs(curatedStories.data, "travel_stories");
    const relationError = curatedAttractions.error
      ?? curatedRestaurants.error
      ?? curatedAccommodations.error
      ?? curatedStories.error;
    if (relationError) throw new Error("PUBLIC_ATTRACTION_DETAIL_FAILED");

    // Only explicitly curated relationships appear on the detail page.
    const [attractionsRes, restaurantsRes, accommodationsRes, storiesRes] = await Promise.all([
      curatedAttractionSlugs.length > 0
        ? listPublicAttractionCards(curatedAttractionSlugs.length, { featuredSlugs: curatedAttractionSlugs })
        : Promise.resolve([]),
      curatedRestaurantSlugs.length > 0
        ? listPublicRestaurants({ featuredSlugs: curatedRestaurantSlugs })
        : Promise.resolve([]),
      curatedAccommodationSlugs.length > 0
        ? listPublicAccommodations({ featuredSlugs: curatedAccommodationSlugs })
        : Promise.resolve([]),
      curatedStorySlugs.length > 0
        ? listPublicStories({ limit: curatedStorySlugs.length, featuredSlugs: curatedStorySlugs })
        : Promise.resolve([]),
    ]);

    baseDetail.thingsToDo = attractionsRes
      .filter(a => a.slug !== slug)
      .slice(0, 4)
      .map(a => ({
        id: a.slug,
        title: a.name,
        description: a.description,
        imageUrl: a.imageUrl,
        category: a.category
      }));

    baseDetail.foodAndDrink = restaurantsRes
      .slice(0, 4)
      .map(r => ({
        id: r.slug,
        title: r.name,
        description: r.description,
        imageUrl: r.imageUrl,
        category: r.foodType || "ร้านอาหาร"
      }));

    baseDetail.whereToStay = accommodationsRes
      .slice(0, 4)
      .map(a => ({
        id: a.slug,
        title: a.name,
        description: a.description,
        imageUrl: a.imageUrl,
        category: a.accommodationType || "ที่พัก"
      }));

    baseDetail.articles = storiesRes
      .slice(0, 3)
      .map(s => ({
        id: s.id,
        title: s.title,
        description: s.excerpt,
        imageUrl: s.imageUrl,
        category: s.category,
        recommendationReason: "คัดเลือกให้เข้ากับสถานที่นี้",
      }));

    return baseDetail;
}

export async function getPublicAttractionDetail(slug: string): Promise<PublicAttractionDetail | null> {
  return loadAttractionDetail(slug, "public");
}

export async function getAdminAttractionPreview(slug: string): Promise<PublicAttractionDetail | null> {
  return loadAttractionDetail(slug, "admin-preview");
}

export async function listPublicStories(options?: { limit?: number; province?: string; featuredSlugs?: string[]; authorType?: string }): Promise<PublicStoryCard[]> {
  const limit = options?.limit ?? 12;
  try {
    const supabase = await createSupabaseServerClient();
    const liveProvinces = await listLiveDestinationProvinces();
    const liveProvinceIds = liveProvinces.map((province) => province.provinceId);
    if (liveProvinceIds.length === 0) return [];
    const provinceFilter = sanitizeDestinationProvinceFilter(
      options?.province,
      liveProvinces.map((province) => ({ province_name_en: province.nameEn })),
    );
    let query = supabase
      .from("travel_stories")
      .select(publicStorySelect(Boolean(provinceFilter), false))
      .eq("status", "published")
      .eq("is_published", true)
      .eq("geographic_scope", "province")
      .or(`province_id.is.null,province_id.in.(${liveProvinceIds.join(",")})`);

    if (options?.featuredSlugs && options.featuredSlugs.length > 0) {
      query = query.in("slug", options.featuredSlugs);
    } else {
      if (provinceFilter) {
        query = query.eq('provinces.province_name_en', provinceFilter);
      }
      if (options?.authorType) {
        query = query.eq('author_type', options.authorType);
      }
    }

    const { data, error } = await query
      .order("published_at", { ascending: false })
      .limit(options?.featuredSlugs ? options.featuredSlugs.length : limit);

    if (error || !data || data.length === 0) return [];
    const rows = data as unknown as DbRecord[];
    const thumbnailByStoragePath = await loadMediaAssetThumbnails(supabase, rows);
    const results = rows
      .map((row) => mapStory(row, thumbnailByStoragePath))
      .filter((item) => item.id);

    if (options?.featuredSlugs && options.featuredSlugs.length > 0) {
      return results.sort((a, b) => options.featuredSlugs!.indexOf(a.id) - options.featuredSlugs!.indexOf(b.id));
    }
    return results;
  } catch {
    return [];
  }
}

const publicStorySelect = (withProvinceFilter: boolean, withTopicFilter: boolean) => `
  story_id,
  slug,
  title,
  excerpt,
  category,
  published_at,
  created_at,
  updated_at,
  author_type,
  reading_minutes,
  primary_language,
  tourists (display_name),
  provinces${withProvinceFilter ? "!inner" : ""} (province_name_th, province_name_en),
  content_media (
    storage_path,
    alt_text_th,
    alt_text_en,
    is_cover,
    is_active,
    lifecycle_status,
    display_order
  ),
  story_topic_links (
    is_primary,
    story_topics (
      topic_key,
      name_th,
      name_en
    )
  )${withTopicFilter ? `,
  topic_filter:story_topic_links!inner (
    story_topics!inner (topic_key)
  )` : ""}
`;

export async function listPublicStoryPage(
  options: PublicStoryQuery
): Promise<PublicStoryPage> {
  const from = (options.page - 1) * options.pageSize;
  const to = from + options.pageSize - 1;
  try {
    const supabase = await createSupabaseServerClient();
    const liveProvinces = await listLiveDestinationProvinces();
    const liveProvinceIds = liveProvinces.map((province) => province.provinceId);
    if (liveProvinceIds.length === 0) {
      return {
        items: [],
        total: 0,
        page: options.page,
        pageSize: options.pageSize,
        totalPages: 0,
        loadError: false,
      };
    }
    const provinceFilter = sanitizeDestinationProvinceFilter(
      options.province,
      liveProvinces.map((province) => ({ province_name_en: province.nameEn })),
    );
    let query = supabase
      .from("travel_stories")
      .select(
        publicStorySelect(Boolean(provinceFilter), Boolean(options.topic)),
        { count: "exact" }
      )
      .eq("status", "published")
      .eq("is_published", true)
      .eq("geographic_scope", "province")
      .or(`province_id.is.null,province_id.in.(${liveProvinceIds.join(",")})`);

    if (options.search) {
      const pattern = escapeIlikePattern(options.search);
      query = query.or(
        `title.ilike.%${pattern}%,excerpt.ilike.%${pattern}%`
      );
    }
    if (provinceFilter) {
      query = query.eq(
        "provinces.province_name_en",
        provinceFilter
      );
    }
    if (options.topic) {
      query = query.eq(
        "topic_filter.story_topics.topic_key",
        options.topic
      );
    }
    if (options.authorType) {
      query = query.eq("author_type", options.authorType);
    }

    const { data, error, count } = await query
      .order("published_at", { ascending: false })
      .order("story_id", { ascending: false })
      .range(from, to);
    if (error || !Array.isArray(data)) {
      return {
        items: [],
        total: 0,
        page: options.page,
        pageSize: options.pageSize,
        totalPages: 0,
        loadError: true,
      };
    }

    const rows = data as unknown as DbRecord[];
    const thumbnailByStoragePath = await loadMediaAssetThumbnails(supabase, rows);
    const total = count ?? 0;
    return {
      items: rows
        .map((row) => mapStory(row, thumbnailByStoragePath))
        .filter((item) => item.id),
      total,
      page: options.page,
      pageSize: options.pageSize,
      totalPages: total > 0 ? Math.ceil(total / options.pageSize) : 0,
      loadError: false,
    };
  } catch {
    return {
      items: [],
      total: 0,
      page: options.page,
      pageSize: options.pageSize,
      totalPages: 0,
      loadError: true,
    };
  }
}

export async function listPublicStoryTopics(): Promise<
  PublicStoryTopicOption[]
> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("story_topics")
      .select("topic_key, name_th, name_en")
      .eq("is_active", true)
      .order("display_order", { ascending: true });
    if (error || !Array.isArray(data)) return [];
    return (data as DbRecord[])
      .map((row) => ({
        key: text(row.topic_key),
        name: text(row.name_th, text(row.name_en)),
      }))
      .filter((topic) => topic.key && topic.name);
  } catch {
    return [];
  }
}

export async function listMyStories(touristId: string, options?: { limit?: number }): Promise<PublicStoryCard[]> {
  const limit = options?.limit ?? 12;
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("travel_stories")
      .select(`story_id, slug, title, excerpt, category, published_at, created_at, author_type, status, tourists (display_name), provinces (province_name_th, province_name_en), content_media (storage_path, alt_text_th, alt_text_en, is_cover, is_active, lifecycle_status, display_order)`)
      .eq("author_type", "tourist")
      .eq("tourist_id", touristId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error || !data || data.length === 0) return [];
    const results = (data as DbRecord[])
      .map((row) => mapStory(row))
      .filter((item) => item.id);
    return results;
  } catch {
    return [];
  }
}

async function listCuratedStoryRelations(
  sourceStoryId: number
): Promise<Array<{ slug: string; order: number; reason: string | null }>> {
  if (!Number.isInteger(sourceStoryId) || sourceStoryId <= 0) return [];
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("story_recommendations")
      .select(`
        display_order,
        reason,
        target_story:travel_stories!story_recommendations_target_story_id_fkey (
          slug
        )
      `)
      .eq("source_story_id", sourceStoryId)
      .eq("is_active", true)
      .order("display_order", { ascending: true });
    if (error || !Array.isArray(data)) return [];
    return (data as unknown as DbRecord[])
      .map((row) => ({
        slug: text(one(row.target_story)?.slug),
        order: numberValue(row.display_order),
        reason: text(row.reason) || null,
      }))
      .filter((relation) => relation.slug);
  } catch {
    return [];
  }
}

async function listStoryAttractionKeys(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  storyIds: number[],
  liveProvinceIds: number[],
): Promise<Map<number, string[]>> {
  const ids = Array.from(
    new Set(storyIds.filter((id) => Number.isInteger(id) && id > 0)),
  );
  if (ids.length === 0 || liveProvinceIds.length === 0) return new Map();

  const { data, error } = await supabase
    .from("attraction_related_stories")
    .select("story_id, attractions!inner(slug)")
    .in("story_id", ids)
    .eq("attractions.is_published", true)
    .eq("attractions.is_active", true)
    .in("attractions.province_id", liveProvinceIds);
  if (error || !Array.isArray(data)) return new Map();

  const keys = new Map<number, string[]>();
  (data as unknown as DbRecord[]).forEach((row) => {
    const storyId = numberValue(row.story_id);
    const slug = text(one(row.attractions)?.slug);
    if (!storyId || !slug) return;
    keys.set(storyId, [...(keys.get(storyId) ?? []), slug]);
  });
  return keys;
}

async function listPublicStoryDestinations(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  storyId: number,
  liveProvinceIds: number[],
): Promise<PublicStoryDestination[]> {
  if (!Number.isInteger(storyId) || storyId <= 0 || liveProvinceIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("attraction_related_stories")
    .select(`
      display_order,
      attractions!inner (
        attraction_id,
        slug,
        name_th,
        name_en,
        province_id,
        is_published,
        is_active,
        provinces (province_name_th, province_name_en),
        content_media (
          storage_path,
          alt_text_th,
          alt_text_en,
          is_cover,
          is_active,
          lifecycle_status,
          display_order
        )
      )
    `)
    .eq("story_id", storyId)
    .eq("attractions.is_published", true)
    .eq("attractions.is_active", true)
    .in("attractions.province_id", liveProvinceIds)
    .order("display_order", { ascending: true });
  if (error || !Array.isArray(data)) return [];

  const attractionRows = (data as unknown as DbRecord[])
    .map((row) => one(row.attractions))
    .filter((row): row is DbRecord => Boolean(row));
  const thumbnails = await loadMediaAssetThumbnails(supabase, attractionRows);

  return attractionRows.flatMap((row) => {
    const slug = text(row.slug);
    const name = text(row.name_th, text(row.name_en));
    if (!slug || !name) return [];
    const province = one(row.provinces);
    return [{
      slug,
      name,
      province: text(
        province?.province_name_th,
        text(province?.province_name_en),
      ),
      imageUrl: publicManagedImage(row, thumbnails),
      imageAlt: publicImageAlt(row, name),
    }];
  });
}

export async function getPublicStory(slug: string): Promise<PublicStoryData | null> {
  try {
    const supabase = await createSupabaseServerClient();
    const liveProvinceIds = await listLiveDestinationProvinceIds();
    if (liveProvinceIds.length === 0) return null;
    const { data, error } = await supabase
      .from("travel_stories")
      .select(`
        story_id,
        slug,
        title,
        excerpt,
        content,
        content_document,
        content_schema_version,
        category,
        published_at,
        created_at,
        updated_at,
        author_type,
        reading_minutes,
        primary_language,
        seo_title,
        seo_description,
        tourists (display_name),
        provinces (province_name_th, province_name_en),
        content_media (
          storage_path,
          alt_text_th,
          alt_text_en,
          is_cover,
          is_active,
          lifecycle_status,
          display_order
        ),
        story_topic_links (
          is_primary,
          story_topics (topic_key, name_th, name_en)
        )
      `)
      .eq("slug", slug)
      .eq("status", "published")
      .eq("is_published", true)
      .eq("geographic_scope", "province")
      .or(`province_id.is.null,province_id.in.(${liveProvinceIds.join(",")})`)
      .maybeSingle();

    if (error) throw new Error("PUBLIC_STORY_QUERY_FAILED");
    if (!data) return null;

    const sourceRow = data as DbRecord;
    const story = mapStoryDetail(sourceRow);
    const sourceStoryId = numberValue(sourceRow.story_id);
    const curatedRelations = await listCuratedStoryRelations(
      sourceStoryId
    );
    const [curatedStories, latestStories] = await Promise.all([
      curatedRelations.length > 0
        ? listPublicStories({
            featuredSlugs: curatedRelations.map((relation) => relation.slug),
            limit: curatedRelations.length,
          })
        : Promise.resolve([]),
      listPublicStories({ limit: 24 }),
    ]);
    const curatedBySlug = new Map(
      curatedRelations.map((relation) => [relation.slug, relation])
    );
    const candidates = [...curatedStories, ...latestStories];
    const candidateBySlug = new Map(
      candidates.map((candidate) => [candidate.id, candidate])
    );
    const engagementSignals = await listStoryEngagementSignals(
      candidates.flatMap((candidate) =>
        candidate.storyId ? [candidate.storyId] : []
      )
    );
    const attractionKeys = await listStoryAttractionKeys(
      supabase,
      [sourceStoryId, ...candidates.map((candidate) => candidate.storyId)],
      liveProvinceIds,
    );
    const ranked = rankStoryRecommendations(
      {
        id: story.id,
        province: story.province,
        topicKey: story.primaryTopic?.key ?? null,
        publishedAt: story.publishedAt,
        publicReady: true,
        attractionKeys: attractionKeys.get(sourceStoryId) ?? [],
      },
      candidates.map((candidate) => {
        const curated = curatedBySlug.get(candidate.id);
        const engagement = candidate.storyId
          ? engagementSignals.get(candidate.storyId)
          : undefined;
        return {
          id: candidate.id,
          province: candidate.province,
          topicKey: candidate.primaryTopic?.key ?? null,
          publishedAt: candidate.publishedAt,
          publicReady: Boolean(candidate.id),
          attractionKeys: attractionKeys.get(candidate.storyId) ?? [],
          engagementScore: engagement?.engagementScore,
          engagementSampleSize: engagement?.engagementSampleSize,
          ...(curated
            ? {
                curatedOrder: curated.order,
                curatedReason: curated.reason,
              }
            : {}),
        };
      }),
      { limit: 3 }
    );
    const relatedStories = ranked.flatMap((recommendation) => {
      const candidate = candidateBySlug.get(recommendation.id);
      return candidate
        ? [
            {
              story: candidate,
              reasonKey: recommendation.reasonKey,
              reasonLabel: recommendation.reasonLabel,
            },
          ]
        : [];
    });
    const relatedDestinations = await listPublicStoryDestinations(
      supabase,
      sourceStoryId,
      liveProvinceIds,
    );

    return { story, relatedStories, relatedDestinations };
  } catch (error) {
    if (error instanceof Error && error.message === "PUBLIC_STORY_QUERY_FAILED") {
      throw error;
    }
    throw new Error("PUBLIC_STORY_QUERY_FAILED", { cause: error });
  }
}

export type PublicRestaurantCategory = {
  categoryId: number;
  slug: string;
  name: string;
  nameEn: string | null;
  sectionKey: "local" | "meals" | "cafes" | "other";
  displayOrder: number;
  isFeatured: boolean;
  count?: number;
};

export type PublicRestaurantCard = {
  slug: string;
  name: string;
  province: string;
  foodType: string;
  description: string;
  imageUrl: string | null;
  imageAlt: string;
  categories?: PublicRestaurantCategory[];
};

export const PUBLIC_HOSPITALITY_MAX_PAGE = 10_000;

export type PublicHospitalityListingState = "available" | "empty" | "unavailable";

export type PublicRestaurantPageInput = {
  query?: string;
  foodType?: string;
  categorySlug?: string;
  province?: string;
  page: number;
  pageSize: number;
};

export type PublicAccommodationPageInput = {
  query?: string;
  accommodationType?: string;
  province?: string;
  page: number;
  pageSize: number;
};

export type PublicHospitalityPage<T> = {
  items: T[];
  total: number;
  page: number;
  pageCount: number;
  state: PublicHospitalityListingState;
};

type PublicHospitalityRelatedAttraction = {
  slug: string;
  name: string;
  distanceText: string | null;
  imageUrl: string | null;
  imageAlt: string;
};

export type PublicRestaurantDetail = {
  restaurantId: number;
  slug: string;
  name: string;
  province: string;
  provinceId: number;
  foodType: string | null;
  description: string | null;
  addressText: string | null;
  openingHours: string | null;
  contactInfo: string | null;
  latitude: number | null;
  longitude: number | null;
  imageUrl: string | null;
  imageAlt: string;
  isPublished: boolean;
  nearbyAttractions: PublicHospitalityRelatedAttraction[];
};

function mapPublicHospitalityAttractions(
  links: DbRecord[],
  liveProvinceIds: Set<number>,
  thumbnailByStoragePath: Map<string, string>,
): PublicHospitalityRelatedAttraction[] {
  return links
    .slice()
    .sort((left, right) => numberValue(left.display_order) - numberValue(right.display_order))
    .flatMap((link) => {
      const attraction = one(link.attractions);
      const slug = text(attraction?.slug);
      const provinceId = numberValue(attraction?.province_id);
      if (
        !attraction
        || !slug
        || attraction.is_published !== true
        || attraction.is_active === false
        || !liveProvinceIds.has(provinceId)
      ) {
        return [];
      }

      const name = text(attraction.name_th, text(attraction.name_en, slug));
      return [{
        slug,
        name,
        distanceText: text(link.distance_text) || null,
        imageUrl: publicManagedImage(attraction, thumbnailByStoragePath),
        imageAlt: publicImageAlt(attraction, name),
      }];
    });
}

function mapRestaurantRow(
  row: DbRecord,
  thumbnailByStoragePath?: Map<string, string>,
): PublicRestaurantCard {
  const province = one(row.provinces);
  const name = text(row.name_th, text(row.name_en, ""));
  const categories = records(row.restaurant_category_assignments)
    .slice()
    .sort((left, right) => numberValue(left.display_order) - numberValue(right.display_order))
    .flatMap((assignment) => {
      const category = one(assignment.restaurant_categories);
      const categoryId = numberValue(category?.category_id);
      const slug = text(category?.slug);
      if (!category || !categoryId || !slug || category.is_active === false) return [];
      const sectionKey = text(category.section_key, "other");
      return [{
        categoryId,
        slug,
        name: text(category.name_th, text(category.name_en, slug)),
        nameEn: text(category.name_en) || null,
        sectionKey: (["local", "meals", "cafes", "other"].includes(sectionKey) ? sectionKey : "other") as PublicRestaurantCategory["sectionKey"],
        displayOrder: numberValue(category.display_order),
        isFeatured: category.is_featured === true,
      }];
    });
  return {
    slug: text(row.slug),
    name,
    province: text(province?.province_name_th, text(province?.province_name_en, "")),
    foodType: categories[0]?.nameEn ?? categories[0]?.name ?? text(row.food_type, "Local"),
    description: text(row.description_th, text(row.description_en, "")),
    imageUrl: publicManagedImage(row, thumbnailByStoragePath),
    imageAlt: `${name} restaurant image`,
    categories,
  };
}

const publicRestaurantCategorySelect = `
  restaurant_category_assignments (
    display_order,
    restaurant_categories (
      category_id,
      slug,
      name_th,
      name_en,
      section_key,
      display_order,
      is_featured,
      is_active
    )
  )
`;

async function publicRestaurantIdsForCategory(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  categorySlug: string,
): Promise<number[]> {
  const { data: category, error: categoryError } = await supabase
    .from("restaurant_categories")
    .select("category_id")
    .eq("slug", categorySlug)
    .eq("is_active", true)
    .maybeSingle();
  if (categoryError) throw new Error("PUBLIC_RESTAURANT_CATEGORY_QUERY_FAILED");
  if (!category) return [];

  const { data, error } = await supabase
    .from("restaurant_category_assignments")
    .select("restaurant_id")
    .eq("category_id", numberValue(one(category)?.category_id));
  if (error) throw new Error("PUBLIC_RESTAURANT_CATEGORY_QUERY_FAILED");
  return Array.from(new Set((data ?? []).map((row) => numberValue(one(row)?.restaurant_id)).filter(Boolean)));
}

function normalizeHospitalityPage(page: number) {
  return Number.isSafeInteger(page)
    && page > 0
    && page <= PUBLIC_HOSPITALITY_MAX_PAGE
    ? page
    : 1;
}

function normalizeHospitalityPageSize(pageSize: number) {
  return Number.isInteger(pageSize) && pageSize > 0 ? Math.min(pageSize, 48) : 12;
}

function unavailableHospitalityPage<T>(page: number): PublicHospitalityPage<T> {
  return { items: [], total: 0, page, pageCount: 0, state: "unavailable" };
}

export async function listPublicRestaurantPage(
  input: PublicRestaurantPageInput,
): Promise<PublicHospitalityPage<PublicRestaurantCard>> {
  const page = normalizeHospitalityPage(input.page);
  const pageSize = normalizeHospitalityPageSize(input.pageSize);

  try {
    const supabase = await createSupabaseServerClient();
    const liveProvinces = await listLiveDestinationProvinces();
    const liveProvinceIds = liveProvinces.map((province) => province.provinceId);
    if (liveProvinceIds.length === 0) {
      return { items: [], total: 0, page, pageCount: 0, state: "empty" };
    }

    const provinceFilter = sanitizeDestinationProvinceFilter(
      input.province,
      liveProvinces.map((province) => ({ province_name_en: province.nameEn })),
    );
    let query = supabase
      .from("restaurants")
      .select(`
        restaurant_id,
        slug,
        name_th,
        name_en,
        description_th,
        description_en,
        food_type,
        ${publicRestaurantCategorySelect},
        provinces!inner (province_name_th, province_name_en),
        content_media (storage_path, alt_text_th, alt_text_en, is_cover, is_active, lifecycle_status, display_order)
      `, { count: "exact" })
      .eq("is_published", true)
      .eq("is_active", true)
      .in("province_id", liveProvinceIds);

    const search = input.query ? escapeIlikePattern(input.query.slice(0, 100)) : "";
    if (search) {
      query = query.or(
        `name_th.ilike.%${search}%,name_en.ilike.%${search}%,slug.ilike.%${search}%`,
      );
    }
    if (provinceFilter) query = query.eq("provinces.province_name_en", provinceFilter);
    const categorySlug = text(input.categorySlug).slice(0, 100);
    if (categorySlug) {
      const restaurantIds = await publicRestaurantIdsForCategory(supabase, categorySlug);
      if (restaurantIds.length === 0) {
        return { items: [], total: 0, page, pageCount: 0, state: "empty" };
      }
      query = query.in("restaurant_id", restaurantIds);
    }
    const foodType = text(input.foodType).slice(0, 100);
    if (!categorySlug && foodType) query = query.ilike("food_type", `%${escapeIlikePattern(foodType)}%`);

    const from = (page - 1) * pageSize;
    const { data, error, count } = await query
      .order("name_th", { ascending: true })
      .order("restaurant_id", { ascending: true })
      .range(from, from + pageSize - 1);

    if (error) return unavailableHospitalityPage(page);
    const rows = (data ?? []) as DbRecord[];
    const thumbnailByStoragePath = await loadMediaAssetThumbnails(supabase, rows);
    const items = rows.map((row) => mapRestaurantRow(row, thumbnailByStoragePath));
    const total = typeof count === "number" ? count : 0;

    return {
      items,
      total,
      page,
      pageCount: total > 0 ? Math.ceil(total / pageSize) : 0,
      state: total > 0 ? "available" : "empty",
    };
  } catch {
    return unavailableHospitalityPage(page);
  }
}

export type PublicRestaurantFoodTypeAvailability = {
  values: string[];
  state: "available" | "unavailable";
};

export type PublicRestaurantCategoryAvailability = {
  items: PublicRestaurantCategory[];
  state: "available" | "unavailable";
};

export async function listAvailablePublicRestaurantCategories(options?: {
  province?: string;
}): Promise<PublicRestaurantCategoryAvailability> {
  try {
    const supabase = await createSupabaseServerClient();
    const liveProvinces = await listLiveDestinationProvinces();
    const provinceFilter = sanitizeDestinationProvinceFilter(
      options?.province,
      liveProvinces.map((province) => ({ province_name_en: province.nameEn })),
    );
    const { data, error } = await supabase.rpc("list_public_restaurant_categories", {
      p_province_en: provinceFilter ?? null,
    });
    if (error) return { items: [], state: "unavailable" };
    const items = ((data ?? []) as DbRecord[]).flatMap((category) => {
      const categoryId = numberValue(category.category_id);
      const count = numberValue(category.restaurant_count);
      if (!categoryId || count === 0) return [];
      const sectionKey = text(category.section_key, "other");
      return [{
        categoryId,
        slug: text(category.slug),
        name: text(category.name_th, text(category.name_en)),
        nameEn: text(category.name_en) || null,
        sectionKey: (["local", "meals", "cafes", "other"].includes(sectionKey) ? sectionKey : "other") as PublicRestaurantCategory["sectionKey"],
        displayOrder: numberValue(category.display_order),
        isFeatured: category.is_featured === true,
        count,
      }];
    });
    return { items, state: "available" };
  } catch {
    return { items: [], state: "unavailable" };
  }
}

export async function listAvailablePublicRestaurantFoodTypes(options?: {
  province?: string;
}): Promise<PublicRestaurantFoodTypeAvailability> {
  try {
    const supabase = await createSupabaseServerClient();
    const liveProvinces = await listLiveDestinationProvinces();
    const liveProvinceIds = liveProvinces.map((province) => province.provinceId);
    if (liveProvinceIds.length === 0) return { values: [], state: "available" };

    const provinceFilter = sanitizeDestinationProvinceFilter(
      options?.province,
      liveProvinces.map((province) => ({ province_name_en: province.nameEn })),
    );
    let query = supabase
      .from("restaurants")
      .select("food_type, provinces!inner (province_name_en)")
      .eq("is_published", true)
      .eq("is_active", true)
      .in("province_id", liveProvinceIds);

    if (provinceFilter) query = query.eq("provinces.province_name_en", provinceFilter);

    const { data, error } = await query
      .order("food_type", { ascending: true })
      .limit(1000);

    if (error) return { values: [], state: "unavailable" };

    const values = Array.from(new Set(
      ((data ?? []) as DbRecord[])
        .map((row) => text(row.food_type).trim())
        .filter(Boolean),
    ));
    return { values, state: "available" };
  } catch {
    return { values: [], state: "unavailable" };
  }
}

export async function listPublicRestaurants(options?: { search?: string; foodType?: string; categorySlug?: string; province?: string; featuredSlugs?: string[] }): Promise<PublicRestaurantCard[]> {
  try {
    const supabase = await createSupabaseServerClient();
    const liveProvinces = await listLiveDestinationProvinces();
    const liveProvinceIds = liveProvinces.map((province) => province.provinceId);
    if (liveProvinceIds.length === 0) return [];
    const provinceFilter = sanitizeDestinationProvinceFilter(
      options?.province,
      liveProvinces.map((province) => ({ province_name_en: province.nameEn })),
    );
    let query = supabase
      .from("restaurants")
      .select(`
        slug,
        name_th,
        name_en,
        description_th,
        description_en,
        food_type,
        ${publicRestaurantCategorySelect},
        provinces!inner (province_name_th, province_name_en),
        content_media (storage_path, alt_text_th, alt_text_en, is_cover, is_active, lifecycle_status, display_order)
      `)
      .eq("is_published", true)
      .eq("is_active", true)
      .in("province_id", liveProvinceIds);

    if (options?.search) {
      query = query.or(`name_th.ilike.%${options.search}%,name_en.ilike.%${options.search}%`);
    }

    if (options?.foodType) {
      query = query.ilike("food_type", `%${options.foodType}%`);
    }

    if (options?.categorySlug) {
      const restaurantIds = await publicRestaurantIdsForCategory(supabase, options.categorySlug);
      if (restaurantIds.length === 0) return [];
      query = query.in("restaurant_id", restaurantIds);
    }

    if (options?.featuredSlugs && options.featuredSlugs.length > 0) {
      query = query.in("slug", options.featuredSlugs);
    } else if (provinceFilter) {
      query = query.eq('provinces.province_name_en', provinceFilter);
    }

    const { data, error } = await query
      .order("name_th", { ascending: true })
      .limit(options?.featuredSlugs ? options.featuredSlugs.length : 50);

    if (error || !data || data.length === 0) return [];
    const results = (data as DbRecord[]).map((row) => mapRestaurantRow(row));

    if (options?.featuredSlugs && options.featuredSlugs.length > 0) {
      return results.sort((a, b) => options.featuredSlugs!.indexOf(a.slug) - options.featuredSlugs!.indexOf(b.slug));
    }
    return results;
  } catch {
    return [];
  }
}

export async function getPublicRestaurantDetail(slug: string): Promise<PublicRestaurantDetail | null> {
  try {
    const supabase = await createSupabaseServerClient();
    const liveProvinceIds = await listLiveDestinationProvinceIds();
    if (liveProvinceIds.length === 0) return null;
    const { data, error } = await supabase
      .from("restaurants")
      .select(`
        restaurant_id,
        province_id,
        slug,
        name_th,
        name_en,
        description_th,
        description_en,
        food_type,
        latitude,
        longitude,
        address_text,
        opening_hours,
        contact_info,
        is_published,
        is_active,
        provinces (province_name_th, province_name_en, province_id),
        content_media (storage_path, alt_text_th, alt_text_en, is_cover, is_active, lifecycle_status, display_order),
        restaurant_attractions (
          display_order,
          distance_text,
          attractions (
            slug,
            name_th,
            name_en,
            province_id,
            is_published,
            is_active,
            content_media (storage_path, alt_text_th, alt_text_en, is_cover, is_active, lifecycle_status, display_order)
          )
        )
      `)
      .eq("slug", slug)
      .eq("is_published", true)
      .eq("is_active", true)
      .in("province_id", liveProvinceIds)
      .maybeSingle();

    if (error) throw new Error("PUBLIC_RESTAURANT_DETAIL_FAILED");
    if (!data) return null;

    const row = data as DbRecord & { restaurant_attractions?: DbRecord[] };
    const province = one(row.provinces);
    const relatedRows = Array.isArray(row.restaurant_attractions)
      ? (row.restaurant_attractions as DbRecord[])
          .map((link) => one(link.attractions))
          .filter((attraction): attraction is DbRecord => Boolean(attraction))
      : [];
    const thumbnailByStoragePath = await loadMediaAssetThumbnails(supabase, relatedRows);
    const nearbyAttractions = mapPublicHospitalityAttractions(
      Array.isArray(row.restaurant_attractions) ? row.restaurant_attractions as DbRecord[] : [],
      new Set(liveProvinceIds),
      thumbnailByStoragePath,
    );
    const name = text(row.name_th, text(row.name_en, slug));

    return {
      restaurantId: numberValue(row.restaurant_id),
      slug: text(row.slug, slug),
      name,
      province: text(province?.province_name_th, text(province?.province_name_en, "")),
      provinceId: Number(province?.province_id ?? 0),
      foodType: text(row.food_type) || null,
      description: text(row.description_th, text(row.description_en)) || null,
      addressText: text(row.address_text) || null,
      openingHours: text(row.opening_hours) || null,
      contactInfo: text(row.contact_info) || null,
      latitude: row.latitude === null || row.latitude === undefined ? null : numberValue(row.latitude),
      longitude: row.longitude === null || row.longitude === undefined ? null : numberValue(row.longitude),
      imageUrl: publicManagedImage(row),
      imageAlt: publicImageAlt(row, name),
      isPublished: Boolean(row.is_published),
      nearbyAttractions,
    };
  } catch {
    throw new Error("PUBLIC_RESTAURANT_DETAIL_FAILED");
  }
}

export type PublicAccommodationCard = {
  slug: string;
  name: string;
  province: string;
  accommodationType: string;
  description: string;
  imageUrl: string | null;
  imageAlt: string;
  priceRange?: string;
};

function mapAccommodationRow(
  row: DbRecord,
  thumbnailByStoragePath?: Map<string, string>,
): PublicAccommodationCard {
  const province = one(row.provinces);
  const name = text(row.name_th, text(row.name_en, ""));
  return {
    slug: text(row.slug),
    name,
    province: text(province?.province_name_th, text(province?.province_name_en, "")),
    accommodationType: text(row.accommodation_type, "Accommodation"),
    description: text(row.description_th, text(row.description_en, "")),
    imageUrl: publicManagedImage(row, thumbnailByStoragePath),
    imageAlt: `${name} accommodation image`,
    priceRange: text(row.price_range)
  };
}

export async function listPublicAccommodationPage(
  input: PublicAccommodationPageInput,
): Promise<PublicHospitalityPage<PublicAccommodationCard>> {
  const page = normalizeHospitalityPage(input.page);
  const pageSize = normalizeHospitalityPageSize(input.pageSize);

  try {
    const supabase = await createSupabaseServerClient();
    const liveProvinces = await listLiveDestinationProvinces();
    const liveProvinceIds = liveProvinces.map((province) => province.provinceId);
    if (liveProvinceIds.length === 0) {
      return { items: [], total: 0, page, pageCount: 0, state: "empty" };
    }

    const provinceFilter = sanitizeDestinationProvinceFilter(
      input.province,
      liveProvinces.map((province) => ({ province_name_en: province.nameEn })),
    );
    let query = supabase
      .from("accommodations")
      .select(`
        accommodation_id,
        slug,
        name_th,
        name_en,
        description_th,
        description_en,
        accommodation_type,
        price_range,
        provinces!inner (province_name_th, province_name_en),
        content_media (storage_path, alt_text_th, alt_text_en, is_cover, is_active, lifecycle_status, display_order)
      `, { count: "exact" })
      .eq("is_published", true)
      .eq("is_active", true)
      .in("province_id", liveProvinceIds);

    const search = input.query ? escapeIlikePattern(input.query.slice(0, 100)) : "";
    if (search) {
      query = query.or(
        `name_th.ilike.%${search}%,name_en.ilike.%${search}%,slug.ilike.%${search}%`,
      );
    }
    if (provinceFilter) query = query.eq("provinces.province_name_en", provinceFilter);
    const accommodationType = text(input.accommodationType).slice(0, 100);
    if (accommodationType) query = query.eq("accommodation_type", accommodationType);

    const from = (page - 1) * pageSize;
    const { data, error, count } = await query
      .order("name_th", { ascending: true })
      .order("accommodation_id", { ascending: true })
      .range(from, from + pageSize - 1);

    if (error) return unavailableHospitalityPage(page);
    const rows = (data ?? []) as DbRecord[];
    const thumbnailByStoragePath = await loadMediaAssetThumbnails(supabase, rows);
    const items = rows.map((row) => mapAccommodationRow(row, thumbnailByStoragePath));
    const total = typeof count === "number" ? count : 0;

    return {
      items,
      total,
      page,
      pageCount: total > 0 ? Math.ceil(total / pageSize) : 0,
      state: total > 0 ? "available" : "empty",
    };
  } catch {
    return unavailableHospitalityPage(page);
  }
}

export async function listPublicAccommodations(options?: { search?: string; province?: string; featuredSlugs?: string[] }): Promise<PublicAccommodationCard[]> {
  try {
    const supabase = await createSupabaseServerClient();
    const liveProvinces = await listLiveDestinationProvinces();
    const liveProvinceIds = liveProvinces.map((province) => province.provinceId);
    if (liveProvinceIds.length === 0) return [];
    const provinceFilter = sanitizeDestinationProvinceFilter(
      options?.province,
      liveProvinces.map((province) => ({ province_name_en: province.nameEn })),
    );
    let query = supabase
      .from("accommodations")
      .select(`
        slug,
        name_th,
        name_en,
        description_th,
        description_en,
        accommodation_type,
        price_range,
        provinces!inner (province_name_th, province_name_en),
        content_media (storage_path, alt_text_th, alt_text_en, is_cover, is_active, lifecycle_status, display_order)
      `)
      .eq("is_published", true)
      .eq("is_active", true)
      .in("province_id", liveProvinceIds);

    if (options?.search) {
      query = query.or(`name_th.ilike.%${options.search}%,name_en.ilike.%${options.search}%`);
    }

    if (options?.featuredSlugs && options.featuredSlugs.length > 0) {
      query = query.in("slug", options.featuredSlugs);
    } else if (provinceFilter) {
      query = query.eq('provinces.province_name_en', provinceFilter);
    }

    const { data, error } = await query
      .order("name_th", { ascending: true })
      .limit(options?.featuredSlugs ? options.featuredSlugs.length : 50);

    if (error || !data || data.length === 0) return [];
    const results = (data as DbRecord[]).map((row) => mapAccommodationRow(row));

    if (options?.featuredSlugs && options.featuredSlugs.length > 0) {
      return results.sort((a, b) => options.featuredSlugs!.indexOf(a.slug) - options.featuredSlugs!.indexOf(b.slug));
    }
    return results;
  } catch {
    return [];
  }
}

export type PublicAccommodationDetail = {
  accommodationId: number;
  slug: string;
  name: string;
  province: string;
  provinceId: number;
  accommodationType: string | null;
  description: string | null;
  addressText: string | null;
  contactInfo: string | null;
  priceRange: string | null;
  latitude: number | null;
  longitude: number | null;
  imageUrl: string | null;
  imageAlt: string;
  isPublished: boolean;
  nearbyAttractions: PublicHospitalityRelatedAttraction[];
};

export async function getPublicAccommodationDetail(slug: string): Promise<PublicAccommodationDetail | null> {
  try {
    const supabase = await createSupabaseServerClient();
    const liveProvinceIds = await listLiveDestinationProvinceIds();
    if (liveProvinceIds.length === 0) return null;
    const { data, error } = await supabase
      .from("accommodations")
      .select(`
        accommodation_id,
        province_id,
        slug,
        name_th,
        name_en,
        description_th,
        description_en,
        accommodation_type,
        latitude,
        longitude,
        address_text,
        contact_info,
        price_range,
        is_published,
        is_active,
        provinces (province_name_th, province_name_en, province_id),
        content_media (storage_path, alt_text_th, alt_text_en, is_cover, is_active, lifecycle_status, display_order),
        attraction_related_accommodations (
          display_order,
          attractions (
            slug,
            name_th,
            name_en,
            province_id,
            is_published,
            is_active,
            content_media (storage_path, alt_text_th, alt_text_en, is_cover, is_active, lifecycle_status, display_order)
          )
        )
      `)
      .eq("slug", slug)
      .eq("is_published", true)
      .eq("is_active", true)
      .in("province_id", liveProvinceIds)
      .maybeSingle();

    if (error) throw new Error("PUBLIC_ACCOMMODATION_DETAIL_FAILED");
    if (!data) return null;

    const row = data as DbRecord & { attraction_related_accommodations?: DbRecord[] };
    const province = one(row.provinces);
    const relatedRows = Array.isArray(row.attraction_related_accommodations)
      ? (row.attraction_related_accommodations as DbRecord[])
          .map((link) => one(link.attractions))
          .filter((attraction): attraction is DbRecord => Boolean(attraction))
      : [];
    const thumbnailByStoragePath = await loadMediaAssetThumbnails(supabase, relatedRows);
    const nearbyAttractions = mapPublicHospitalityAttractions(
      Array.isArray(row.attraction_related_accommodations)
        ? row.attraction_related_accommodations as DbRecord[]
        : [],
      new Set(liveProvinceIds),
      thumbnailByStoragePath,
    );
    const name = text(row.name_th, text(row.name_en, slug));

    return {
      accommodationId: numberValue(row.accommodation_id),
      slug: text(row.slug, slug),
      name,
      province: text(province?.province_name_th, text(province?.province_name_en, "")),
      provinceId: Number(province?.province_id ?? 0),
      accommodationType: text(row.accommodation_type) || null,
      description: text(row.description_th, text(row.description_en)) || null,
      addressText: text(row.address_text) || null,
      contactInfo: text(row.contact_info) || null,
      priceRange: text(row.price_range) || null,
      latitude: row.latitude === null || row.latitude === undefined ? null : numberValue(row.latitude),
      longitude: row.longitude === null || row.longitude === undefined ? null : numberValue(row.longitude),
      imageUrl: publicManagedImage(row),
      imageAlt: publicImageAlt(row, name),
      isPublished: Boolean(row.is_published),
      nearbyAttractions,
    };
  } catch {
    throw new Error("PUBLIC_ACCOMMODATION_DETAIL_FAILED");
  }
}

export type PublicRouteCard = {
  slug: string;
  name: string;
  description: string;
  days: number;
  stopCount: number;
  imageUrl: string | null;
  imageAlt: string;
};

function mapPublicRouteCard(
  row: DbRecord,
  thumbnailByStoragePath: Map<string, string>,
): PublicRouteCard {
  const stops = Array.isArray(row.suggested_route_stops)
    ? row.suggested_route_stops as DbRecord[]
    : [];
  const name = text(row.name_th, text(row.name_en));

  return {
    slug: text(row.slug),
    name,
    description: text(row.description_th, text(row.description_en)),
    days: Math.max(1, ...stops.map((stop) => numberValue(stop.day_number, 1))),
    stopCount: stops.length,
    imageUrl: publicManagedImage(row, thumbnailByStoragePath),
    imageAlt: publicImageAlt(row, name),
  };
}

export async function listPublicRoutes(limit = 10, featuredSlugs?: string[]): Promise<PublicRouteCard[]> {
  try {
    const supabase = await createSupabaseServerClient();
    const liveProvinceIds = await listLiveDestinationProvinceIds();
    if (liveProvinceIds.length === 0) return [];
    const liveProvinceIdSet = new Set(liveProvinceIds);
    const routeSelect = `
      slug,
      name_th,
      name_en,
      description_th,
      description_en,
      content_media (
        storage_path,
        media_type,
        alt_text_th,
        alt_text_en,
        is_cover,
        is_active,
        lifecycle_status,
        display_order
      ),
      suggested_route_stops (
        day_number,
        attractions (
          is_active,
          is_published,
          provinces (
            province_id,
            is_active,
            province_name_en
          )
        )
      )
    `;

    if (featuredSlugs && featuredSlugs.length > 0) {
      const { data: fd, error: fe } = await supabase
        .from("suggested_routes")
        .select(routeSelect)
        .in("slug", featuredSlugs)
        .eq("is_published", true)
        .eq("is_active", true)
        .limit(featuredSlugs.length);
      if (fe) throw new Error("PUBLIC_ROUTE_LIST_FAILED");
      if (fd && fd.length > 0) {
        const rows = (fd as DbRecord[])
          .filter((row) =>
            routeStopsArePublicForLaunch(
              row.suggested_route_stops,
              liveProvinceIdSet,
            ),
          );
        const thumbnailByStoragePath = await loadMediaAssetThumbnails(supabase, rows);
        const results = rows
          .map((row) => mapPublicRouteCard(row, thumbnailByStoragePath))
          .filter((route) => route.slug);
        return featuredSlugs.map(s => results.find(r => r.slug === s)).filter((r): r is PublicRouteCard => Boolean(r)).slice(0, limit);
      }
      return [];
    }

    const { data, error } = await supabase
      .from("suggested_routes")
      .select(routeSelect)
      .eq("is_published", true)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw new Error("PUBLIC_ROUTE_LIST_FAILED");
    if (!data) return [];

    const rows = (data as DbRecord[])
      .filter((row) =>
        routeStopsArePublicForLaunch(
          row.suggested_route_stops,
          liveProvinceIdSet,
        ),
      );
    const thumbnailByStoragePath = await loadMediaAssetThumbnails(supabase, rows);
    return rows
      .map((row) => mapPublicRouteCard(row, thumbnailByStoragePath))
      .filter((route) => route.slug);
  } catch {
    throw new Error("PUBLIC_ROUTE_LIST_FAILED");
  }
}

export type PublicRouteDetail = PublicRouteCard & {
  fullDescription: string;
  mapUrl: string | null;
  stops: PublicRouteStop[];
};

export async function getPublicRouteDetail(slug: string): Promise<PublicRouteDetail | null> {
  try {
    const supabase = await createSupabaseServerClient();
    const liveProvinceIds = await listLiveDestinationProvinceIds();
    if (liveProvinceIds.length === 0) return null;
    const liveProvinceIdSet = new Set(liveProvinceIds);
    const { data, error } = await supabase
      .from("suggested_routes")
      .select(`
        route_id,
        slug,
        name_th,
        name_en,
        description_th,
        description_en,
        content_media (
          storage_path,
          media_type,
          alt_text_th,
          alt_text_en,
          is_cover,
          is_active,
          lifecycle_status,
          display_order
        ),
        suggested_route_stops (
          day_number,
          display_order,
          attractions (
            attraction_id,
            is_active,
            is_published,
            name_th,
            name_en,
            slug,
            latitude,
            longitude,
            provinces (
              province_id,
              is_active,
              province_name_en
            ),
            content_media (
              storage_path,
              media_type,
              alt_text_th,
              alt_text_en,
              is_cover,
              is_active,
              lifecycle_status,
              display_order
            )
          )
        )
      `)
      .eq("slug", slug)
      .eq("is_published", true)
      .eq("is_active", true)
      .maybeSingle();

    if (error) throw new Error("PUBLIC_ROUTE_DETAIL_FAILED");
    if (!data) return null;

    const row = data as DbRecord;
    const stopsArray = Array.isArray(row.suggested_route_stops) ? (row.suggested_route_stops as DbRecord[]) : [];
    if (!routeStopsArePublicForLaunch(stopsArray, liveProvinceIdSet)) return null;

    const attractionRows = stopsArray.flatMap((stop) => {
      const attraction = one(stop.attractions);
      return attraction ? [attraction] : [];
    });
    const thumbnailByStoragePath = await loadMediaAssetThumbnails(
      supabase,
      [row, ...attractionRows],
    );
    const mappedStops = stopsArray.flatMap<PublicRouteStop>((stop) => {
      const attraction = one(stop.attractions);
      const attractionSlug = text(attraction?.slug);
      const attractionId = numberValue(attraction?.attraction_id);
      if (!attraction || !attractionSlug || attractionId <= 0) return [];
      const attractionName = text(attraction.name_th, text(attraction.name_en, attractionSlug));
      return [{
        attractionId,
        dayNumber: numberValue(stop.day_number, 1),
        sequence: numberValue(stop.display_order, 1),
        attractionName,
        attractionSlug,
        attractionImage: publicManagedImage(attraction, thumbnailByStoragePath),
        attractionImageAlt: publicImageAlt(attraction, attractionName),
        latitude: nullableNumber(attraction.latitude),
        longitude: nullableNumber(attraction.longitude),
      }];
    }).sort((a, b) => {
      if (a.dayNumber !== b.dayNumber) return a.dayNumber - b.dayNumber;
      return a.sequence - b.sequence;
    });

    if (mappedStops.length !== stopsArray.length) return null;
    const routeName = text(row.name_th, text(row.name_en));

    return {
      slug: text(row.slug),
      name: routeName,
      description: text(row.description_th, text(row.description_en)),
      fullDescription: text(row.description_th, text(row.description_en)),
      days: Math.max(1, ...mappedStops.map((stop) => stop.dayNumber)),
      stopCount: mappedStops.length,
      imageUrl: publicManagedImage(row, thumbnailByStoragePath),
      imageAlt: publicImageAlt(row, routeName),
      mapUrl: buildRouteDirectionsUrl(mappedStops),
      stops: mappedStops,
    };
  } catch {
    throw new Error("PUBLIC_ROUTE_DETAIL_FAILED");
  }
}

export type PublicVirtualTourCard = {
  attractionSlug: string;
  attractionName: string;
  province: string;
  mediaType: "panorama" | "video360" | "external_url";
  provider: "platform" | "external";
  href: string;
  previewImageUrl: string | null;
  previewImageAlt: string;
};

export async function listPublicVirtualTours(limit = 12): Promise<PublicVirtualTourCard[]> {
  try {
    const supabase = await createSupabaseServerClient();
    const liveProvinceIds = await listLiveDestinationProvinceIds();
    if (liveProvinceIds.length === 0) return [];

    const { data, error } = await supabase
      .from("attractions")
      .select(`
        attraction_id,
        province_id,
        slug,
        name_th,
        name_en,
        is_active,
        is_published,
        provinces (province_id, province_name_th, province_name_en, is_active),
        content_media (
          storage_path,
          media_type,
          alt_text_th,
          alt_text_en,
          is_cover,
          is_active,
          lifecycle_status,
          display_order
        )
      `)
      .eq("is_published", true)
      .eq("is_active", true)
      .in("province_id", liveProvinceIds)
      .order("created_at", { ascending: false })
      .limit(Math.min(Math.max(limit * 3, limit), 60));

    if (error) throw new Error("PUBLIC_VIRTUAL_TOURS_FAILED");
    const rows = Array.isArray(data) ? data as DbRecord[] : [];
    const liveProvinceIdSet = new Set(liveProvinceIds);
    const thumbnailByStoragePath = await loadMediaAssetThumbnails(supabase, rows);

    return rows.flatMap<PublicVirtualTourCard>((row) => {
      const provinceId = numberValue(row.province_id);
      const province = one(row.provinces);
      const attractionSlug = text(row.slug);
      if (
        row.is_published !== true
        || row.is_active === false
        || !liveProvinceIdSet.has(provinceId)
        || !attractionSlug
      ) {
        return [];
      }

      const mediaRows = Array.isArray(row.content_media)
        ? row.content_media as unknown as PublicAttractionMediaRow[]
        : [];
      const selected = selectPublicAttractionMedia(mediaRows);
      const virtualTour = selected.virtualTour;
      if (!virtualTour) return [];

      const href = virtualTour.type === "panorama"
        ? virtualTour.url
        : safeExternalTourUrl(virtualTour.url);
      if (!href) return [];

      const attractionName = text(row.name_th, text(row.name_en, attractionSlug));
      return [{
        attractionSlug,
        attractionName,
        province: text(province?.province_name_th, text(province?.province_name_en, "ยะลา")),
        mediaType: virtualTour.type,
        provider: virtualTour.type === "panorama" ? "platform" : "external",
        href,
        previewImageUrl: publicManagedImage(row, thumbnailByStoragePath),
        previewImageAlt: publicImageAlt(row, attractionName),
      }];
    }).slice(0, limit);
  } catch {
    throw new Error("PUBLIC_VIRTUAL_TOURS_FAILED");
  }
}
