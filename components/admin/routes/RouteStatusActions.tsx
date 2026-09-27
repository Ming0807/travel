"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeSlash, PencilSimple, MapPinLine, Power, Image as ImageIcon } from "@phosphor-icons/react";
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
    <div className="flex flex-wrap items-center justify-end gap-1">
      <Link
        href={`/admin/routes/${routeId}/stops`}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-[#0A6B62]"
        title="จัดการจุดแวะ"
        aria-label="จัดการจุดแวะ"
      >
        <MapPinLine size={16} weight="bold" />
      </Link>
      <Link
        href={`/admin/routes/${routeId}/media`}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-[#0A6B62]"
        title="จัดการรูปภาพ"
        aria-label="จัดการรูปภาพ"
      >
        <ImageIcon size={16} weight="bold" />
      </Link>
      <Link
        href={`/admin/routes/${routeId}/edit`}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-[#0A6B62]"
        title="แก้ไขเส้นทาง"
        aria-label="แก้ไขเส้นทาง"
      >
        <PencilSimple size={16} weight="bold" />
      </Link>
      <button
        type="button"
        onClick={() => changeStatus(() => toggleRoutePublishAction(routeId))}
        disabled={isPending}
        title={isPublished ? "ยกเลิกเผยแพร่เส้นทาง" : "เผยแพร่เส้นทาง"}
        aria-label={isPublished ? "ยกเลิกเผยแพร่เส้นทาง" : "เผยแพร่เส้นทาง"}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-[#0A6B62] disabled:opacity-40"
      >
        {isPublished ? <EyeSlash size={16} weight="bold" /> : <Eye size={16} weight="bold" />}
      </button>
      <button
        type="button"
        onClick={() => changeStatus(() => toggleRouteActiveAction(routeId))}
        disabled={isPending}
        title={isActive ? "ปิดใช้งานเส้นทาง" : "เปิดใช้งานเส้นทาง"}
        aria-label={isActive ? "ปิดใช้งานเส้นทาง" : "เปิดใช้งานเส้นทาง"}
        className={`flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-slate-100 disabled:opacity-40 ${
          isActive ? "text-emerald-600 hover:text-rose-600" : "text-slate-400 hover:text-emerald-600"
        }`}
      >
        <Power size={16} weight="bold" />
      </button>
      {isActive ? (
        <CmsArchiveButton entityId={routeId} entityName={routeName} entityType="route" />
      ) : null}
      {error ? <p role="alert" className="w-full rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-left text-xs font-medium text-rose-800">{error}</p> : null}
    </div>
  );
}
