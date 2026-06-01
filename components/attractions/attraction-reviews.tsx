"use client";

import { useState } from "react";
import { Star, X } from "@phosphor-icons/react";
import type { ReviewCard, ReviewStats } from "@/types/tourism";

type AttractionReviewsProps = {
  rating: number;
  reviewsCount: string;
  stats?: ReviewStats;
  reviews?: ReviewCard[];
  title?: string;
  children?: React.ReactNode;
};

export function AttractionReviews({ rating, reviewsCount, stats, reviews, title = "Reviews", children }: AttractionReviewsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const hasRealData = stats && stats.totalReviews > 0;

  // Sort reviews: 5-stars first, then by date descending
  const sortedReviews = reviews ? [...reviews].sort((a, b) => {
    if (b.rating !== a.rating) {
      return b.rating - a.rating; // Highest rating first
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); // Newest first
  }) : [];

  const displayReviews = sortedReviews.slice(0, 3); // Show top 3 initially

  return (
    <div id="reviews" className="scroll-mt-24 pt-8">
      <h2 className="mb-6 text-2xl font-bold text-ink">{title}</h2>

      {/* Rating Summary */}
      <div className="flex flex-col gap-8 md:flex-row md:items-start md:gap-16">
        <div className="flex flex-col gap-2">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold text-ink">{hasRealData ? stats.averageRating : rating}</span>
            <span className="text-xl font-bold text-muted">/ 5</span>
          </div>
          <div className="flex text-amber-400">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} size={20} weight={star <= Math.round(hasRealData ? stats.averageRating : rating) ? "fill" : "regular"} />
            ))}
          </div>
          <p className="text-sm font-semibold text-muted">
            ({hasRealData ? stats.totalReviews : reviewsCount} review{hasRealData && stats.totalReviews !== 1 ? "s" : (typeof reviewsCount === "string" && !reviewsCount.endsWith("s") ? "" : "s")})
          </p>
        </div>

        {/* Rating Distribution */}
        <div className="flex flex-1 flex-col gap-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const pct = hasRealData && stats.totalReviews > 0
              ? Math.round(((stats.distribution[star] ?? 0) / stats.totalReviews) * 100)
              : star === 5 ? 70 : star === 4 ? 15 : star === 3 ? 10 : star === 2 ? 4 : 1;
            return (
              <div key={star} className="flex items-center gap-4 text-sm font-bold text-ink">
                <div className="w-4">{star}</div>
                <Star size={12} weight="fill" className="text-amber-400" />
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#F0EBE1]">
                  <div className="h-full rounded-full bg-amber-400" style={{ width: `${pct}%` }} />
                </div>
                <div className="w-8 text-right text-muted">{pct}%</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Real Reviews */}
      {hasRealData && displayReviews && displayReviews.length > 0 && (
        <div className="mt-8 space-y-4">
          {displayReviews.map((review) => (
            <ReviewItem key={review.reviewId} review={review} />
          ))}

          {sortedReviews.length > 3 && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 flex w-full items-center justify-center rounded-2xl border border-ink/10 bg-white py-3 text-sm font-bold text-ink transition-colors hover:bg-slate-50"
            >
              ดูรีวิวทั้งหมด ({sortedReviews.length})
            </button>
          )}
        </div>
      )}

      {/* Review Submission Form */}
      {children}

      {/* View All Reviews Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm sm:p-6">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-3xl bg-white shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-ink/5 p-6">
              <div>
                <h3 className="text-xl font-bold text-ink">รีวิวทั้งหมด</h3>
                <p className="text-sm text-muted">จากผู้เยี่ยมชม {sortedReviews.length} คน</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-muted hover:bg-slate-200 transition-colors"
              >
                <X size={20} weight="bold" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {sortedReviews.map((review) => (
                <ReviewItem key={review.reviewId} review={review} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ReviewItem({ review }: { review: ReviewCard }) {
  return (
    <div className="rounded-3xl border border-ink/5 bg-white p-6 shadow-sm">
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
  );
}
