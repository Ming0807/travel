"use client";

import { useTransition } from "react";
import { Eye, EyeSlash, PencilSimple, MapPinLine, Power, Image } from "@phosphor-icons/react";
import { toggleRoutePublishAction, toggleRouteActiveAction } from "@/app/actions/admin-route-actions";
import Link from "next/link";

interface RouteStatusActionsProps {
  routeId: number;
  isPublished: boolean;
  isActive: boolean;
}

export function RouteStatusActions({
  routeId,
  isPublished,
  isActive,
}: RouteStatusActionsProps) {
  const [isPending, startTransition] = useTransition();

  const handleTogglePublish = () => {
    startTransition(async () => {
      await toggleRoutePublishAction(routeId);
    });
  };

  const handleToggleActive = () => {
    startTransition(async () => {
      await toggleRouteActiveAction(routeId);
    });
  };

  return (
    <div className="flex items-center justify-end gap-1">
      <Link
        href={`/admin/routes/${routeId}/stops`}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-[#0A6B62]"
        title="Manage Route Stops"
      >
        <MapPinLine size={16} weight="bold" />
      </Link>
      <Link
        href={`/admin/routes/${routeId}/media`}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-[#0A6B62]"
        title="Manage Media"
      >
        <Image size={16} weight="bold" />
      </Link>
      <Link
        href={`/admin/routes/${routeId}/edit`}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-[#0A6B62]"
        title="Edit Route Info"
      >
        <PencilSimple size={16} weight="bold" />
      </Link>
      <button
        type="button"
        onClick={handleTogglePublish}
        disabled={isPending}
        title={isPublished ? "Unpublish public route" : "Publish public route"}
        aria-label={isPublished ? "Unpublish public route" : "Publish public route"}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-[#0A6B62] disabled:opacity-40"
      >
        {isPublished ? <EyeSlash size={16} weight="bold" /> : <Eye size={16} weight="bold" />}
      </button>
      <button
        type="button"
        onClick={handleToggleActive}
        disabled={isPending}
        title={isActive ? "Deactivate route" : "Activate route"}
        aria-label={isActive ? "Deactivate route" : "Activate route"}
        className={`flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-slate-100 disabled:opacity-40 ${
          isActive ? "text-emerald-600 hover:text-rose-600" : "text-slate-400 hover:text-emerald-600"
        }`}
      >
        <Power size={16} weight="bold" />
      </button>
    </div>
  );
}
