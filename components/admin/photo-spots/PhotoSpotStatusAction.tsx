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
    const confirmed = window.confirm(
      isActive
        ? "ปิดใช้งานจุดถ่ายภาพนี้หรือไม่? QR ที่เชื่อมอยู่จะไม่พร้อมใช้งาน"
        : "เปิดใช้งานจุดถ่ายภาพนี้หรือไม่?"
    );
    if (!confirmed) return;

    startTransition(async () => {
      const result = await togglePhotoSpotActiveAction(photoSpotId);
      if (!result.success) {
        window.alert(result.error || "เปลี่ยนสถานะจุดถ่ายภาพไม่สำเร็จ");
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      aria-label={isActive ? "ปิดใช้งานจุดถ่ายภาพ" : "เปิดใช้งานจุดถ่ายภาพ"}
      title={isActive ? "ปิดใช้งานจุดถ่ายภาพ" : "เปิดใช้งานจุดถ่ายภาพ"}
      className={`flex h-11 w-11 items-center justify-center rounded-lg transition hover:bg-slate-100 disabled:opacity-40 ${
        isActive ? "text-emerald-600 hover:text-rose-600" : "text-slate-500 hover:text-emerald-600"
      }`}
    >
      <Power size={18} weight="bold" />
    </button>
  );
}
