import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { siteMediaImageUrl } from "@/lib/media/storage-paths";
import type { AttractionCard } from "@/types/tourism";

type DbRecord = Record<string, unknown>;

type InternalAttractionCard = AttractionCard & {
  attractionId: number;
};

type PublicAttractionListOptions = {
  search?: string;
  province?: string;
  type?: string;
  featuredSlugs?: string[];
};

export type PublicStoryCard = {
  id: string;
  title: string;
  excerpt: string;
  province: string;
  date: string;
  imageUrl: string | null;
  category: string;
  authorType: string;
  authorName: string;
  status?: string;
};

export type PublicStoryDetail = PublicStoryCard & {
  content: string | null;
};

export type PublicAttractionRelatedItem = {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  category?: string;
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

function publicImage(row: DbRecord): string | null {
  return imageUrlFromStoragePath(publicAttractionMedia(row)?.storage_path);
}

function mapAttractionCard(row: DbRecord): InternalAttractionCard {
  const province = one(row.provinces);
  const attractionType = one(row.attraction_types);
  const media = publicAttractionMedia(row);
  const name = text(row.name_th, text(row.name_en, "Untitled attraction"));
  const category = text(attractionType?.type_name_th, text(attractionType?.type_name_en, "Uncategorized"));
  const provinceName = text(province?.province_name_th, text(province?.province_name_en));

  return {
    attractionId: numberValue(row.attraction_id),
    slug: text(row.slug),
    name,
    province: provinceName,
    category,
    description: text(row.short_description_th, text(row.short_description_en)),
    imageUrl: publicImage(row),
    imageAlt: text(media?.alt_text_th, text(media?.alt_text_en, `${name} destination image`)),
    tags: [category, provinceName].filter(Boolean)
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

function formatStoryDate(value: unknown) {
  const date = typeof value === "string" ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(date);
}

function mapStory(row: DbRecord): PublicStoryCard {
  const province = one(row.provinces);
  return {
    id: text(row.slug),
    title: text(row.title, "Untitled story"),
    excerpt: text(row.excerpt),
    province: text(province?.province_name_th, text(province?.province_name_en)),
    date: formatStoryDate(row.published_at || row.created_at),
    imageUrl: publicImage(row),
    category: text(row.category, "Story"),
    authorType: text(row.author_type, "admin"),
    authorName: row.author_type === 'tourist' ? text(one(row.tourists)?.display_name, "Tourist") : "Admin",
    status: text(row.status),
  };
}

function mapStoryDetail(row: DbRecord): PublicStoryDetail {
  return {
    ...mapStory(row),
    content: text(row.content) || null,
  };
}

export async function listPublicAttractionCards(limit = 16, options?: PublicAttractionListOptions): Promise<AttractionCard[]> {
  try {
    const supabase = await createSupabaseServerClient();
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
          provinces!inner (province_name_th, province_name_en),
          ${attractionTypesRelation} (type_name_th, type_name_en),
          content_media (storage_path, alt_text_th, alt_text_en, is_cover, is_active, lifecycle_status, display_order)
        `)
        .eq("is_published", true)
        .eq("is_active", true);

      if (options?.search) {
        const search = escapeIlikePattern(options.search);
        if (search) {
          q = q.or(`name_th.ilike.%${search}%,name_en.ilike.%${search}%,slug.ilike.%${search}%`);
        }
      }

      if (options?.province) {
        q = q.eq('provinces.province_name_en', options.province);
      }

      if (options?.type) {
        q = q.eq('attraction_types.type_name_en', options.type);
      }

      return q;
    };

    let finalResults: InternalAttractionCard[] = [];
    const usedSlugs = new Set<string>();

    if (options?.featuredSlugs && options.featuredSlugs.length > 0) {
      const { data, error } = await buildBaseQuery().in('slug', options.featuredSlugs).limit(limit);

      if (!error && data && data.length > 0) {
        const results = (data as DbRecord[]).map(mapAttractionCard).filter((item) => item.slug);
        finalResults = results.sort((a, b) => options.featuredSlugs!.indexOf(a.slug) - options.featuredSlugs!.indexOf(b.slug));
        finalResults.forEach(r => usedSlugs.add(r.slug));
      }
    }

    if (finalResults.length < limit) {
      const remaining = limit - finalResults.length;
      const { data, error } = await buildBaseQuery()
        .order("created_at", { ascending: false })
        .limit(remaining + usedSlugs.size); // Fetch extra in case of overlap

      if (!error && data && data.length > 0) {
        const fallbackResults = (data as DbRecord[])
          .map(mapAttractionCard)
          .filter((item) => item.slug && !usedSlugs.has(item.slug))
          .slice(0, remaining);

        finalResults = [...finalResults, ...fallbackResults];
      }
    }

    return withReviewSummaries(supabase, finalResults);
  } catch {
    return [];
  }
}

export async function getPublicAttractionDetail(slug: string): Promise<PublicAttractionDetail | null> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
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
      .eq("slug", slug)
      .eq("is_published", true)
      .eq("is_active", true)
      .maybeSingle();

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
        category: s.category
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
    const joinType = options?.province ? '!inner' : '';
    let query = supabase
      .from("travel_stories")
      .select(`slug, title, excerpt, category, published_at, author_type, tourists (display_name), provinces${joinType} (province_name_th, province_name_en), content_media (storage_path, alt_text_th, alt_text_en, is_cover, is_active, lifecycle_status, display_order)`)
      .eq("status", "published");

    if (options?.featuredSlugs && options.featuredSlugs.length > 0) {
      query = query.in("slug", options.featuredSlugs);
    } else {
      if (options?.province) {
        query = query.eq('provinces.province_name_en', options.province);
      }
      if (options?.authorType) {
        query = query.eq('author_type', options.authorType);
      }
    }

    const { data, error } = await query
      .order("published_at", { ascending: false })
      .limit(options?.featuredSlugs ? options.featuredSlugs.length : limit);

    if (error || !data || data.length === 0) return [];
    const results = (data as DbRecord[]).map(mapStory).filter((item) => item.id);

    if (options?.featuredSlugs && options.featuredSlugs.length > 0) {
      return results.sort((a, b) => options.featuredSlugs!.indexOf(a.id) - options.featuredSlugs!.indexOf(b.id));
    }
    return results;
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
      .select(`slug, title, excerpt, category, published_at, created_at, author_type, status, tourists (display_name), provinces (province_name_th, province_name_en), content_media (storage_path, alt_text_th, alt_text_en, is_cover, is_active, lifecycle_status, display_order)`)
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

export async function getPublicStory(slug: string): Promise<{ story: PublicStoryDetail; relatedStories: PublicStoryCard[] } | null> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("travel_stories")
      .select("slug, title, excerpt, content, category, published_at, author_type, tourists (display_name), provinces (province_name_th, province_name_en), content_media (storage_path, alt_text_th, alt_text_en, is_cover, is_active, lifecycle_status, display_order)")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();

    if (error || !data) return null;

    const story = mapStoryDetail(data as DbRecord);
    const relatedStories = (await listPublicStories({ limit: 8 }))
      .filter((item) => item.id !== story.id)
      .slice(0, 3);

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
      .eq("is_active", true);

    if (options?.search) {
      query = query.or(`name_th.ilike.%${options.search}%,name_en.ilike.%${options.search}%`);
    }

    if (options?.foodType) {
      query = query.ilike("food_type", `%${options.foodType}%`);
    }

    if (options?.featuredSlugs && options.featuredSlugs.length > 0) {
      query = query.in("slug", options.featuredSlugs);
    } else if (options?.province) {
      query = query.eq('provinces.province_name_en', options.province);
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
      .eq("is_active", true);

    if (options?.search) {
      query = query.or(`name_th.ilike.%${options.search}%,name_en.ilike.%${options.search}%`);
    }

    if (options?.featuredSlugs && options.featuredSlugs.length > 0) {
      query = query.in("slug", options.featuredSlugs);
    } else if (options?.province) {
      query = query.eq('provinces.province_name_en', options.province);
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

    if (featuredSlugs && featuredSlugs.length > 0) {
      const { data: fd, error: fe } = await supabase
        .from("suggested_routes")
        .select("slug, name_th, name_en, description_th, description_en, content_media (storage_path, is_cover, is_active, lifecycle_status), suggested_route_stops (day_number)")
        .in("slug", featuredSlugs)
        .eq("is_published", true)
        .eq("is_active", true)
        .limit(featuredSlugs.length);
      if (!fe && fd && fd.length > 0) {
        const results = (fd as DbRecord[]).map(row => {
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
      .select("slug, name_th, name_en, description_th, description_en, content_media (storage_path, is_cover, is_active, lifecycle_status), suggested_route_stops (day_number)")
      .eq("is_published", true)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error || !data) return [];

    return (data as DbRecord[]).map(row => {
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
            name_th,
            name_en,
            slug,
            content_media (storage_path, is_cover, is_active, lifecycle_status)
          )
        )
      `)
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle();

    if (error || !data) return null;

    const row = data as DbRecord;
    const stopsArray = Array.isArray(row.suggested_route_stops) ? (row.suggested_route_stops as DbRecord[]) : [];

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
