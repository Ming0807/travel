"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star, CheckCircle, XCircle, Trash, ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { approveReviewAction, rejectReviewAction, deleteReviewAction } from "@/app/actions/admin-review-actions";

type Props = {
  review: {
    reviewId: number;
    touristName: string;
    rating: number;
    title: string | null;
    comment: string | null;
    attractionName: string | null;
    restaurantName: string | null;
    isApproved: boolean;
    isPublished: boolean;
    moderatedAt: string | null;
    createdAt: string;
  };
  canModerate: boolean;
  canDelete: boolean;
};

export function ReviewDetailClient({ review, canModerate, canDelete }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const handleAction = async (action: "approve" | "reject" | "delete") => {
    setStatus("loading");
    setMessage(null);

    let result;
    if (action === "approve") result = await approveReviewAction(review.reviewId);
    else if (action === "reject") result = await rejectReviewAction(review.reviewId);
    else result = await deleteReviewAction(review.reviewId);

    setStatus("done");
    if (result.success) {
      setMessage(
        action === "approve"
          ? "Review approved and published successfully!"
          : action === "reject"
          ? "Review rejected."
          : "Review deleted."
      );
      router.refresh();
    } else {
      setMessage(result.error ?? "Action failed.");
      setStatus("idle");
    }
  };

  return (
    <div className="max-w-3xl">
      {/* Back link */}
      <button
        onClick={() => router.push("/admin/reviews")}
        className="mb-6 flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Reviews
      </button>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-black text-slate-800">Review Detail</h1>
          <span
            className={`rounded-full px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
              review.isApproved
                ? "bg-green-50 text-green-600"
                : "bg-amber-50 text-amber-600"
            }`}
          >
            {review.isApproved ? "Approved" : "Pending"}
          </span>
        </div>
      </div>

      {/* Review Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm mb-6">
        {/* Tourist Info & Rating */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-lg font-black text-slate-800">{review.touristName}</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    weight={i < review.rating ? "fill" : "regular"}
                    className={i < review.rating ? "text-amber-400" : "text-slate-200"}
                  />
                ))}
              </div>
              <span className="text-sm text-slate-400 font-semibold">
                {new Date(review.createdAt).toLocaleDateString("th-TH", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>

          {review.attractionName && (
            <span className="rounded-full bg-blue-50 text-blue-600 px-3 py-1 text-xs font-bold">
              {review.attractionName}
            </span>
          )}
          {review.restaurantName && (
            <span className="rounded-full bg-emerald-50 text-emerald-600 px-3 py-1 text-xs font-bold">
              {review.restaurantName}
            </span>
          )}
        </div>

        {/* Title */}
        {review.title && (
          <h3 className="text-base font-bold text-slate-700 mb-2">{review.title}</h3>
        )}

        {/* Comment */}
        {review.comment ? (
          <p className="text-sm leading-relaxed text-slate-600 whitespace-pre-line">{review.comment}</p>
        ) : (
          <p className="text-sm italic text-slate-400">No written comment.</p>
        )}

        {/* Moderation Info */}
        {review.moderatedAt && (
          <p className="mt-4 text-xs text-slate-400">
            Moderated at {new Date(review.moderatedAt).toLocaleString("th-TH")}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        {canModerate && !review.isApproved && (
          <button
            onClick={() => handleAction("approve")}
            disabled={status === "loading"}
            className="flex items-center gap-2 rounded-xl bg-green-50 px-5 py-2.5 text-sm font-bold text-green-600 transition-colors hover:bg-green-100 disabled:opacity-50"
          >
            <CheckCircle size={18} weight="fill" />
            Approve & Publish
          </button>
        )}
        {canModerate && review.isApproved && (
          <button
            onClick={() => handleAction("reject")}
            disabled={status === "loading"}
            className="flex items-center gap-2 rounded-xl bg-amber-50 px-5 py-2.5 text-sm font-bold text-amber-600 transition-colors hover:bg-amber-100 disabled:opacity-50"
          >
            <XCircle size={18} weight="fill" />
            Reject
          </button>
        )}
        {canDelete && (
          <button
            onClick={() => handleAction("delete")}
            disabled={status === "loading"}
            className="flex items-center gap-2 rounded-xl bg-red-50 px-5 py-2.5 text-sm font-bold text-red-500 transition-colors hover:bg-red-100 disabled:opacity-50"
          >
            <Trash size={16} />
            Delete
          </button>
        )}
      </div>

      {/* Status Message */}
      {message && (
        <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600">
          {message}
        </div>
      )}
    </div>
  );
}
