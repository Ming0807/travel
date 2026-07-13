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
    const confirmed = window.confirm(
      isActive
        ? "ปิดใช้งาน QR นี้หรือไม่? นักท่องเที่ยวจะไม่สามารถเช็กอินผ่านรหัสนี้ได้"
        : "เปิดใช้งาน QR นี้หรือไม่?"
    );
    if (!confirmed) return;

    startTransition(async () => {
      const result = await toggleCheckinCodeActiveAction(checkinCodeId);
      if (!result.success) {
        window.alert(result.error || "เปลี่ยนสถานะ QR ไม่สำเร็จ");
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      aria-label={isActive ? "ปิดใช้งาน QR" : "เปิดใช้งาน QR"}
      title={isActive ? "ปิดใช้งาน QR" : "เปิดใช้งาน QR"}
      className={`flex h-11 w-11 items-center justify-center rounded-lg transition hover:bg-slate-100 disabled:opacity-40 ${
        isActive ? "text-emerald-600 hover:text-rose-600" : "text-slate-500 hover:text-emerald-600"
      }`}
    >
      <Power size={18} weight="bold" />
    </button>
  );
}
