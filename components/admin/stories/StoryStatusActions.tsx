"use client";

import { useTransition } from "react";
import { Eye, EyeSlash, PencilSimple, Image } from "@phosphor-icons/react";
import { toggleStoryPublishAction } from "@/app/actions/admin-story-actions";
import Link from "next/link";

interface StoryStatusActionsProps {
  storyId: number;
  isPublished: boolean;
}

export function StoryStatusActions({
  storyId,
  isPublished,
}: StoryStatusActionsProps) {
  const [isPending, startTransition] = useTransition();

  const handleTogglePublish = () => {
    startTransition(async () => {
      await toggleStoryPublishAction(storyId);
    });
  };

  return (
    <div className="flex items-center justify-end gap-1">
      <Link
        href={`/admin/stories/${storyId}/media`}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-[#0A6B62]"
        title="Manage Media"
      >
        <Image size={16} weight="bold" />
      </Link>
      <Link
        href={`/admin/stories/${storyId}/edit`}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-[#0A6B62]"
        title="Edit Story"
      >
        <PencilSimple size={16} weight="bold" />
      </Link>
      <button
        type="button"
        onClick={handleTogglePublish}
        disabled={isPending}
        title={isPublished ? "Unpublish public story" : "Publish public story"}
        aria-label={isPublished ? "Unpublish public story" : "Publish public story"}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-[#0A6B62] disabled:opacity-40"
      >
        {isPublished ? <EyeSlash size={16} weight="bold" /> : <Eye size={16} weight="bold" />}
      </button>
    </div>
  );
}
