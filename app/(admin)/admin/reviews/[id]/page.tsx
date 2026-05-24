import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/guards";
import { getAdminReviewById } from "@/lib/repositories/admin-review.repository";
import { ReviewDetailClient } from "@/components/admin/reviews/ReviewDetailClient";

export const dynamic = "force-dynamic";

export default async function AdminReviewDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const guard = await requirePermission("review.read");
  const { id } = await params;
  const reviewId = parseInt(id, 10);
  if (isNaN(reviewId)) notFound();

  const review = await getAdminReviewById(reviewId);
  if (!review) notFound();

  return (
    <div className="p-6">
      <ReviewDetailClient
        review={{
          reviewId: review.review_id,
          touristName: review.tourist_name ?? "Anonymous",
          rating: review.rating,
          title: review.title,
          comment: review.comment,
          attractionName: review.attraction_name,
          restaurantName: review.restaurant_name,
          isApproved: review.is_approved,
          isPublished: review.is_published,
          moderatedAt: review.moderated_at,
          createdAt: review.created_at,
        }}
        canModerate={guard.permissions.includes("review.approve") || guard.permissions.includes("review.reject")}
        canDelete={guard.permissions.includes("review.delete")}
      />
    </div>
  );
}
