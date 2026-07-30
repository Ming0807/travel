import "server-only";
import { assertLiveDestinationProvinceId } from "@/lib/repositories/destination-scope.repository";

import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { normalizeLegacyStoryStatus, type StoryAuthorType } from "@/lib/content/story-workflow";
import type { StoryEditorialState } from "@/lib/services/story-editorial.service";
import type { AdminStoryFilters, AdminStoryMutationInput } from "@/lib/validation/story";
import { firstJoin } from "@/lib/utils/supabase-joins";
import { asRecord, booleanValue, nullableNumber, nullableString, numberValue, stringValue } from "@/lib/utils/record";

export type AdminStoryRow = {
  story_id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  content_document?: unknown;
  content_schema_version?: number;
  province_id: number | null;
  category: string | null;
  is_published: boolean;
  published_at: string | null;
  first_published_at?: string | null;
  scheduled_at?: string | null;
  archived_at?: string | null;
  created_at: string;
  updated_at: string | null;
  province_name_th: string | null;
  author_type: string;
  tourist_id: string | null;
  status: string;
  tourist_name: string | null;
  primary_language?: "th" | "en" | "ms";
  geographic_scope?: "province" | "cross_province";
  seo_title?: string | null;
  seo_description?: string | null;
  reading_minutes?: number | null;
  content_quality_score?: number | null;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  topic_ids?: number[];
  cover_media?: {
    media_id: number;
    is_active: boolean;
    alt_text_th: string | null;
    alt_text_en: string | null;
  } | null;
};

export type PaginatedResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

export type StoryLibrarySummary = {
  total: number;
  awaitingReview: number;
  inReview: number;
  approved: number;
  scheduled: number;
  published: number;
};

function storyAuthorType(value: unknown): StoryAuthorType {
  return value === "tourist" ? "tourist" : "admin";
}

function primaryLanguage(value: unknown): "th" | "en" | "ms" {
  return value === "en" || value === "ms" ? value : "th";
}

function geographicScope(value: unknown): "province" | "cross_province" {
  return value === "cross_province" ? "cross_province" : "province";
}

export function mapAdminStoryRow(rawRow: unknown): AdminStoryRow {
  const row = asRecord(rawRow);
  const province = asRecord(firstJoin(row.provinces as { province_name_th?: unknown } | { province_name_th?: unknown }[] | null));
  const tourist = asRecord(firstJoin(row.tourists as { display_name?: unknown } | { display_name?: unknown }[] | null));
  const topicIds = Array.isArray(row.story_topic_links)
    ? row.story_topic_links
        .map((link) => nullableNumber(asRecord(link).topic_id))
        .filter((topicId): topicId is number => topicId !== null)
    : [];
  const coverRecord = Array.isArray(row.content_media)
    ? row.content_media
        .map(asRecord)
        .find(
          (media) =>
            booleanValue(media.is_cover) &&
            booleanValue(media.is_active) &&
            (!media.lifecycle_status || media.lifecycle_status === "active")
        )
    : undefined;

  return {
    story_id: numberValue(row.story_id),
    slug: stringValue(row.slug),
    title: stringValue(row.title),
    excerpt: nullableString(row.excerpt),
    content: nullableString(row.content),
    content_document: row.content_document ?? null,
    content_schema_version: numberValue(row.content_schema_version, 1),
    province_id: nullableNumber(row.province_id),
    category: nullableString(row.category),
    is_published: booleanValue(row.is_published),
    published_at: nullableString(row.published_at),
    first_published_at: nullableString(row.first_published_at),
    scheduled_at: nullableString(row.scheduled_at),
    archived_at: nullableString(row.archived_at),
    created_at: stringValue(row.created_at),
    updated_at: nullableString(row.updated_at),
    province_name_th: nullableString(province.province_name_th),
    author_type: storyAuthorType(row.author_type),
    tourist_id: nullableString(row.tourist_id),
    status: stringValue(row.status),
    tourist_name: nullableString(tourist.display_name),
    primary_language: primaryLanguage(row.primary_language),
    geographic_scope: geographicScope(row.geographic_scope),
    seo_title: nullableString(row.seo_title),
    seo_description: nullableString(row.seo_description),
    reading_minutes: nullableNumber(row.reading_minutes),
    content_quality_score: nullableNumber(row.content_quality_score),
    reviewed_by: nullableString(row.reviewed_by),
    reviewed_at: nullableString(row.reviewed_at),
    topic_ids: topicIds,
    cover_media: coverRecord
      ? {
          media_id: numberValue(coverRecord.media_id),
          is_active: true,
          alt_text_th: nullableString(coverRecord.alt_text_th),
          alt_text_en: nullableString(coverRecord.alt_text_en),
        }
      : null,
  };
}

