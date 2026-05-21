import "server-only";

import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import type { AdminStoryFilters, AdminStoryMutationInput } from "@/lib/validation/story";

export type AdminStoryRow = {
  story_id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  province_id: number | null;
  category: string | null;
  image_url: string | null;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string | null;
  province_name_th: string | null;
};

export type PaginatedResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapStory(row: any): AdminStoryRow {
  const province = Array.isArray(row.provinces) ? row.provinces[0] : row.provinces;

  return {
    story_id: Number(row.story_id),
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    province_id: row.province_id === null ? null : Number(row.province_id),
    category: row.category,
    image_url: row.image_url,
    is_published: row.is_published,
    published_at: row.published_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
    province_name_th: province?.province_name_th ?? null
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
    image_url: input.imageUrl,
    is_published: input.isPublished,
    published_at: input.isPublished ? new Date().toISOString() : null
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
        provinces (province_name_th)
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
  if (filters.isPublished !== undefined) query = query.eq("is_published", filters.isPublished);

  const { data, error, count } = await query;

  if (error) {
    throw new Error("ADMIN_STORY_LIST_FAILED");
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
        provinces (province_name_th)
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
  patch: { is_published?: boolean }
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
