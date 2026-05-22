"use client";

import { DownloadSimple } from "@phosphor-icons/react";
import { useSearchParams } from "next/navigation";

export function ExportCsvButton() {
  const searchParams = useSearchParams();
  const queryString = searchParams?.toString() ? `?${searchParams.toString()}` : "";

  return (
    <a
      href={`/api/admin/dashboard/export${queryString}`}
      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900"
    >
      <DownloadSimple className="h-4 w-4" />
      Export Summary CSV
    </a>
  );
}
