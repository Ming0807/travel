"use client";

import { useTransition } from "react";
import { Eye, EyeSlash, PencilSimple, Image as ImageIcon } from "@phosphor-icons/react";
import { changeStoryStatusAction } from "@/app/actions/admin-story-actions";
import Link from "next/link";

interface StoryStatusActionsProps {
  storyId: number;
  status: string;
}

export function StoryStatusActions({
  storyId,
  status,
}: StoryStatusActionsProps) {
  const [isPending, startTransition] = useTransition();

  const handleTogglePublish = () => {
    startTransition(async () => {
      await changeStoryStatusAction(storyId, status === "published" ? "draft" : "published");
    });
  };

  return (
    <div className="flex items-center justify-end gap-1">
      <Link
        href={`/admin/stories/${storyId}/media`}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-[#0A6B62]"
        title="Manage Media"
      >
        <ImageIcon size={16} weight="bold" />
      </Link>
      <Link
        href={`/admin/stories/${storyId}/edit`}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-[#0A6B62]"
        title="Edit Story"
      >
        <PencilSimple size={16} weight="bold" />
      </Link>
      {status === "pending" ? (
         <Link href={`/admin/stories/${storyId}/edit`} className="text-xs font-semibold text-yellow-600 ml-2 border border-yellow-200 px-2 py-1 rounded bg-yellow-50 hover:bg-yellow-100 transition">
           Review
         </Link>
      ) : (
        <button
          type="button"
          onClick={handleTogglePublish}
          disabled={isPending}
          title={status === "published" ? "Unpublish public story" : "Publish public story"}
          aria-label={status === "published" ? "Unpublish public story" : "Publish public story"}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-[#0A6B62] disabled:opacity-40"
        >
          {status === "published" ? <EyeSlash size={16} weight="bold" /> : <Eye size={16} weight="bold" />}
        </button>
      )}
    </div>
  );
}
