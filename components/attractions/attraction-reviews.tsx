"use client";

import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { Star, X } from "@phosphor-icons/react";
import type { ReviewStats } from "@/types/tourism";
import type { PublicReviewCard } from "@/lib/repositories/public-review.repository";

type CompatibleReviewCard = PublicReviewCard | {
  reviewId: number;
  touristName: string;
  rating: number;
  title: string | null;
  comment: string | null;
  createdAt: string;
};

type AttractionReviewsProps = {
  state?: "available" | "empty" | "unavailable";
  stats: ReviewStats | null;
  reviews: CompatibleReviewCard[];
  title?: string;
  children?: React.ReactNode;
};

export function AttractionReviews({ state, stats, reviews, title = "รีวิวจากนักเดินทาง", children }: AttractionReviewsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const resolvedState = state ?? (stats && stats.totalReviews > 0 ? "available" : "empty");
  const hasRealData = resolvedState === "available" && stats !== null && stats.totalReviews > 0;

  // Sort reviews: 5-stars first, then by date descending
  const sortedReviews = [...reviews].sort((a, b) => {
    if (b.rating !== a.rating) {
      return b.rating - a.rating; // Highest rating first
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); // Newest first
  });

  const displayReviews = sortedReviews.slice(0, 3); // Show top 3 initially

  useEffect(() => {
    if (!isModalOpen) return;
    closeButtonRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsModalOpen(false);
        requestAnimationFrame(() => openButtonRef.current?.focus());
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isModalOpen]);

  const closeModal = () => {
    setIsModalOpen(false);
    requestAnimationFrame(() => openButtonRef.current?.focus());
  };

  const keepFocusInsideDialog = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab") return;
    const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
      "button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])",
    );
    if (!focusable || focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <section id="reviews" className="scroll-mt-36">
      <h2 className="mb-6 text-2xl font-bold text-ink">{title}</h2>

      {hasRealData ? <div className="flex flex-col gap-8 md:flex-row md:items-start md:gap-16">
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
            {stats.totalReviews.toLocaleString("th-TH")} รีวิว
          </p>
        </div>

        {/* Rating Distribution */}
        <div className="flex flex-1 flex-col gap-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const pct = stats.totalReviews > 0
              ? Math.round(((stats.distribution[star] ?? 0) / stats.totalReviews) * 100)
              : 0;
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
      </div> : null}

      {/* Real Reviews */}
      {hasRealData && displayReviews.length > 0 && (
        <div className="mt-8 space-y-4">
          {displayReviews.map((review) => (
            <ReviewItem key={review.reviewId} review={review} />
          ))}

          {sortedReviews.length > 3 && (
            <button
              ref={openButtonRef}
              onClick={() => setIsModalOpen(true)}
              className="mt-4 flex min-h-11 w-full items-center justify-center border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-ink transition-colors hover:border-[var(--public-teal)] hover:text-[var(--public-teal)]"
            >
              ดูรีวิวทั้งหมด {sortedReviews.length.toLocaleString("th-TH")} รีวิว
            </button>
          )}
        </div>
      )}

      {resolvedState === "empty" ? (
        <div className="mt-8 border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
          <p className="text-sm font-bold text-muted">
            ยังไม่มีรีวิวที่เผยแพร่
          </p>
        </div>
      ) : null}

      {resolvedState === "unavailable" ? (
        <div className="mt-8 border border-amber-200 bg-amber-50 p-6 text-center text-amber-950">
          <p className="text-sm font-bold">โหลดรีวิวไม่ได้ในขณะนี้</p>
          <p className="mt-1 text-sm">คุณยังส่งรีวิวได้ตามปกติ หรือลองเปิดหน้านี้อีกครั้งภายหลัง</p>
        </div>
      ) : null}

      {/* Review Submission Form */}
      {children}

      {/* View All Reviews Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4 sm:p-6">
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="all-reviews-title"
            onKeyDown={keepFocusInsideDialog}
            className="relative flex max-h-[90dvh] w-full max-w-2xl flex-col overflow-hidden bg-white"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-ink/5 p-6">
              <div>
                <h3 id="all-reviews-title" className="text-xl font-bold text-ink">รีวิวทั้งหมด</h3>
                <p className="text-sm text-muted">จากผู้เยี่ยมชม {sortedReviews.length} คน</p>
              </div>
              <button
                ref={closeButtonRef}
                onClick={closeModal}
                aria-label="ปิดรีวิวทั้งหมด"
                className="flex h-11 w-11 items-center justify-center border border-slate-300 bg-white text-slate-700 transition-colors hover:bg-slate-100"
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
    </section>
  );
}

function ReviewItem({ review }: { review: CompatibleReviewCard }) {
  const authorLabel = "authorLabel" in review ? review.authorLabel : review.touristName;
  return (
    <article className="border border-slate-200 bg-white p-5">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-ink">{authorLabel}</p>
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
    </article>
  );
}