export function toStoryEditorialState(row: AdminStoryRow): StoryEditorialState {
  const authorType = storyAuthorType(row.author_type);
  return {
    storyId: row.story_id,
    authorType,
    status: normalizeLegacyStoryStatus(authorType, row.status),
    updatedAt: row.updated_at ?? row.created_at,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    legacyContent: row.content,
    contentDocument: row.content_document ?? null,
    contentSchemaVersion: row.content_schema_version ?? 1,
    provinceId: row.province_id,
    geographicScope: row.geographic_scope ?? "province",
    topicIds: [...(row.topic_ids ?? [])],
    seoTitle: row.seo_title ?? null,
    seoDescription: row.seo_description ?? null,
    usesGeneratedSeo: false,
    primaryLanguage: row.primary_language ?? "th",
    scheduledAt: row.scheduled_at ?? null,
    readingMinutes: row.reading_minutes ?? null,
    contentQualityScore: row.content_quality_score ?? null,
    cover: row.cover_media
      ? {
          mediaId: row.cover_media.media_id,
          isActive: row.cover_media.is_active,
          altText: row.cover_media.alt_text_th ?? row.cover_media.alt_text_en,
        }
      : null,
  };
}

function toPayload(input: AdminStoryMutationInput) {
  return {
    slug: input.slug,
    title: input.title,
    excerpt: input.excerpt,
    content: input.content,
    province_id: input.provinceId,
    category: input.category,
    is_published: input.isPublished,
    published_at: input.isPublished ? new Date().toISOString() : null,
    ...(input.status && { status: input.status })
  };
}

export async function listAdminStories(filters: AdminStoryFilters): Promise<PaginatedResult<AdminStoryRow>> {
  const supabase = createSupabaseServiceRoleClient();
  const from = (filters.page - 1) * filters.pageSize;
  const to = from + filters.pageSize - 1;
  const topicRelation = filters.topicId
    ? "story_topic_links!inner (topic_id)"
    : "story_topic_links (topic_id)";

  let query = supabase
    .from("travel_stories")
    .select(
      `
        *,
        provinces (province_name_th),
        tourists (display_name),
        ${topicRelation}
      `,
      { count: "exact" }
    )
    .order("updated_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (filters.search) {
    const escaped = filters.search.replace(/%/g, "\\%").replace(/_/g, "\\_");
    query = query.or(`title.ilike.%${escaped}%,slug.ilike.%${escaped}%`);
  }
  if (filters.authorType) query = query.eq("author_type", filters.authorType);
  if (filters.provinceId) query = query.eq("province_id", filters.provinceId);
  if (filters.topicId) query = query.eq("story_topic_links.topic_id", filters.topicId);
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.readiness === "ready") query = query.eq("content_quality_score", 100);
  if (filters.readiness === "needs_work") {
    query = query.or("content_quality_score.lt.100,content_quality_score.is.null");
  }
  if (filters.readiness === "unscored") query = query.is("content_quality_score", null);
  if (filters.dateFrom) query = query.gte("created_at", `${filters.dateFrom}T00:00:00.000Z`);
  if (filters.dateTo) query = query.lte("created_at", `${filters.dateTo}T23:59:59.999Z`);
  if (filters.isPublished !== undefined) query = query.eq("is_published", filters.isPublished);

  const { data, error, count } = await query;

  if (error) {
    console.error("ADMIN_STORY_LIST_FAILED Error details:", error);
    throw new Error(`ADMIN_STORY_LIST_FAILED: ${error.message}`);
  }

  return {
    items: (data ?? []).map((row) => mapAdminStoryRow(row)),
    total: count ?? 0,
    page: filters.page,
    pageSize: filters.pageSize
  };
}

