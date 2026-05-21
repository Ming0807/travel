import "server-only";

import { attractionDetailsMock } from "@/lib/data/attraction-details";
import { storiesData } from "@/lib/data/stories";
import { homepageAttractions } from "@/components/homepage/homepage-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AttractionCard } from "@/types/tourism";

type DbRecord = Record<string, unknown>;

export type PublicStoryCard = {
  id: string;
  title: string;
  excerpt: string;
  province: string;
  date: string;
  imageUrl: string;
  category: string;
};

export type PublicAttractionDetail = typeof attractionDetailsMock;

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

function publicImage(row: DbRecord, fallback: string) {
  const media = Array.isArray(row.attraction_media) ? (row.attraction_media as DbRecord[]) : [];
  const cover = media.find((item) => item.is_cover === true) ?? media[0];
  return text(cover?.storage_path, fallback);
}

function mapAttractionCard(row: DbRecord, fallback: AttractionCard): AttractionCard {
  const province = one(row.provinces);
  const attractionType = one(row.attraction_types);
  const name = text(row.name_th, text(row.name_en, fallback.name));
  const category = text(attractionType?.type_name_en, fallback.category);

  return {
    slug: text(row.slug, fallback.slug),
    name,
    province: text(province?.province_name_th, text(province?.province_name_en, fallback.province)),
    category,
    description: text(row.short_description_th, text(row.short_description_en, fallback.description)),
    imageUrl: publicImage(row, fallback.imageUrl),
    imageAlt: `${name} destination image`,
    tags: [category, text(province?.province_name_en, fallback.province)].filter(Boolean)
  };
}

function fallbackAttraction(index: number) {
  return homepageAttractions[index % homepageAttractions.length] ?? homepageAttractions[0];
}

function formatStoryDate(value: unknown) {
  const date = typeof value === "string" ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(date);
}

function mapStory(row: DbRecord, fallback: PublicStoryCard): PublicStoryCard {
  const province = one(row.provinces);
  return {
    id: text(row.slug, fallback.id),
    title: text(row.title, fallback.title),
    excerpt: text(row.excerpt, fallback.excerpt),
    province: text(province?.province_name_th, text(province?.province_name_en, fallback.province)),
    date: formatStoryDate(row.published_at) || fallback.date,
    imageUrl: text(row.image_url, fallback.imageUrl),
    category: text(row.category, fallback.category)
  };
}

function fallbackStories(): PublicStoryCard[] {
  return storiesData.map((story) => ({
    ...story,
    id: story.id
  }));
}

export async function listPublicAttractionCards(limit = 16, options?: { search?: string; province?: string }): Promise<AttractionCard[]> {
  try {
    const supabase = await createSupabaseServerClient();
    let query = supabase
      .from("attractions")
      .select(`
        slug,
        name_th,
        name_en,
        short_description_th,
        short_description_en,
        provinces!inner (province_name_th, province_name_en),
        attraction_types (type_name_th, type_name_en),
        attraction_media (storage_path, alt_text_th, alt_text_en, is_cover, display_order)
      `)
      .eq("is_published", true)
      .eq("is_active", true);

    if (options?.search) {
      query = query.or(`name_th.ilike.%${options.search}%,name_en.ilike.%${options.search}%`);
    }

    if (options?.province) {
      query = query.eq('provinces.province_name_en', options.province);
    }

    const { data, error } = await query
      .order("created_at", { ascending: true })
      .limit(limit);

    if (error || !data || data.length === 0) return homepageAttractions;
    return (data as DbRecord[]).map((row, index) => mapAttractionCard(row, fallbackAttraction(index)));
  } catch {
    return homepageAttractions;
  }
}

