import "server-only";

import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import type { AdminReviewFilters } from "@/lib/validation/admin-review";

export type AdminReviewRow = {
  review_id: number;
  tourist_id: string;
  visit_id: string | null;
  attraction_id: number | null;
  restaurant_id: number | null;
  rating: number;
  title: string | null;
  comment: string | null;
  is_approved: boolean;
  is_published: boolean;
  moderated_by: string | null;
  moderated_at: string | null;
  created_at: string;
  updated_at: string | null;
  deleted_at: string | null;
  tourist_name: string | null;
  attraction_name: string | null;
  restaurant_name: string | null;
};

export type PaginatedResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapReview(row: any): AdminReviewRow {
  const tourist = Array.isArray(row.tourists) ? row.tourists[0] : row.tourists;
  const attraction = Array.isArray(row.attractions) ? row.attractions[0] : row.attractions;
  const restaurant = Array.isArray(row.restaurants) ? row.restaurants[0] : row.restaurants;

  return {
    review_id: Number(row.review_id),
    tourist_id: row.tourist_id,
    visit_id: row.visit_id,
    attraction_id: row.attraction_id === null ? null : Number(row.attraction_id),
    restaurant_id: row.restaurant_id === null ? null : Number(row.restaurant_id),
    rating: Number(row.rating),
    title: row.title,
    comment: row.comment,
    is_approved: row.is_approved,
    is_published: row.is_published,
    moderated_by: row.moderated_by,
    moderated_at: row.moderated_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
    deleted_at: row.deleted_at,
    tourist_name: tourist?.display_name ?? null,
    attraction_name: attraction?.name_th ?? null,
    restaurant_name: restaurant?.name_th ?? null
  };
}

export async function listAdminReviews(filters: AdminReviewFilters): Promise<PaginatedResult<AdminReviewRow>> {
  const supabase = createSupabaseServiceRoleClient();
  const from = (filters.page - 1) * filters.pageSize;
  const to = from + filters.pageSize - 1;

  let query = supabase
    .from("reviews")
    .select(
      `
        *,
        tourists (display_name),
        attractions (name_th),
        restaurants (name_th)
      `,
      { count: "exact" }
    )
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (filters.search) {
    query = query.or(`comment.ilike.%${filters.search}%,title.ilike.%${filters.search}%`);
  }
  if (filters.attractionId) query = query.eq("attraction_id", filters.attractionId);
  if (filters.restaurantId) query = query.eq("restaurant_id", filters.restaurantId);
  if (filters.rating) query = query.eq("rating", filters.rating);
  if (filters.isApproved !== undefined) query = query.eq("is_approved", filters.isApproved);
  if (filters.isPublished !== undefined) query = query.eq("is_published", filters.isPublished);

  const { data, error, count } = await query;

  if (error) {
    throw new Error("ADMIN_REVIEW_LIST_FAILED");
  }

  return {
    items: (data ?? []).map(mapReview),
    total: count ?? 0,
    page: filters.page,
    pageSize: filters.pageSize
  };
}

export async function getAdminReviewById(reviewId: number): Promise<AdminReviewRow | null> {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("reviews")
    .select(
      `
        *,
        tourists (display_name),
        attractions (name_th, name_en, slug),
        restaurants (name_th, name_en, slug)
      `
    )
    .eq("review_id", reviewId)
    .maybeSingle();

  if (error) {
    throw new Error("ADMIN_REVIEW_READ_FAILED");
  }

  if (!data) return null;
  return mapReview(data);
}

export async function updateReviewModeration(
  reviewId: number,
  adminId: string,
  patch: { is_approved?: boolean; is_published?: boolean }
): Promise<AdminReviewRow> {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("reviews")
    .update({
      ...patch,
      moderated_by: adminId,
      moderated_at: new Date().toISOString()
    })
    .eq("review_id", reviewId)
    .select("*")
    .single();

  if (error) {
    throw new Error("ADMIN_REVIEW_MODERATE_FAILED");
  }

  return mapReview(data);
}

export async function softDeleteReview(reviewId: number): Promise<void> {
  const supabase = createSupabaseServiceRoleClient();
  const { error } = await supabase
    .from("reviews")
    .update({ deleted_at: new Date().toISOString() })
    .eq("review_id", reviewId);

  if (error) {
    throw new Error("ADMIN_REVIEW_DELETE_FAILED");
  }
}

export async function getReviewStatsByAttraction(attractionId: number) {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("rating")
    .eq("attraction_id", attractionId)
    .eq("is_approved", true)
    .eq("is_published", true)
    .is("deleted_at", null);

  if (error) return null;

  const ratings = (data ?? []).map(r => Number(r.rating));
  const total = ratings.length;
  if (total === 0) return { averageRating: 0, totalReviews: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };

  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  ratings.forEach(r => { distribution[r] = (distribution[r] ?? 0) + 1; });

  return {
    averageRating: +(ratings.reduce((a, b) => a + b, 0) / total).toFixed(1),
    totalReviews: total,
    distribution
  };
}

export async function getReviewStatsByRestaurant(restaurantId: number) {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("rating")
    .eq("restaurant_id", restaurantId)
    .eq("is_approved", true)
    .eq("is_published", true)
    .is("deleted_at", null);

  if (error) return null;

  const ratings = (data ?? []).map(r => Number(r.rating));
  const total = ratings.length;
  if (total === 0) return { averageRating: 0, totalReviews: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };

  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  ratings.forEach(r => { distribution[r] = (distribution[r] ?? 0) + 1; });

  return {
    averageRating: +(ratings.reduce((a, b) => a + b, 0) / total).toFixed(1),
    totalReviews: total,
    distribution
  };
}

export async function listPublicReviewsByAttraction(attractionId: number, limit = 20) {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("reviews")
    .select(`
      review_id,
      rating,
      title,
      comment,
      created_at,
      tourists (display_name)
    `)
    .eq("attraction_id", attractionId)
    .eq("is_approved", true)
    .eq("is_published", true)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return [];
  return (data ?? []).map(r => ({
    reviewId: Number((r as Record<string, unknown>).review_id),
    touristName: ((r as Record<string, unknown>).tourists as Record<string, unknown> | null)?.display_name as string ?? "Anonymous",
    rating: Number((r as Record<string, unknown>).rating),
    title: (r as Record<string, unknown>).title as string | null,
    comment: (r as Record<string, unknown>).comment as string | null,
    createdAt: (r as Record<string, unknown>).created_at as string
  }));
}

export async function listPublicReviewsByRestaurant(restaurantId: number, limit = 20) {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("reviews")
    .select(`
      review_id,
      rating,
      title,
      comment,
      created_at,
      tourists (display_name)
    `)
    .eq("restaurant_id", restaurantId)
    .eq("is_approved", true)
    .eq("is_published", true)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return [];
  return (data ?? []).map(r => ({
    reviewId: Number((r as Record<string, unknown>).review_id),
    touristName: ((r as Record<string, unknown>).tourists as Record<string, unknown> | null)?.display_name as string ?? "Anonymous",
    rating: Number((r as Record<string, unknown>).rating),
    title: (r as Record<string, unknown>).title as string | null,
    comment: (r as Record<string, unknown>).comment as string | null,
    createdAt: (r as Record<string, unknown>).created_at as string
  }));
}
