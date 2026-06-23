"use client";

import { DownloadSimple, CaretDown } from "@phosphor-icons/react/dist/ssr";
import { useSearchParams } from "next/navigation";
import { useState, useRef, useEffect } from "react";

type ExportButtonProps = {
  endpoint: string;
  label?: string;
  params?: Record<string, string | number | boolean | null | undefined>;
};

export function ExportButton({ endpoint, label = "Export", params }: ExportButtonProps) {
  const searchParams = useSearchParams();
  const [format, setFormat] = useState<"csv" | "xlsx">("csv");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const mergedParams = new URLSearchParams(params ? undefined : searchParams.toString());
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value === null || value === undefined || value === "") continue;
      mergedParams.set(key, String(value));
    }
  }
  mergedParams.set("format", format);
  const url = `${endpoint}?${mergedParams.toString()}`;

  const formatLabel = format === "csv" ? "CSV" : "Excel";

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="inline-flex items-center rounded-xl border border-slate-200 bg-white shadow-sm transition-all">
        <a
          href={url}
          download
          className="export-btn inline-flex items-center gap-2 rounded-l-xl px-4 py-2.5 text-sm font-bold text-slate-700 transition-all hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#0A6B62]/50 active:bg-slate-100"
        >
          <DownloadSimple size={18} weight="bold" />
          {label} ({formatLabel})
        </a>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center rounded-r-xl border-l border-slate-200 px-2 py-2.5 text-sm text-slate-500 transition-all hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#0A6B62]/50"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <CaretDown size={14} weight="bold" />
        </button>
      </div>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-1 min-w-[180px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
          <button
            type="button"
            onClick={() => { setFormat("csv"); setIsOpen(false); }}
            className={`flex w-full items-center px-4 py-2.5 text-left text-sm transition-colors hover:bg-slate-50 ${
              format === "csv" ? "font-bold text-[#0A6B62]" : "text-slate-700"
            }`}
            role="option"
            aria-selected={format === "csv"}
          >
            CSV (.csv)
          </button>
          <button
            type="button"
            onClick={() => { setFormat("xlsx"); setIsOpen(false); }}
            className={`flex w-full items-center px-4 py-2.5 text-left text-sm transition-colors hover:bg-slate-50 ${
              format === "xlsx" ? "font-bold text-[#0A6B62]" : "text-slate-700"
            }`}
            role="option"
            aria-selected={format === "xlsx"}
          >
            Excel (.xlsx)
          </button>
        </div>
      )}
    </div>
  );
}
