"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { MagnifyingGlass, X } from "@phosphor-icons/react/dist/ssr";
import { useRef, useState, useCallback, useTransition, useEffect, useId } from "react";

interface SearchInputProps {
  placeholder?: string;
  paramKey?: string;
  label?: string;
}

export function SearchInput({ placeholder = "ค้นหา...", paramKey = "search", label }: SearchInputProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(searchParams.get(paramKey) ?? "");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const inputId = useId();
  const composingRef = useRef(false);
  useEffect(() => () => clearTimeout(debounceRef.current), []);

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
    if (!composingRef.current) debounceRef.current = setTimeout(() => applySearch(newValue), 400);
  };

  const handleClear = () => {
    clearTimeout(debounceRef.current);
    setValue("");
    applySearch("");
    inputRef.current?.focus();
  };

  return (
    <div className="flex min-w-0 flex-col gap-1">
      {label ? <label htmlFor={inputId} className="text-xs font-bold text-slate-600">{label}</label> : null}
      <div className="relative" aria-busy={isPending}>
      <MagnifyingGlass
        size={16}
        weight="bold"
        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
      />
      <input
        ref={inputRef}
        id={inputId}
        aria-label={label ?? placeholder}
        type="text"
        value={value}
        onChange={handleChange}
        onCompositionStart={() => { composingRef.current = true; clearTimeout(debounceRef.current); }}
        onCompositionEnd={(event) => {
          composingRef.current = false;
          const term = event.currentTarget.value;
          setValue(term);
          clearTimeout(debounceRef.current);
          debounceRef.current = setTimeout(() => applySearch(term), 400);
        }}
        onKeyDown={(event) => {
          if (composingRef.current || event.nativeEvent.isComposing) return;
          if (event.key === "Enter") { event.preventDefault(); clearTimeout(debounceRef.current); applySearch(event.currentTarget.value); }
          if (event.key === "Escape" && value) { event.preventDefault(); handleClear(); }
        }}
        placeholder={placeholder}
        className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-12 text-sm text-slate-700 outline-none transition placeholder:text-slate-500 focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/20"
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-0 top-0 grid h-11 w-11 place-items-center rounded-lg text-slate-500 hover:text-slate-800 focus-visible:outline-2 focus-visible:outline-[#0A6B62]"
          aria-label="ล้างคำค้นหา"
        >
          <X size={14} weight="bold" />
        </button>
      )}
      {isPending && !value && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-200 border-t-[#0A6B62]" />
        </div>
      )}
      {isPending ? <span role="status" className="sr-only">กำลังค้นหา...</span> : null}
      </div>
    </div>
  );
}
