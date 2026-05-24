"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { CaretLeft, CaretRight } from "@phosphor-icons/react/dist/ssr";
import { useCallback } from "react";

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
}

export function Pagination({ page, pageSize, total }: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = Math.min((page - 1) * pageSize + 1, total);
  const to = Math.min(page * pageSize, total);

  const navigate = useCallback(
    (newPage: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", String(newPage));
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  if (total === 0) return null;

  return (
    <div className="flex items-center justify-between px-1 py-3">
      <p className="text-xs font-semibold text-slate-500">
        แสดง {from}–{to} จาก {total.toLocaleString("th-TH")} รายการ
      </p>
      <div className="flex items-center gap-1">
        <button
          disabled={page <= 1}
          onClick={() => navigate(page - 1)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Previous page"
        >
          <CaretLeft weight="bold" size={14} />
        </button>
        <span className="min-w-[3rem] text-center text-xs font-bold text-[#073F37]">
          {page} / {totalPages}
        </span>
        <button
          disabled={page >= totalPages}
          onClick={() => navigate(page + 1)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Next page"
        >
          <CaretRight weight="bold" size={14} />
        </button>
      </div>
    </div>
  );
}
