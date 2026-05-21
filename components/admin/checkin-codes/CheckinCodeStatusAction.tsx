"use client";

import { useTransition } from "react";
import { Power, PencilSimple } from "@phosphor-icons/react";
import Link from "next/link";
import { toggleCheckinCodeActiveAction } from "@/app/actions/admin-checkin-code-actions";

interface CheckinCodeStatusActionProps {
  checkinCodeId: number;
  isActive: boolean;
}

export function CheckinCodeStatusAction({ checkinCodeId, isActive }: CheckinCodeStatusActionProps) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      await toggleCheckinCodeActiveAction(checkinCodeId);
    });
  };

  return (
    <div className="flex items-center justify-end gap-1">
      <Link
        href={`/admin/checkin-codes/${checkinCodeId}/edit`}
        title="Edit Check-in Code"
        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-[#0A6B62]"
      >
        <PencilSimple size={16} weight="bold" />
      </Link>
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
    </div>
  );
}
