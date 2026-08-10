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
    if (!attractionId && !restaurantId) {
      setError("ยังไม่พบข้อมูลสถานที่สำหรับส่งรีวิว");
      return;
    }
    if (rating === 0) {
      setError("กรุณาเลือกคะแนนรีวิว");
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
      setError(result.error ?? "ส่งรีวิวไม่สำเร็จ กรุณาลองอีกครั้ง");
    }
  }, [rating, title, comment, attractionId, restaurantId, onSuccess]);

  if (success) {
    return (
      <div role="status" className="rounded-[var(--public-radius-panel)] border border-green-200 bg-green-50 p-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-[var(--public-radius-control)] bg-green-100">
          <Star size={24} weight="fill" className="text-green-500" />
        </div>
        <h3 className="text-lg font-black text-green-800 mb-1">ขอบคุณสำหรับรีวิว</h3>
        <p className="text-sm font-semibold text-green-600">
          ระบบได้รับรีวิวแล้ว และจะแสดงหลังผ่านการตรวจสอบ
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[var(--public-radius-panel)] border border-slate-200 bg-white p-5 sm:p-6">
      <h3 className="mb-2 text-lg font-bold text-ink">แบ่งปันประสบการณ์ของคุณ</h3>
      <p className="mb-6 text-sm leading-6 text-slate-600">
        รีวิวจะแสดงหลังผ่านการตรวจสอบจากผู้ดูแล
      </p>

      <fieldset className="mb-5">
        <legend className="mb-2 text-sm font-bold text-ink">คะแนนรีวิว</legend>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              aria-label={`ให้ ${star} ดาว`}
              aria-pressed={rating === star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-[var(--public-radius-control)] transition-colors hover:bg-amber-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--public-teal)]"
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
      </fieldset>

      {/* Title */}
      <div className="mb-4">
        <label htmlFor="review-title" className="mb-1 block text-sm font-bold text-ink">
          หัวข้อ <span className="text-muted">(ไม่บังคับ)</span>
        </label>
        <input
          id="review-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="สรุปประสบการณ์สั้น ๆ"
          maxLength={255}
          className="min-h-11 w-full rounded-[var(--public-radius-control)] border border-slate-300 bg-white px-4 py-2.5 text-sm text-ink placeholder:text-slate-500 focus:border-[var(--public-teal)] focus:outline-none focus:ring-2 focus:ring-[var(--public-teal)]/20"
        />
      </div>

      {/* Comment */}
      <div className="mb-5">
        <label htmlFor="review-comment" className="mb-1 block text-sm font-bold text-ink">
          ความคิดเห็น <span className="text-muted">(ไม่บังคับ)</span>
        </label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="เล่าประสบการณ์ที่อยากบอกนักเดินทางคนอื่น"
          rows={4}
          maxLength={5000}
          className="w-full resize-y rounded-[var(--public-radius-control)] border border-slate-300 bg-white px-4 py-2.5 text-sm text-ink placeholder:text-slate-500 focus:border-[var(--public-teal)] focus:outline-none focus:ring-2 focus:ring-[var(--public-teal)]/20"
        />
      </div>

      {/* Error */}
      {error && (
        <p role="alert" className="mb-4 text-sm font-bold text-red-700">{error}</p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting || rating === 0 || (!attractionId && !restaurantId)}
        className="min-h-11 w-full rounded-[var(--public-radius-control)] bg-[var(--public-coral)] px-4 py-3 text-sm font-bold text-[var(--public-ink)] transition-colors hover:bg-[#d86548] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--public-teal)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? "กำลังส่ง..." : "ส่งรีวิว"}
      </button>
    </form>
  );
}
