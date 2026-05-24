"use client";

import { DownloadSimple } from "@phosphor-icons/react/dist/ssr";
import { useSearchParams } from "next/navigation";

export function ExportButton({ endpoint, label = "Export CSV" }: { endpoint: string; label?: string }) {
  const searchParams = useSearchParams();

  // Construct the export URL by appending current search params to the endpoint
  const url = `${endpoint}?${searchParams.toString()}`;

  return (
    <a
      href={url}
      download
      className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#0A6B62]/50 active:bg-slate-100"
    >
      <DownloadSimple size={18} weight="bold" />
      {label}
    </a>
  );
}
