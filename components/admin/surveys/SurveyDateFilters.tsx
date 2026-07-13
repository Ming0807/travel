"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useId, useTransition } from "react";

export function SurveyDateFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const fromId = useId();
  const toId = useId();

  const update = (key: "dateFrom" | "dateTo", value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.set("page", "1");
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  };

  return (
    <div className="grid min-w-0 grid-cols-2 gap-2 sm:min-w-[290px]" aria-busy={isPending}>
      <div className="min-w-0">
        <label htmlFor={fromId} className="text-xs font-bold text-slate-600">ตั้งแต่วันที่</label>
        <input
          id={fromId}
          type="date"
          value={searchParams.get("dateFrom") ?? ""}
          max={searchParams.get("dateTo") ?? undefined}
          disabled={isPending}
          onChange={(event) => update("dateFrom", event.target.value)}
          className="mt-1 h-11 w-full min-w-0 rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-700 outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/20 disabled:opacity-60"
        />
      </div>
      <div className="min-w-0">
        <label htmlFor={toId} className="text-xs font-bold text-slate-600">ถึงวันที่</label>
        <input
          id={toId}
          type="date"
          value={searchParams.get("dateTo") ?? ""}
          min={searchParams.get("dateFrom") ?? undefined}
          disabled={isPending}
          onChange={(event) => update("dateTo", event.target.value)}
          className="mt-1 h-11 w-full min-w-0 rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-700 outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/20 disabled:opacity-60"
        />
      </div>
    </div>
  );
}
