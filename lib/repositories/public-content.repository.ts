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

export async function listPublicAttractionCards(limit = 16): Promise<AttractionCard[]> {
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
        provinces (province_name_th, province_name_en),
        attraction_types (type_name_th, type_name_en),
        attraction_media (storage_path, alt_text_th, alt_text_en, is_cover, display_order)
      `)
      .eq("is_published", true)
      .eq("is_active", true)
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

    if (error || !data) return attractionDetailsMock;

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
    return attractionDetailsMock;
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
  const story = stories.find((item) => item.id === slug) ?? stories[0];
  const relatedStories = stories.filter((item) => item.id !== story.id).slice(0, 3);
  return { story, relatedStories };
}