export async function getAdminStoryById(storyId: number): Promise<AdminStoryRow | null> {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("travel_stories")
    .select(
      `
        *,
        provinces (province_name_th),
        tourists (display_name),
        story_topic_links (topic_id),
        content_media (media_id, is_cover, is_active, lifecycle_status, alt_text_th, alt_text_en)
      `
    )
    .eq("story_id", storyId)
    .maybeSingle();

  if (error) {
    throw new Error("ADMIN_STORY_READ_FAILED");
  }

  if (!data) return null;

  return mapAdminStoryRow(data);
}

async function countStoriesByStatuses(
  authorType: StoryAuthorType,
  statuses?: string[]
): Promise<number> {
  const supabase = createSupabaseServiceRoleClient();
  let query = supabase
    .from("travel_stories")
    .select("story_id", { count: "exact", head: true })
    .eq("author_type", authorType);

  if (statuses?.length === 1) query = query.eq("status", statuses[0]);
  if (statuses && statuses.length > 1) query = query.in("status", statuses);
  const { count, error } = await query;
  if (error) throw new Error("ADMIN_STORY_SUMMARY_FAILED");
  return count ?? 0;
}

export async function getStoryLibrarySummary(authorType: StoryAuthorType): Promise<StoryLibrarySummary> {
  const [total, awaitingReview, inReview, approved, scheduled, published] = await Promise.all([
    countStoriesByStatuses(authorType),
    countStoriesByStatuses(authorType, authorType === "tourist" ? ["submitted", "pending"] : ["in_review"]),
    countStoriesByStatuses(authorType, ["in_review"]),
    countStoriesByStatuses(authorType, ["approved"]),
    countStoriesByStatuses(authorType, ["scheduled"]),
    countStoriesByStatuses(authorType, ["published"]),
  ]);
  return { total, awaitingReview, inReview, approved, scheduled, published };
}

export async function findStoryBySlug(slug: string, excludeStoryId?: number) {
  const supabase = createSupabaseServiceRoleClient();
  let query = supabase.from("travel_stories").select("story_id").eq("slug", slug).limit(1);
  if (excludeStoryId) query = query.neq("story_id", excludeStoryId);

  const { data, error } = await query.maybeSingle();
  if (error) {
    throw new Error("ADMIN_STORY_READ_FAILED");
  }

  return data ? Number(data.story_id) : null;
}

export async function createAdminStory(input: AdminStoryMutationInput): Promise<AdminStoryRow> {
  await assertLiveDestinationProvinceId(input.provinceId);
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("travel_stories")
    .insert(toPayload(input))
    .select("*")
    .single();

  if (error) {
    throw new Error(error.code === "23505" ? "DUPLICATE_SLUG" : "ADMIN_STORY_CREATE_FAILED");
  }

  return mapAdminStoryRow(data);
}

export async function updateAdminStory(storyId: number, input: AdminStoryMutationInput): Promise<AdminStoryRow> {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("travel_stories")
    .update(toPayload(input))
    .eq("story_id", storyId)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.code === "23505" ? "DUPLICATE_SLUG" : "ADMIN_STORY_UPDATE_FAILED");
  }

  return mapAdminStoryRow(data);
}

export async function updateAdminStoryStatus(
  storyId: number,
  patch: { is_published?: boolean; status?: string }
): Promise<AdminStoryRow> {
  const supabase = createSupabaseServiceRoleClient();
  
  const finalPatch = {
    ...patch,
    ...(patch.is_published !== undefined && {
        published_at: patch.is_published ? new Date().toISOString() : null
    })
  };

  const { data, error } = await supabase
    .from("travel_stories")
    .update(finalPatch)
    .eq("story_id", storyId)
    .select("*")
    .single();

  if (error) {
    throw new Error("ADMIN_STORY_UPDATE_FAILED");
  }

  return mapAdminStoryRow(data);
}
