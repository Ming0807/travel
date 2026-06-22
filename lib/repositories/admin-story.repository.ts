import "server-only";

import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import type { AdminStoryFilters, AdminStoryMutationInput } from "@/lib/validation/story";
import { firstJoin } from "@/lib/utils/supabase-joins";
import { asRecord, booleanValue, nullableNumber, nullableString, numberValue, stringValue } from "@/lib/utils/record";

export type AdminStoryRow = {
  story_id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  province_id: number | null;
  category: string | null;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string | null;
  province_name_th: string | null;
  author_type: string;
  tourist_id: string | null;
  status: string;
  tourist_name: string | null;
};

export type PaginatedResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

function mapStory(rawRow: unknown): AdminStoryRow {
  const row = asRecord(rawRow);
  const province = asRecord(firstJoin(row.provinces as { province_name_th?: unknown } | { province_name_th?: unknown }[] | null));
  const tourist = asRecord(firstJoin(row.tourists as { display_name?: unknown } | { display_name?: unknown }[] | null));

  return {
    story_id: numberValue(row.story_id),
    slug: stringValue(row.slug),
    title: stringValue(row.title),
    excerpt: nullableString(row.excerpt),
    content: nullableString(row.content),
    province_id: nullableNumber(row.province_id),
    category: nullableString(row.category),
    is_published: booleanValue(row.is_published),
    published_at: nullableString(row.published_at),
    created_at: stringValue(row.created_at),
    updated_at: nullableString(row.updated_at),
    province_name_th: nullableString(province.province_name_th),
    author_type: stringValue(row.author_type),
    tourist_id: nullableString(row.tourist_id),
    status: stringValue(row.status),
    tourist_name: nullableString(tourist.display_name)
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

  let query = supabase
    .from("travel_stories")
    .select(
      `
        *,
        provinces (province_name_th),
        tourists (display_name)
      `,
      { count: "exact" }
    )
    .order("updated_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (filters.search) {
    query = query.or(`title.ilike.%${filters.search}%,slug.ilike.%${filters.search}%`);
  }
  if (filters.provinceId) query = query.eq("province_id", filters.provinceId);
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.isPublished !== undefined) query = query.eq("is_published", filters.isPublished);

  const { data, error, count } = await query;

  if (error) {
    console.error("ADMIN_STORY_LIST_FAILED Error details:", error);
    throw new Error(`ADMIN_STORY_LIST_FAILED: ${error.message}`);
  }

  return {
    items: (data ?? []).map((row) => mapStory(row)),
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
        tourists (display_name)
      `
    )
    .eq("story_id", storyId)
    .maybeSingle();

  if (error) {
    throw new Error("ADMIN_STORY_READ_FAILED");
  }

  if (!data) return null;

  return mapStory(data);
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
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("travel_stories")
    .insert(toPayload(input))
    .select("*")
    .single();

  if (error) {
    throw new Error(error.code === "23505" ? "DUPLICATE_SLUG" : "ADMIN_STORY_CREATE_FAILED");
  }

  return mapStory(data);
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

  return mapStory(data);
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

  return mapStory(data);
}
