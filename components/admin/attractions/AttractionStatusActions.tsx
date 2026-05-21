"use client";

import { useTransition } from "react";
import { Eye, EyeSlash, Power, Image, PencilSimple } from "@phosphor-icons/react";
import Link from "next/link";
import {
  toggleAttractionPublishAction,
  toggleAttractionActiveAction,
} from "@/app/actions/admin-attraction-actions";

interface AttractionStatusActionsProps {
  attractionId: number;
  isPublished: boolean;
  isActive: boolean;
}

export function AttractionStatusActions({
  attractionId,
  isPublished,
  isActive,
}: AttractionStatusActionsProps) {
  const [isPending, startTransition] = useTransition();

  const handleTogglePublish = () => {
    startTransition(async () => {
      await toggleAttractionPublishAction(attractionId);
    });
  };

  const handleToggleActive = () => {
    startTransition(async () => {
      await toggleAttractionActiveAction(attractionId);
    });
  };

  return (
    <div className="flex items-center justify-end gap-1">
      <Link
        href={`/admin/attractions/${attractionId}/edit`}
        title="Edit Attraction"
        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-[#0A6B62]"
      >
        <PencilSimple size={16} weight="bold" />
      </Link>
      <Link
        href={`/admin/attractions/${attractionId}/media`}
        title="Manage Media"
        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-[#0A6B62]"
      >
        <Image size={16} weight="bold" />
      </Link>
      <button
        onClick={handleTogglePublish}
        disabled={isPending}
        title={isPublished ? "Unpublish" : "Publish"}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-[#0A6B62] disabled:opacity-40"
      >
        {isPublished ? <EyeSlash size={16} weight="bold" /> : <Eye size={16} weight="bold" />}
      </button>
      <button
        onClick={handleToggleActive}
        disabled={isPending}
        title={isActive ? "Deactivate" : "Activate"}
        className={`flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-slate-100 disabled:opacity-40 ${
          isActive ? "text-emerald-600 hover:text-rose-600" : "text-slate-400 hover:text-emerald-600"
        }`}
      >
        <Power size={16} weight="bold" />
      </button>
    </div>
  );
}
