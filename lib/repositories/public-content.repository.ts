import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { siteMediaImageUrl } from "@/lib/media/storage-paths";
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
  imageUrl: string | null;
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
  slug: string;
  name: string;
  province: string;
  rating: number;
  reviewsCount: string;
  bestTimeToVisit: string;
  description: string;
  mainImage: string | null;
  gallery: string[];
  info: {
    region: string;
    population: string;
    language: string;
    currency: string;
    timeZone: string;
  };
  thingsToDo: PublicAttractionRelatedItem[];
  whereToStay: PublicAttractionRelatedItem[];
  foodAndDrink: PublicAttractionRelatedItem[];
  travelTips: string[];
  howToGetThere: string | null;
  addressText: string | null;
  latitude: number | null;
  longitude: number | null;
  articles: PublicAttractionRelatedItem[];
};

function one(value: unknown): DbRecord | null {
  if (Array.isArray(value)) return (value[0] as DbRecord | undefined) ?? null;
  return value && typeof value === "object" ? (value as DbRecord) : null;
}

function text(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim().length > 0 ? value : fallback;
}

function numberValue(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
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

function publicManagedStoryImage(row: DbRecord): string | null {
  const media = publicAttractionMedia(row);
  const storagePath = storagePathFromMedia(media);
  if (!storagePath || /^https?:\/\//i.test(storagePath)) return null;
  return imageUrlFromStoragePath(storagePath);
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

function mapStory(row: DbRecord): PublicStoryCard {
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
    imageUrl: publicManagedStoryImage(row),
    imageAlt: text(
      coverMedia?.alt_text_th,
      text(coverMedia?.alt_text_en, text(row.title, "ภาพประกอบเรื่องราว"))
    ),
    category: primaryTopicName || text(row.category, "เรื่องราว"),
    authorType: text(row.author_type, "admin"),
    authorName:
      row.author_type === "tourist"
        ? text(one(row.tourists)?.display_name, "นักเดินทาง")
        : "กองบรรณาธิการ",
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

export async function getPublicAttractionDetail(slug: string, options?: { previewMode?: boolean }): Promise<PublicAttractionDetail | null> {
  try {
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
        latitude,
        longitude,
        provinces (province_name_th, province_name_en),
        attraction_types (type_name_th, type_name_en),
        content_media (storage_path, alt_text_th, alt_text_en, is_cover, is_active, lifecycle_status, display_order)
      `)
      .eq("slug", slug);

    if (!options?.previewMode) {
      const liveProvinceIds = await listLiveDestinationProvinceIds();
      if (liveProvinceIds.length === 0) return null;
      query = query
        .eq("is_published", true)
        .eq("is_active", true)
        .in("province_id", liveProvinceIds);
    }

    const { data, error } = await query.maybeSingle();

    if (error || !data) return null;

    const row = data as DbRecord;
    const province = one(row.provinces);
    const name = text(row.name_th, text(row.name_en, "Untitled attraction"));
    const media = Array.isArray(row.content_media) ? (row.content_media as DbRecord[]) : [];
    const sortedMedia = [...media].sort((a, b) => numberValue(a.display_order) - numberValue(b.display_order));
    const images = sortedMedia
      .filter((item) => item.is_active !== false && text(item.lifecycle_status, "active") === "active")
      .map((item) => imageUrlFromStoragePath(item.storage_path))
      .filter(Boolean) as string[];

    const baseDetail: PublicAttractionDetail = {
      slug: text(row.slug, slug),
      name,
      province: text(province?.province_name_th, text(province?.province_name_en)),
      rating: 0,
      reviewsCount: "0",
      bestTimeToVisit: "Not specified",
      description: text(row.description_th, text(row.description_en, text(row.short_description_th, text(row.short_description_en)))),
      mainImage: images[0] ?? null,
      gallery: images.slice(0, 4),
      travelTips: row.travel_tips_th
        ? String(row.travel_tips_th).split('\n').map(s => s.trim()).filter(Boolean)
        : [],
      howToGetThere: text(row.how_to_get_there_th) || null,
      addressText: text(row.address_text) || null,
      latitude: row.latitude === null || row.latitude === undefined ? null : numberValue(row.latitude),
      longitude: row.longitude === null || row.longitude === undefined ? null : numberValue(row.longitude),
      info: {
        region: text(province?.province_name_en),
        population: "Not collected",
        language: "Thai, English, Malay future",
        currency: "Thai Baht (THB)",
        timeZone: "GMT+7"
      },
      thingsToDo: [],
      whereToStay: [],
      foodAndDrink: [],
      articles: []
    };

    const attractionId = numberValue(row.attraction_id);

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

    const provinceEn = text(province?.province_name_en, "");

    // 2. Fetch actual items using curated slugs, or fallback to province
    const [attractionsRes, restaurantsRes, accommodationsRes, storiesRes] = await Promise.all([
      curatedAttractionSlugs.length > 0
        ? listPublicAttractionCards(curatedAttractionSlugs.length, { featuredSlugs: curatedAttractionSlugs })
        : listPublicAttractionCards(5, { province: provinceEn }),
      curatedRestaurantSlugs.length > 0
        ? listPublicRestaurants({ featuredSlugs: curatedRestaurantSlugs })
        : listPublicRestaurants({ province: provinceEn }),
      curatedAccommodationSlugs.length > 0
        ? listPublicAccommodations({ featuredSlugs: curatedAccommodationSlugs })
        : listPublicAccommodations({ province: provinceEn }),
      curatedStorySlugs.length > 0
        ? listPublicStories({ limit: curatedStorySlugs.length, featuredSlugs: curatedStorySlugs })
        : listPublicStories({ limit: 4, province: provinceEn })
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
        category: r.foodType || "Restaurant"
      }));

    baseDetail.whereToStay = accommodationsRes
      .slice(0, 4)
      .map(a => ({
        id: a.slug,
        title: a.name,
        description: a.description,
        imageUrl: a.imageUrl,
        category: a.accommodationType || "Accommodation"
      }));

    baseDetail.articles = storiesRes
      .slice(0, 3)
      .map(s => ({
        id: s.id,
        title: s.title,
        description: s.excerpt,
        imageUrl: s.imageUrl,
        category: s.category,
        recommendationReason:
          curatedStorySlugs.length > 0
            ? "คัดเลือกให้เข้ากับสถานที่นี้"
            : `เรื่องราวจาก${baseDetail.province}`,
      }));

    return baseDetail;
  } catch {
    return null;
  }
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
    const results = (data as unknown as DbRecord[])
      .map(mapStory)
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

    const total = count ?? 0;
    return {
      items: (data as unknown as DbRecord[])
        .map(mapStory)
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
    const results = (data as DbRecord[]).map(mapStory).filter((item) => item.id);
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

export async function getPublicStory(slug: string): Promise<{ story: PublicStoryDetail; relatedStories: PublicStoryRecommendation[] } | null> {
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

    if (error || !data) return null;

    const sourceRow = data as DbRecord;
    const story = mapStoryDetail(sourceRow);
    const curatedRelations = await listCuratedStoryRelations(
      numberValue(sourceRow.story_id)
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
    const ranked = rankStoryRecommendations(
      {
        id: story.id,
        province: story.province,
        topicKey: story.primaryTopic?.key ?? null,
        publishedAt: story.publishedAt,
        publicReady: true,
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
          publicReady: Boolean(candidate.imageUrl),
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

    return { story, relatedStories };
  } catch {
    return null;
  }
}

export type PublicRestaurantCard = {
  slug: string;
  name: string;
  province: string;
  foodType: string;
  description: string;
  imageUrl: string | null;
  imageAlt: string;
  rating?: number;
  reviewCount?: number;
};

export type PublicRestaurantDetail = {
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
  isPublished: boolean;
  nearbyAttractions: {
    slug: string;
    name: string;
    distanceText: string | null;
    imageUrl: string | null;
  }[];
};

function mapRestaurantRow(row: DbRecord): PublicRestaurantCard {
  const province = one(row.provinces);
  const name = text(row.name_th, text(row.name_en, ""));
  return {
    slug: text(row.slug),
    name,
    province: text(province?.province_name_th, text(province?.province_name_en, "")),
    foodType: text(row.food_type, "Local"),
    description: text(row.description_th, text(row.description_en, "")),
    imageUrl: publicImage(row),
    imageAlt: `${name} restaurant image`
  };
}

export async function listPublicRestaurants(options?: { search?: string; foodType?: string; province?: string; featuredSlugs?: string[] }): Promise<PublicRestaurantCard[]> {
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

    if (options?.featuredSlugs && options.featuredSlugs.length > 0) {
      query = query.in("slug", options.featuredSlugs);
    } else if (provinceFilter) {
      query = query.eq('provinces.province_name_en', provinceFilter);
    }

    const { data, error } = await query
      .order("name_th", { ascending: true })
      .limit(options?.featuredSlugs ? options.featuredSlugs.length : 50);

    if (error || !data || data.length === 0) return [];
    const results = (data as DbRecord[]).map(mapRestaurantRow);

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
        *,
        provinces (province_name_th, province_name_en, province_id),
        content_media (storage_path, alt_text_th, alt_text_en, is_cover, is_active, lifecycle_status, display_order),
        restaurant_attractions (
          distance_text,
          attractions (
            slug,
            name_th,
            name_en,
            content_media (storage_path, is_cover, is_active, lifecycle_status)
          )
        )
      `)
      .eq("slug", slug)
      .eq("is_published", true)
      .eq("is_active", true)
      .in("province_id", liveProvinceIds)
      .maybeSingle();

    if (error || !data) return null;

    const row = data as DbRecord & { restaurant_attractions?: DbRecord[] };
    const province = one(row.provinces);
    const nearbyAttractions = Array.isArray(row.restaurant_attractions)
      ? (row.restaurant_attractions as DbRecord[]).map(link => {
          const attraction = one(link.attractions);
          return {
            slug: text(attraction?.slug),
            name: text(attraction?.name_th, text(attraction?.name_en, "")),
            distanceText: text(link.distance_text) || null,
            imageUrl: (() => {
              if (!attraction) return null;
              const media = Array.isArray(attraction.content_media)
                ? (attraction.content_media as DbRecord[])
                : [];
              const publicReadyMedia = media.filter((item) => item.is_active !== false && text(item.lifecycle_status, "active") === "active");
              const cover = publicReadyMedia.find(m => m.is_cover === true) ?? publicReadyMedia[0];
              return imageUrlFromStoragePath(cover?.storage_path);
            })()
          };
        })
      : [];

    return {
      slug: text(row.slug, slug),
      name: text(row.name_th, text(row.name_en, slug)),
      province: text(province?.province_name_th, text(province?.province_name_en, "")),
      provinceId: Number(province?.province_id ?? 0),
      foodType: row.food_type as string | null,
      description: text(row.description_th, row.description_en as string | undefined) || null,
      addressText: (row.address_text as string | undefined) ?? null,
      openingHours: (row.opening_hours as string | undefined) ?? null,
      contactInfo: (row.contact_info as string | undefined) ?? null,
      latitude: row.latitude === null ? null : Number(row.latitude),
      longitude: row.longitude === null ? null : Number(row.longitude),
      imageUrl: publicImage(row as DbRecord),
      isPublished: Boolean(row.is_published),
      nearbyAttractions
    };
  } catch {
    return null;
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

function mapAccommodationRow(row: DbRecord): PublicAccommodationCard {
  const province = one(row.provinces);
  const name = text(row.name_th, text(row.name_en, ""));
  return {
    slug: text(row.slug),
    name,
    province: text(province?.province_name_th, text(province?.province_name_en, "")),
    accommodationType: text(row.accommodation_type, "Accommodation"),
    description: text(row.description_th, text(row.description_en, "")),
    imageUrl: publicImage(row),
    imageAlt: `${name} accommodation image`,
    priceRange: text(row.price_range)
  };
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
    const results = (data as DbRecord[]).map(mapAccommodationRow);

    if (options?.featuredSlugs && options.featuredSlugs.length > 0) {
      return results.sort((a, b) => options.featuredSlugs!.indexOf(a.slug) - options.featuredSlugs!.indexOf(b.slug));
    }
    return results;
  } catch {
    return [];
  }
}

export type PublicAccommodationDetail = {
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
  isPublished: boolean;
  nearbyAttractions: {
    slug: string;
    name: string;
    distanceText: string | null;
    imageUrl: string | null;
  }[];
};

export async function getPublicAccommodationDetail(slug: string): Promise<PublicAccommodationDetail | null> {
  try {
    const supabase = await createSupabaseServerClient();
    const liveProvinceIds = await listLiveDestinationProvinceIds();
    if (liveProvinceIds.length === 0) return null;
    const { data, error } = await supabase
      .from("accommodations")
      .select(`
        *,
        provinces (province_name_th, province_name_en, province_id),
        content_media (storage_path, alt_text_th, alt_text_en, is_cover, is_active, lifecycle_status, display_order),
        attraction_related_accommodations (
          attractions (
            slug,
            name_th,
            name_en,
            content_media (storage_path, is_cover, is_active, lifecycle_status)
          )
        )
      `)
      .eq("slug", slug)
      .eq("is_published", true)
      .eq("is_active", true)
      .in("province_id", liveProvinceIds)
      .maybeSingle();

    if (error || !data) return null;

    const row = data as DbRecord & { attraction_related_accommodations?: DbRecord[] };
    const province = one(row.provinces);
    const nearbyAttractions = Array.isArray(row.attraction_related_accommodations)
      ? (row.attraction_related_accommodations as DbRecord[]).map(link => {
          const attraction = one(link.attractions);
          return {
            slug: text(attraction?.slug),
            name: text(attraction?.name_th, text(attraction?.name_en, "")),
            distanceText: null, // this table doesn't have distance text currently
            imageUrl: (() => {
              if (!attraction) return null;
              const media = Array.isArray(attraction.content_media)
                ? (attraction.content_media as DbRecord[])
                : [];
              const publicReadyMedia = media.filter((item) => item.is_active !== false && text(item.lifecycle_status, "active") === "active");
              const cover = publicReadyMedia.find(m => m.is_cover === true) ?? publicReadyMedia[0];
              return imageUrlFromStoragePath(cover?.storage_path);
            })()
          };
        })
      : [];

    return {
      slug: text(row.slug, slug),
      name: text(row.name_th, text(row.name_en, slug)),
      province: text(province?.province_name_th, text(province?.province_name_en, "")),
      provinceId: Number(province?.province_id ?? 0),
      accommodationType: row.accommodation_type as string | null,
      description: text(row.description_th, row.description_en as string | undefined) || null,
      addressText: (row.address_text as string | undefined) ?? null,
      contactInfo: (row.contact_info as string | undefined) ?? null,
      priceRange: (row.price_range as string | undefined) ?? null,
      latitude: row.latitude === null ? null : Number(row.latitude),
      longitude: row.longitude === null ? null : Number(row.longitude),
      imageUrl: publicImage(row as DbRecord),
      isPublished: Boolean(row.is_published),
      nearbyAttractions
    };
  } catch {
    return null;
  }
}

export type PublicRouteCard = {
  slug: string;
  name: string;
  description: string;
  days: number;
  imageUrl: string | null;
};

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
        is_cover,
        is_active,
        lifecycle_status
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
      if (!fe && fd && fd.length > 0) {
        const results = (fd as DbRecord[])
          .filter((row) =>
            routeStopsArePublicForLaunch(
              row.suggested_route_stops,
              liveProvinceIdSet,
            ),
          )
          .map(row => {
          const stops = Array.isArray(row.suggested_route_stops) ? row.suggested_route_stops as { day_number: number }[] : [];
          const days = stops.length > 0 ? Math.max(...stops.map(s => (s.day_number || 1))) : 1;
          return {
            slug: text(row.slug),
            name: text(row.name_th, text(row.name_en)),
            description: text(row.description_th, text(row.description_en)),
            days,
            imageUrl: publicImage(row as DbRecord),
          };
        }).filter(r => r.slug);
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

    if (error || !data) return [];

    return (data as DbRecord[])
      .filter((row) =>
        routeStopsArePublicForLaunch(
          row.suggested_route_stops,
          liveProvinceIdSet,
        ),
      )
      .map(row => {
      const stops = Array.isArray(row.suggested_route_stops) ? row.suggested_route_stops as { day_number: number }[] : [];
      const days = stops.length > 0 ? Math.max(...stops.map(s => s.day_number || 1)) : 1;

      return {
        slug: text(row.slug),
        name: text(row.name_th, text(row.name_en)),
        description: text(row.description_th, text(row.description_en)),
        days,
        imageUrl: publicImage(row as DbRecord),
      };
    });
  } catch {
    return [];
  }
}

export type PublicRouteDetail = PublicRouteCard & {
  fullDescription: string;
  stops: {
    dayNumber: number;
    sequence: number;
    attractionName: string;
    attractionSlug: string;
    attractionImage: string | null;
  }[];
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
        content_media (storage_path, is_cover, is_active, lifecycle_status),
        suggested_route_stops (
          day_number,
          display_order,
          attractions (
            is_active,
            is_published,
            name_th,
            name_en,
            slug,
            provinces (
              province_id,
              is_active,
              province_name_en
            ),
            content_media (storage_path, is_cover, is_active, lifecycle_status)
          )
        )
      `)
      .eq("slug", slug)
      .eq("is_published", true)
      .eq("is_active", true)
      .maybeSingle();

    if (error || !data) return null;

    const row = data as DbRecord;
    const stopsArray = Array.isArray(row.suggested_route_stops) ? (row.suggested_route_stops as DbRecord[]) : [];
    if (!routeStopsArePublicForLaunch(stopsArray, liveProvinceIdSet)) return null;

    // Process and sort stops
    const mappedStops = stopsArray.map(stop => {
      const attraction = one(stop.attractions);
      return {
        dayNumber: numberValue(stop.day_number, 1),
        sequence: numberValue(stop.display_order, 1),
        attractionName: text(attraction?.name_th, text(attraction?.name_en, "Unknown")),
        attractionSlug: text(attraction?.slug, ""),
        attractionImage: publicImage(attraction ?? {})
      };
    }).sort((a, b) => {
      if (a.dayNumber !== b.dayNumber) return a.dayNumber - b.dayNumber;
      return a.sequence - b.sequence;
    });

    return {
      slug: text(row.slug),
      name: text(row.name_th, text(row.name_en)),
      description: text(row.description_th, text(row.description_en)),
      fullDescription: text(row.description_th, text(row.description_en)),
      days: Math.max(1, ...mappedStops.map((stop) => stop.dayNumber)),
      imageUrl: publicImage(row as DbRecord),
      stops: mappedStops
    };
  } catch {
    return null;
  }
}
