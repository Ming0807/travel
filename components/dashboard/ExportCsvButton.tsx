"use client";

import { DownloadSimple } from "@phosphor-icons/react";
import { useSearchParams } from "next/navigation";

export function ExportCsvButton() {
  const searchParams = useSearchParams();
  const queryString = searchParams?.toString() ? `?${searchParams.toString()}&` : "?";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <a
        href={`/api/admin/dashboard/export${queryString}type=summary`}
        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900"
      >
        <DownloadSimple className="h-4 w-4" />
        Summary
      </a>
      <a
        href={`/api/admin/dashboard/export${queryString}type=tourists`}
        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900"
      >
        <DownloadSimple className="h-4 w-4" />
        Tourists
      </a>
      <a
        href={`/api/admin/dashboard/export${queryString}type=visits`}
        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900"
      >
        <DownloadSimple className="h-4 w-4" />
        Visits
      </a>
      <a
        href={`/api/admin/dashboard/export${queryString}type=surveys`}
        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900"
      >
        <DownloadSimple className="h-4 w-4" />
        Surveys
      </a>
    </div>
  );
}
