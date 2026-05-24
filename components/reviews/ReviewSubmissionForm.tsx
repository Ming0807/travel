"use client";

import { useState, useCallback } from "react";
import { Star } from "@phosphor-icons/react/dist/ssr";
import { submitReviewAction } from "@/app/actions/submit-review-action";

type ReviewSubmissionFormProps = {
  attractionId?: number;
  restaurantId?: number;
  onSuccess?: () => void;
};

export function ReviewSubmissionForm({ attractionId, restaurantId, onSuccess }: ReviewSubmissionFormProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a rating.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const result = await submitReviewAction({
      attractionId,
      restaurantId,
      rating,
      title: title.trim() || undefined,
      comment: comment.trim() || undefined,
    });

    setSubmitting(false);

    if (result.success) {
      setSuccess(true);
      setRating(0);
      setTitle("");
      setComment("");
      onSuccess?.();
    } else {
      setError(result.error ?? "Failed to submit review. Please try again.");
    }
  }, [rating, title, comment, attractionId, restaurantId, onSuccess]);

  if (success) {
    return (
      <div className="rounded-3xl border border-green-100 bg-green-50 p-6 text-center shadow-sm">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <Star size={24} weight="fill" className="text-green-500" />
        </div>
        <h3 className="text-lg font-black text-green-800 mb-1">Thank You!</h3>
        <p className="text-sm font-semibold text-green-600">
          Your review has been submitted and is pending moderation.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-ink/5 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-black text-ink mb-2">Share Your Experience</h3>
      <p className="mb-6 text-sm font-semibold text-muted">
        Help other travelers by leaving a review.
      </p>

      {/* Star Rating */}
      <div className="mb-5">
        <p className="mb-2 text-sm font-bold text-ink">Your Rating</p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="transition-transform hover:scale-110"
            >
              <Star
                size={28}
                weight={star <= (hoveredRating || rating) ? "fill" : "regular"}
                className={
                  star <= (hoveredRating || rating)
                    ? "text-amber-400"
                    : "text-slate-200"
                }
              />
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div className="mb-4">
        <label htmlFor="review-title" className="mb-1 block text-sm font-bold text-ink">
          Title <span className="text-muted">(optional)</span>
        </label>
        <input
          id="review-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Summarize your experience..."
          maxLength={255}
          className="w-full rounded-xl border border-ink/10 bg-white px-4 py-2.5 text-sm font-semibold text-ink placeholder:text-muted/50 focus:border-coral/30 focus:outline-none focus:ring-2 focus:ring-coral/10"
        />
      </div>

      {/* Comment */}
      <div className="mb-5">
        <label htmlFor="review-comment" className="mb-1 block text-sm font-bold text-ink">
          Comment <span className="text-muted">(optional)</span>
        </label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Tell others about your experience..."
          rows={4}
          maxLength={5000}
          className="w-full resize-none rounded-xl border border-ink/10 bg-white px-4 py-2.5 text-sm font-semibold text-ink placeholder:text-muted/50 focus:border-coral/30 focus:outline-none focus:ring-2 focus:ring-coral/10"
        />
      </div>

      {/* Error */}
      {error && (
        <p className="mb-4 text-sm font-bold text-red-500">{error}</p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting || rating === 0}
        className="w-full rounded-xl bg-coral py-3 text-sm font-black text-white transition-all hover:bg-coral/90 disabled:opacity-50"
      >
        {submitting ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}
