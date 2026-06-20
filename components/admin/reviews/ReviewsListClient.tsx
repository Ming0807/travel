"use client";

import { useCallback, useEffect, useState } from "react";
import { Star, CheckCircle, XCircle, Trash, Funnel, MagnifyingGlass, CaretLeft, CaretRight } from "@phosphor-icons/react/dist/ssr";
import { approveReviewAction, rejectReviewAction, deleteReviewAction } from "@/app/actions/admin-review-actions";
import type { AdminReviewRow } from "@/lib/repositories/admin-review.repository";
import Link from "next/link";

type Props = {
  initialPage: number;
  initialSearch: string;
  initialRating: string;
  initialAttractionId: string;
  initialRestaurantId: string;
  initialIsApproved: string;
  initialIsPublished: string;
  attractionName?: string;
};

function mapReview(r: AdminReviewRow) {
  return {
    reviewId: r.review_id,
    touristName: r.tourist_name ?? "Anonymous",
    rating: r.rating,
    title: r.title,
    comment: r.comment,
    attractionName: r.attraction_name,
    restaurantName: r.restaurant_name,
    isApproved: r.is_approved,
    isPublished: r.is_published,
    moderatedAt: r.moderated_at,
    createdAt: r.created_at,
  };
}

function ReviewRow({
  review,
  onAction,
}: {
  review: ReturnType<typeof mapReview>;
  onAction: (reviewId: number, action: "approve" | "reject" | "delete") => void;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 transition-shadow hover:shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3 mb-1">
            <span className="flex items-center gap-1 text-sm font-bold text-slate-800">
              {review.touristName}
            </span>
            <span className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  weight={i < review.rating ? "fill" : "regular"}
                  className={i < review.rating ? "text-amber-400" : "text-slate-200"}
                />
              ))}
            </span>
            <span className="text-xs text-slate-400 font-semibold">
              {new Date(review.createdAt).toLocaleDateString("th-TH", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>

          {review.title && (
            <p className="text-sm font-bold text-slate-700 mb-0.5">{review.title}</p>
          )}
          {review.comment && (
            <p className="text-sm text-slate-500 line-clamp-2">{review.comment}</p>
          )}

          <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-bold uppercase tracking-wider">
            {review.attractionName && (
              <span className="rounded-full bg-blue-50 text-blue-600 px-2.5 py-0.5">
                {review.attractionName}
              </span>
            )}
            {review.restaurantName && (
              <span className="rounded-full bg-emerald-50 text-emerald-600 px-2.5 py-0.5">
                {review.restaurantName}
              </span>
            )}
            <span
              className={`rounded-full px-2.5 py-0.5 ${
                review.isApproved
                  ? "bg-green-50 text-green-600"
                  : "bg-amber-50 text-amber-600"
              }`}
            >
              {review.isApproved ? "Approved" : "Pending"}
            </span>
            {review.isPublished && (
              <span className="rounded-full bg-purple-50 text-purple-600">Published</span>
            )}
          </div>
        </div>

        <div className="flex shrink-0 gap-1">
          {!review.isApproved && (
            <button
              onClick={() => onAction(review.reviewId, "approve")}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-green-500 hover:bg-green-50 transition-colors"
              title="Approve"
            >
              <CheckCircle size={18} weight="fill" />
            </button>
          )}
          {review.isApproved && (
            <button
              onClick={() => onAction(review.reviewId, "reject")}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-amber-500 hover:bg-amber-50 transition-colors"
              title="Reject"
            >
              <XCircle size={18} weight="fill" />
            </button>
          )}
          <button
            onClick={() => onAction(review.reviewId, "delete")}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-red-400 hover:bg-red-50 hover:text-red-500 transition-colors"
            title="Delete"
          >
            <Trash size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export function ReviewsListClient(props: Props) {
  // We use direct fetch to the API route instead of server actions
  // for simpler pagination with FormData-based filters
  const [items, setItems] = useState<ReturnType<typeof mapReview>[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(props.initialPage);
  const [search, setSearch] = useState(props.initialSearch);
  const [ratingFilter, setRatingFilter] = useState(props.initialRating);
  const [attractionIdFilter] = useState(props.initialAttractionId);
  const [restaurantIdFilter] = useState(props.initialRestaurantId);
  const [isApprovedFilter, setIsApprovedFilter] = useState(props.initialIsApproved);
  const [isPublishedFilter, setIsPublishedFilter] = useState(props.initialIsPublished);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchReviews = useCallback(async (
    p: number,
    s: string,
    r: string,
    appr: string,
    pub: string,
    attractionId: string,
    restaurantId: string
  ) => {
    setLoading(true);
    try {
      const fd = new FormData();
      fd.set("page", String(p));
      fd.set("pageSize", "20");
      if (s) fd.set("search", s);
      if (r) fd.set("rating", r);
      if (appr) fd.set("isApproved", appr);
      if (pub) fd.set("isPublished", pub);
      if (attractionId) fd.set("attractionId", attractionId);
      if (restaurantId) fd.set("restaurantId", restaurantId);

      const res = await fetch("/api/admin/reviews", {
        method: "POST",
        body: fd,
      });
      const json = await res.json();
      if (json.success && json.data) {
        setItems(json.data.items.map(mapReview));
        setTotal(json.data.total);
        setPage(json.data.page);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
      setLoaded(true);
      setActionError(null);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      fetchReviews(
        props.initialPage,
        props.initialSearch,
        props.initialRating,
        props.initialIsApproved,
        props.initialIsPublished,
        props.initialAttractionId,
        props.initialRestaurantId
      );
    });
    return () => {
      cancelled = true;
    };
  }, [fetchReviews, props.initialAttractionId, props.initialIsApproved, props.initialIsPublished, props.initialPage, props.initialRating, props.initialRestaurantId, props.initialSearch]);

  const handleSearch = () => {
    setPage(1);
    fetchReviews(1, search, ratingFilter, isApprovedFilter, isPublishedFilter, attractionIdFilter, restaurantIdFilter);
  };

  const handleAction = async (reviewId: number, action: "approve" | "reject" | "delete") => {
    setActionError(null);
    let result;
    if (action === "approve") result = await approveReviewAction(reviewId);
    else if (action === "reject") result = await rejectReviewAction(reviewId);
    else result = await deleteReviewAction(reviewId);

    if (!result.success) {
      setActionError(result.error ?? "Action failed.");
    }
    fetchReviews(page, search, ratingFilter, isApprovedFilter, isPublishedFilter, attractionIdFilter, restaurantIdFilter);
  };

  const totalPages = Math.max(1, Math.ceil(total / 20));

  return (
    <div>
      {/* Scoped Banner */}
      {props.attractionName && (
        <div className="mb-6 flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-bold text-blue-800">
            <span className="rounded-md bg-blue-100 px-2 py-1 text-xs font-semibold tracking-wider text-blue-600">
              รีวิวสำหรับสถานที่:
            </span>
            {props.attractionName}
          </div>
          <Link
            href="/admin/reviews"
            className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded-sm"
          >
            ดูรีวิวทั้งหมด
          </Link>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1">
          <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search reviews..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm font-semibold text-slate-700 placeholder:text-slate-400 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100"
          />
        </div>

        <select
          value={ratingFilter}
          onChange={(e) => { setRatingFilter(e.target.value); setPage(1); fetchReviews(1, search, e.target.value, isApprovedFilter, isPublishedFilter, attractionIdFilter, restaurantIdFilter); }}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-600 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100"
        >
          <option value="">All Ratings</option>
          <option value="5">5 Stars</option>
          <option value="4">4 Stars</option>
          <option value="3">3 Stars</option>
          <option value="2">2 Stars</option>
          <option value="1">1 Star</option>
        </select>

        <select
          value={isApprovedFilter}
          onChange={(e) => { setIsApprovedFilter(e.target.value); setPage(1); fetchReviews(1, search, ratingFilter, e.target.value, isPublishedFilter, attractionIdFilter, restaurantIdFilter); }}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-600 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100"
        >
          <option value="">All Status</option>
          <option value="true">Approved</option>
          <option value="false">Pending</option>
        </select>

        <select
          value={isPublishedFilter}
          onChange={(e) => { setIsPublishedFilter(e.target.value); setPage(1); fetchReviews(1, search, ratingFilter, isApprovedFilter, e.target.value, attractionIdFilter, restaurantIdFilter); }}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-600 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100"
        >
          <option value="">All Publication</option>
          <option value="true">Published</option>
          <option value="false">Unpublished</option>
        </select>
      </div>

      {/* Summary */}
      <div className="mb-4 text-sm font-semibold text-slate-500">
        {loaded ? `${total} review${total !== 1 ? "s" : ""} found` : "Loading..."}
      </div>

      {/* Reviews List */}
      {/* Action Error */}
      {actionError && (
        <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
          {actionError}
        </div>
      )}

      {loading && items.length === 0 ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 py-16 text-center">
          <Funnel size={40} className="text-slate-300 mb-3" />
          <p className="text-sm font-bold text-slate-400">No reviews found</p>
          <p className="text-xs text-slate-400 mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((review) => (
            <ReviewRow key={review.reviewId} review={review} onAction={handleAction} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-1 py-3">
          <p className="text-xs font-semibold text-slate-500">
            Showing {total} review{total !== 1 ? "s" : ""}
          </p>
          <div className="flex items-center gap-1">
            <button
              disabled={page <= 1}
              onClick={() => { const np = page - 1; setPage(np); fetchReviews(np, search, ratingFilter, isApprovedFilter, isPublishedFilter, attractionIdFilter, restaurantIdFilter); }}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Previous page"
            >
              <CaretLeft weight="bold" size={14} />
            </button>
            <span className="min-w-[3rem] text-center text-xs font-bold text-[#073F37]">
              {page} / {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => { const np = page + 1; setPage(np); fetchReviews(np, search, ratingFilter, isApprovedFilter, isPublishedFilter, attractionIdFilter, restaurantIdFilter); }}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Next page"
            >
              <CaretRight weight="bold" size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
