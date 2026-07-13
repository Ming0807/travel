"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useId, useTransition } from "react";

export interface FilterOption {
  value: string;
  label: string;
}

interface FilterSelectProps {
  label: string;
  paramKey: string;
  options: FilterOption[];
  allLabel?: string;
}

export function FilterSelect({ label, paramKey, options, allLabel = "ทั้งหมด" }: FilterSelectProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const currentValue = searchParams.get(paramKey) ?? "";
  const selectId = useId();

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const params = new URLSearchParams(searchParams.toString());
      if (e.target.value) {
        params.set(paramKey, e.target.value);
      } else {
        params.delete(paramKey);
      }
      params.set("page", "1");
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    },
    [router, pathname, searchParams, paramKey]
  );

  return (
    <div className="flex min-w-0 flex-col gap-1 sm:min-w-[160px]">
      <label htmlFor={selectId} className="text-xs font-bold text-slate-600">
        {label}
      </label>
      <select
        id={selectId}
        value={currentValue}
        onChange={handleChange}
        disabled={isPending}
        className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/20 disabled:opacity-60"
      >
        <option value="">{allLabel}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

interface FilterBarProps {
  children: React.ReactNode;
}

export function FilterBar({ children }: FilterBarProps) {
  return (
    <div className="grid grid-cols-1 gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:flex sm:flex-wrap sm:items-end">
      {children}
    </div>
  );
}
