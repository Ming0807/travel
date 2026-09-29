"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  DotsThreeVertical,
  Eye,
  EyeSlash,
  Image as ImageIcon,
  MapPinLine,
  PencilSimple,
  Power,
} from "@phosphor-icons/react";
import { toggleRoutePublishAction, toggleRouteActiveAction } from "@/app/actions/admin-route-actions";
import Link from "next/link";
import { CmsArchiveButton } from "@/components/admin/content/CmsArchiveButton";

interface RouteStatusActionsProps {
  routeId: number;
  routeName: string;
  isPublished: boolean;
  isActive: boolean;
}

export function RouteStatusActions({
  routeId,
  routeName,
  isPublished,
  isActive,
}: RouteStatusActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const changeStatus = (action: () => Promise<{ success: boolean; error?: string }>) => {
    setError(null);
    startTransition(async () => {
      try {
        const result = await action();
        if (result.success) router.refresh();
        else setError(result.error ?? "ยังเปลี่ยนสถานะเส้นทางไม่ได้");
      } catch {
        setError("เชื่อมต่อไม่สำเร็จ กรุณาลองอีกครั้ง");
      }
    });
  };

  return (
    <div className="flex min-w-[176px] flex-col items-stretch gap-2 text-left">
      <Link
        href={`/admin/routes/${routeId}/edit`}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[#0A6B62] px-3 py-2 text-sm font-bold text-[#073F37] transition hover:bg-emerald-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A6B62]"
      >
        <PencilSimple size={16} weight="bold" aria-hidden="true" />
        แก้ไขเส้นทาง
      </Link>
      <details className="rounded-md border border-slate-200 bg-white">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0A6B62] [&::-webkit-details-marker]:hidden">
          การดำเนินการอื่น
          <DotsThreeVertical size={18} weight="bold" aria-hidden="true" />
        </summary>
        <div className="space-y-1 border-t border-slate-200 p-2">
          <Link
            href={`/admin/routes/${routeId}/stops`}
            className="flex min-h-11 items-center gap-2 rounded-md px-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            <MapPinLine size={16} aria-hidden="true" />
            จัดการจุดแวะ
          </Link>
          <Link
            href={`/admin/routes/${routeId}/media`}
            className="flex min-h-11 items-center gap-2 rounded-md px-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            <ImageIcon size={16} aria-hidden="true" />
            จัดการรูปภาพ
          </Link>
          <button
            type="button"
            onClick={() => changeStatus(() => toggleRoutePublishAction(routeId))}
            disabled={isPending}
            className="flex min-h-11 w-full items-center gap-2 rounded-md px-2 text-left text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-40"
          >
            {isPublished ? <EyeSlash size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
            {isPublished ? "ยกเลิกเผยแพร่เส้นทาง" : "เผยแพร่เส้นทาง"}
          </button>
          <button
            type="button"
            onClick={() => changeStatus(() => toggleRouteActiveAction(routeId))}
            disabled={isPending}
            className="flex min-h-11 w-full items-center gap-2 rounded-md px-2 text-left text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-40"
          >
            <Power size={16} aria-hidden="true" />
            {isActive ? "ปิดใช้งานเส้นทาง" : "เปิดใช้งานเส้นทาง"}
          </button>
          {isActive ? (
            <div className="flex items-center gap-2 px-1 text-xs text-slate-600">
              <CmsArchiveButton entityId={routeId} entityName={routeName} entityType="route" />
              <span>เก็บถาวร</span>
            </div>
          ) : null}
        </div>
      </details>
      {error ? (
        <p role="alert" className="w-full rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-left text-xs font-medium text-rose-800">
          {error}
        </p>
      ) : null}
    </div>
  );
}
