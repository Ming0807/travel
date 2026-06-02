"use client";

import { Star } from "@phosphor-icons/react/dist/ssr";
import type { ReviewCard, ReviewStats } from "@/types/tourism";

type ReviewListProps = {
  stats: ReviewStats;
  reviews: ReviewCard[];
};

export function ReviewList({ stats, reviews }: ReviewListProps) {
  if (stats.totalReviews === 0) {
    return (
      <div id="reviews" className="scroll-mt-24 pt-8">
        <h2 className="mb-6 text-2xl font-bold text-ink">Reviews</h2>
        <div className="rounded-3xl border border-ink/5 bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-semibold text-muted">No reviews yet. Be the first to review!</p>
        </div>
      </div>
    );
  }

  return (
    <div id="reviews" className="scroll-mt-24 pt-8">
      <h2 className="mb-6 text-2xl font-bold text-ink">Reviews</h2>

      {/* Rating Summary */}
      <div className="flex flex-col gap-8 md:flex-row md:items-start md:gap-16">
        <div className="flex flex-col gap-2">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold text-ink">{stats.averageRating}</span>
            <span className="text-xl font-bold text-muted">/ 5</span>
          </div>
          <div className="flex text-amber-400">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} size={20} weight={star <= Math.round(stats.averageRating) ? "fill" : "regular"} />
            ))}
          </div>
          <p className="text-sm font-semibold text-muted">
            ({stats.totalReviews} review{stats.totalReviews !== 1 ? "s" : ""})
          </p>
        </div>

        {/* Distribution */}
        <div className="flex flex-1 flex-col gap-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = stats.distribution[star] ?? 0;
            const pct = stats.totalReviews > 0 ? Math.round((count / stats.totalReviews) * 100) : 0;
            return (
              <div key={star} className="flex items-center gap-4 text-sm font-bold text-ink">
                <div className="w-4">{star}</div>
                <Star size={12} weight="fill" className="text-amber-400" />
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-50">
                  <div className="h-full rounded-full bg-amber-400" style={{ width: `${pct}%` }} />
                </div>
                <div className="w-8 text-right text-muted">{pct}%</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Review Cards */}
      <div className="mt-8 space-y-4">
        {reviews.map((review) => (
          <div
            key={review.reviewId}
            className="rounded-3xl border border-ink/5 bg-white p-6 shadow-sm"
          >
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-ink">{review.touristName}</p>
                <p className="text-xs font-semibold text-muted">
                  {new Date(review.createdAt).toLocaleDateString("th-TH", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="flex text-amber-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={16}
                    weight={star <= review.rating ? "fill" : "regular"}
                    className={star <= review.rating ? "text-amber-400" : "text-slate-200"}
                  />
                ))}
              </div>
            </div>

            {review.title && (
              <h3 className="mb-1 text-sm font-bold text-ink">{review.title}</h3>
            )}

            {review.comment && (
              <p className="text-sm leading-relaxed text-muted">&ldquo;{review.comment}&rdquo;</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
