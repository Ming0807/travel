import { Suspense } from "react";
import { requirePermission } from "@/lib/auth/guards";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ReviewsListClient } from "@/components/admin/reviews/ReviewsListClient";
import { ExportButton } from "@/components/admin/ExportButton";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    search?: string;
    rating?: string;
    attractionId?: string;
    restaurantId?: string;
    isApproved?: string;
    isPublished?: string;
  }>;
}) {
  await requirePermission("review.read");
  const params = await searchParams;

  return (
    <AdminShell>
      <div className="space-y-6">
        <AdminPageHeader
          eyebrow="Content Moderation"
          title="Reviews"
          description="Moderate tourist reviews for attractions and restaurants"
          actions={<ExportButton endpoint="/api/admin/export/reviews" label="Export CSV" />}
        />

        <Suspense fallback={<div className="text-sm text-slate-500">Loading reviews...</div>}>
          <ReviewsListClient
            initialPage={Number(params.page) || 1}
            initialSearch={params.search || ""}
            initialRating={params.rating || ""}
            initialAttractionId={params.attractionId || ""}
            initialRestaurantId={params.restaurantId || ""}
            initialIsApproved={params.isApproved || ""}
            initialIsPublished={params.isPublished || ""}
          />
        </Suspense>
      </div>
    </AdminShell>
  );
}
