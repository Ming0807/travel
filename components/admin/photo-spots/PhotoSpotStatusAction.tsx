"use client";

import { useTransition } from "react";
import { Power } from "@phosphor-icons/react";
import { togglePhotoSpotActiveAction } from "@/app/actions/admin-photo-spot-actions";

interface PhotoSpotStatusActionProps {
  photoSpotId: number;
  isActive: boolean;
}

export function PhotoSpotStatusAction({ photoSpotId, isActive }: PhotoSpotStatusActionProps) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      await togglePhotoSpotActiveAction(photoSpotId);
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      title={isActive ? "Deactivate" : "Activate"}
      className={`flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-slate-100 disabled:opacity-40 ${
        isActive ? "text-emerald-600 hover:text-rose-600" : "text-slate-400 hover:text-emerald-600"
      }`}
    >
      <Power size={16} weight="bold" />
    </button>
  );
}
