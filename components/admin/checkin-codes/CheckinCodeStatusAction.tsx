"use client";

import { useTransition } from "react";
import { Power } from "@phosphor-icons/react";
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
