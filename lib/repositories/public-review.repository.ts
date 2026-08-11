import "server-only";

import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import type { ReviewStats } from "@/types/tourism";

export type PublicReviewCard = {
  reviewId: number;
  authorLabel: "นักเดินทาง";
  rating: number;
  title: string | null;
  comment: string | null;
  createdAt: string;
};

export type PublicReviewBundle = {
  state: "available" | "empty" | "unavailable";
  stats: ReviewStats | null;
  items: PublicReviewCard[];
};

function buildReviewStats(rows: Array<{ rating: unknown }>): ReviewStats {
  const ratings = rows
    .map((row) => Number(row.rating))
    .filter((rating) => Number.isInteger(rating) && rating >= 1 && rating <= 5);
  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const rating of ratings) distribution[rating] += 1;

  return {
    averageRating: ratings.length > 0
      ? Number((ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(1))
      : 0,
    totalReviews: ratings.length,
    distribution,
  };
}

async function getPublicReviews(
  scopeColumn: "attraction_id" | "restaurant_id",
  scopeId: number,
  limit = 20,
): Promise<PublicReviewBundle> {
  const supabase = createSupabaseServiceRoleClient();
  const statsQuery = supabase
    .from("reviews")
    .select("rating")
    .eq(scopeColumn, scopeId)
    .eq("is_approved", true)
    .eq("is_published", true)
    .is("deleted_at", null);
  const itemsQuery = supabase
    .from("reviews")
    .select("review_id, rating, title, comment, created_at")
    .eq(scopeColumn, scopeId)
    .eq("is_approved", true)
    .eq("is_published", true)
    .is("deleted_at", null);

  const [statsResult, itemsResult] = await Promise.all([
    statsQuery,
    itemsQuery.order("created_at", { ascending: false }).limit(limit),
  ]);

  if (statsResult.error || itemsResult.error) {
    return { state: "unavailable", stats: null, items: [] };
  }

  const stats = buildReviewStats(statsResult.data ?? []);
  if (stats.totalReviews === 0) {
    return { state: "empty", stats: null, items: [] };
  }

  return {
    state: "available",
    stats,
    items: (itemsResult.data ?? []).map((row: Record<string, unknown>) => ({
      reviewId: Number(row.review_id),
      authorLabel: "นักเดินทาง",
      rating: Number(row.rating),
      title: typeof row.title === "string" ? row.title : null,
      comment: typeof row.comment === "string" ? row.comment : null,
      createdAt: String(row.created_at),
    })),
  };
}

export async function getPublicAttractionReviews(
  attractionId: number,
  limit = 20,
): Promise<PublicReviewBundle> {
  return getPublicReviews("attraction_id", attractionId, limit);
}

export async function getPublicRestaurantReviews(
  restaurantId: number,
  limit = 20,
): Promise<PublicReviewBundle> {
  return getPublicReviews("restaurant_id", restaurantId, limit);
}
