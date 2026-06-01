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
        title="แก้ไขสถานที่"
        aria-label="แก้ไขสถานที่"
        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-[#0A6B62] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A6B62]"
      >
        <PencilSimple size={16} weight="bold" aria-hidden="true" />
      </Link>
      <Link
        href={`/admin/attractions/${attractionId}/media`}
        title="จัดการรูปภาพ"
        aria-label="จัดการรูปภาพ"
        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-[#0A6B62] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A6B62]"
      >
        <Image size={16} weight="bold" aria-hidden="true" />
      </Link>
      <Link
        href={`/admin/photo-spots?attractionId=${attractionId}`}
        title="จัดการจุดถ่ายภาพ"
        aria-label="จัดการจุดถ่ายภาพ"
        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-[#0A6B62] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A6B62]"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256" aria-hidden="true">
          <path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40ZM40,56H216V158.75l-46.63-46.63a16,16,0,0,0-22.62,0l-53.5,53.5L78.63,151a16,16,0,0,0-22.62,0L40,167.06ZM216,200H40V189.69l27.31-27.32,14.63,14.63a16,16,0,0,0,22.62,0l53.5-53.5L216,181.37ZM88,104a12,12,0,1,1,12,12A12,12,0,0,1,88,104Z"></path>
        </svg>
      </Link>
      <Link
        href={`/admin/checkin-codes?attractionId=${attractionId}`}
        title="จัดการ QR Codes"
        aria-label="จัดการ QR Codes"
        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-[#0A6B62] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A6B62]"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256" aria-hidden="true">
          <path d="M104,40H48A8,8,0,0,0,40,48v56a8,8,0,0,0,8,8h56a8,8,0,0,0,8-8V48A8,8,0,0,0,104,40Zm-8,48H56V56h40ZM104,144H48a8,8,0,0,0-8,8v56a8,8,0,0,0,8,8h56a8,8,0,0,0,8-8V152A8,8,0,0,0,104,144Zm-8,48H56V160h40Zm112-96a8,8,0,0,0-8-8H152a8,8,0,0,0-8,8v56a8,8,0,0,0,8,8h48a8,8,0,0,0,8-8Zm-16,48H160V104h32Zm16,48H152a8,8,0,0,0-8,8v16a8,8,0,0,0,16,0h40a8,8,0,0,0,8-8v-8A8,8,0,0,0,208,192Z"></path>
        </svg>
      </Link>
      <button
        onClick={handleTogglePublish}
        disabled={isPending}
        title={isPublished ? "Unpublish" : "Publish"}
        aria-label={isPublished ? "Unpublish" : "Publish"}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-[#0A6B62] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A6B62] disabled:opacity-40"
      >
        {isPublished ? <EyeSlash size={16} weight="bold" aria-hidden="true" /> : <Eye size={16} weight="bold" aria-hidden="true" />}
      </button>
      <button
        onClick={handleToggleActive}
        disabled={isPending}
        title={isActive ? "Deactivate" : "Activate"}
        aria-label={isActive ? "Deactivate" : "Activate"}
        className={`flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A6B62] disabled:opacity-40 ${
          isActive ? "text-emerald-600 hover:text-rose-600" : "text-slate-400 hover:text-emerald-600"
        }`}
      >
        <Power size={16} weight="bold" aria-hidden="true" />
      </button>
    </div>
  );
}