export async function getPublicAttractionDetail(slug: string): Promise<PublicAttractionDetail> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("attractions")
      .select(`
        slug,
        name_th,
        name_en,
        short_description_th,
        short_description_en,
        description_th,
        description_en,
        opening_hours,
        latitude,
        longitude,
        provinces (province_name_th, province_name_en),
        attraction_types (type_name_th, type_name_en),
        attraction_media (storage_path, alt_text_th, alt_text_en, is_cover, display_order)
      `)
      .eq("slug", slug)
      .eq("is_published", true)
      .eq("is_active", true)
      .maybeSingle();

    if (error || !data) return null;

    const row = data as DbRecord;
    const province = one(row.provinces);
    const name = text(row.name_th, text(row.name_en, attractionDetailsMock.name));
    const media = Array.isArray(row.attraction_media) ? (row.attraction_media as DbRecord[]) : [];
    const sortedMedia = [...media].sort((a, b) => numberValue(a.display_order) - numberValue(b.display_order));
    const images = sortedMedia.map((item) => text(item.storage_path)).filter(Boolean);
    const mainImage = images[0] ?? attractionDetailsMock.mainImage;

    return {
      ...attractionDetailsMock,
      slug: text(row.slug, slug),
      name,
      province: text(province?.province_name_th, text(province?.province_name_en, attractionDetailsMock.province)),
      description: text(row.description_th, text(row.short_description_th, attractionDetailsMock.description)),
      mainImage,
      gallery: images.length > 0 ? images.slice(0, 4) : attractionDetailsMock.gallery,
      info: {
        ...attractionDetailsMock.info,
        region: text(province?.province_name_en, attractionDetailsMock.info.region),
        population: "Not collected",
        language: "Thai, English, Malay future",
        currency: "Thai Baht (THB)",
        timeZone: "GMT+7"
      }
    };
  } catch {
    return null;
  }
}

export async function listPublicStories(limit = 12): Promise<PublicStoryCard[]> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("travel_stories")
      .select("slug, title, excerpt, category, image_url, published_at, provinces (province_name_th, province_name_en)")
      .eq("is_published", true)
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(limit);

    const fallback = fallbackStories();
    if (error || !data || data.length === 0) return fallback;
    return (data as DbRecord[]).map((row, index) => mapStory(row, fallback[index % fallback.length]));
  } catch {
    return fallbackStories();
  }
}

export async function getPublicStory(slug: string) {
  const stories = await listPublicStories(24);
  const story = stories.find((item) => item.id === slug);
  if (!story) return null;
  
  const relatedStories = stories.filter((item) => item.id !== story.id).slice(0, 3);
  return { story, relatedStories };
}

export type PublicRouteCard = {
  slug: string;
  name: string;
  description: string;
  days: number;
  imageUrl: string;
};

export async function listPublicRoutes(limit = 10): Promise<PublicRouteCard[]> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("suggested_routes")
      .select("slug, route_name_th, route_name_en, short_description_th, short_description_en, estimated_days")
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error || !data) return [];
    
    return (data as DbRecord[]).map(row => ({
      slug: text(row.slug),
      name: text(row.route_name_th, text(row.route_name_en)),
      description: text(row.short_description_th, text(row.short_description_en)),
      days: numberValue(row.estimated_days, 1),
      imageUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=700&q=85", // Placeholder until media is linked to routes
    }));
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
    attractionImage: string;
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
        route_name_th,
        route_name_en,
        short_description_th,
        short_description_en,
        description_th,
        description_en,
        estimated_days,
        suggested_route_stops (
          day_number,
          sequence_number,
          attractions (
            name_th,
            name_en,
            slug,
            attraction_media (storage_path, is_cover)
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
        sequence: numberValue(stop.sequence_number, 1),
        attractionName: text(attraction?.name_th, text(attraction?.name_en, "Unknown")),
        attractionSlug: text(attraction?.slug, ""),
        attractionImage: publicImage(attraction ?? {}, "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=700&q=85")
      };
    }).sort((a, b) => {
      if (a.dayNumber !== b.dayNumber) return a.dayNumber - b.dayNumber;
      return a.sequence - b.sequence;
    });

    return {
      slug: text(row.slug),
      name: text(row.route_name_th, text(row.route_name_en)),
      description: text(row.short_description_th, text(row.short_description_en)),
      fullDescription: text(row.description_th, text(row.description_en, text(row.short_description_th))),
      days: numberValue(row.estimated_days, 1),
      imageUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=700&q=85",
      stops: mappedStops
    };
  } catch {
    return null;
  }
}
