"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { MagnifyingGlass, X } from "@phosphor-icons/react/dist/ssr";
import { useRef, useState, useCallback, useTransition } from "react";

interface SearchInputProps {
  placeholder?: string;
  paramKey?: string;
}

export function SearchInput({ placeholder = "ค้นหา...", paramKey = "search" }: SearchInputProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(searchParams.get(paramKey) ?? "");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const applySearch = useCallback(
    (term: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (term.trim()) {
        params.set(paramKey, term.trim());
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => applySearch(newValue), 400);
  };

  const handleClear = () => {
    setValue("");
    applySearch("");
    inputRef.current?.focus();
  };

  return (
    <div className="relative">
      <MagnifyingGlass
        size={16}
        weight="bold"
        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
      />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-9 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/20"
      />
      {value && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          aria-label="Clear search"
        >
          <X size={14} weight="bold" />
        </button>
      )}
      {isPending && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-200 border-t-[#0A6B62]" />
        </div>
      )}
    </div>
  );
}
