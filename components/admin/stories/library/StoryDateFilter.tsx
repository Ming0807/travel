"use client";

import { useId, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function StoryDateFilter({ label, paramKey }: { label: string; paramKey: "dateFrom" | "dateTo" }) {
  const id = useId();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex min-w-0 flex-col gap-1 sm:min-w-[160px]">
      <label htmlFor={id} className="text-xs font-bold text-slate-600">
        {label}
      </label>
      <input
        id={id}
        type="date"
        value={searchParams.get(paramKey) ?? ""}
        disabled={isPending}
        onChange={(event) => {
          const params = new URLSearchParams(searchParams.toString());
          if (event.target.value) params.set(paramKey, event.target.value);
          else params.delete(paramKey);
          params.set("page", "1");
          startTransition(() => router.push(`${pathname}?${params.toString()}`));
        }}
        className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/20 disabled:opacity-60"
      />
    </div>
  );
}
