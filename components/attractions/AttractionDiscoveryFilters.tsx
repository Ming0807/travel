"use client";

import { Funnel, MagnifyingGlass, MapTrifold, X } from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import type { PublicSelectOption } from "@/components/public/PublicFields";
import "./attraction-experience.css";

export interface AttractionDiscoveryFiltersProps {
  query?: string;
  selectedType?: string;
  selectedDistrict?: string;
  typeOptions: PublicSelectOption[];
  districtOptions: PublicSelectOption[];
}

export function AttractionDiscoveryFilters({
  query,
  selectedType,
  selectedDistrict,
  typeOptions,
  districtOptions,
}: AttractionDiscoveryFiltersProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const hasFilters = Boolean(query || selectedType || selectedDistrict);

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const params = new URLSearchParams();
    for (const name of ["q", "type", "district"]) {
      const value = fields.get(name);
      if (typeof value === "string" && value.trim()) params.set(name, value.trim());
    }
    const search = params.toString();
    startTransition(() => router.push(`/attractions${search ? `?${search}` : ""}#attraction-results-heading`));
  };

  const typeHref = (type?: string) => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (type) params.set("type", type);
    if (selectedDistrict) params.set("district", selectedDistrict);
    const value = params.toString();
    return value ? `/attractions?${value}` : "/attractions";
  };

  return (
    <div className="relative -mt-8 z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="rounded-2xl bg-white p-4 shadow-md shadow-orange-950/5 sm:p-6">
        {/* Mobile Filter Toggle Button */}
        <div className="flex items-center justify-between sm:hidden">
          <p className="text-xs font-bold text-ink">ค้นหาและกรองสถานที่</p>
          <button
            type="button"
            aria-expanded={mobileOpen}
            aria-controls="attraction-extra-filters"
            onClick={() => setMobileOpen((open) => !open)}
            className="attraction-control inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-orange-200 bg-orange-50/50 px-3 py-1.5 text-xs font-bold text-coral hover:bg-orange-100/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-coral"
          >
            <Funnel aria-hidden="true" size={16} weight="bold" />
            {mobileOpen ? "ซ่อนตัวกรอง" : "เปิดตัวกรอง"}
          </button>
        </div>

        {/* Main Search & Dropdown Form */}
        <form
          id="attraction-filter-form"
          action="/attractions"
          method="GET"
          onSubmit={submitSearch}
          aria-busy={isPending}
          key={JSON.stringify([query, selectedType, selectedDistrict])}
          className="mt-4 sm:mt-0"
        >
          <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1.4fr)_auto]">
            {/* Search Input */}
            <div className="relative">
              <label htmlFor="attraction-search" className="sr-only">
                ค้นหาสถานที่
              </label>
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted">
                <MagnifyingGlass size={18} weight="bold" aria-hidden="true" />
              </div>
              <input
                id="attraction-search"
                name="q"
                type="search"
                defaultValue={query ?? ""}
                placeholder="ชื่อสถานที่หรือคำที่สนใจ"
                className="attraction-control w-full min-h-12 rounded-xl border border-ink/15 bg-cream/40 pl-10 pr-4 text-sm font-semibold text-ink placeholder:text-muted focus:border-coral focus:bg-white focus:outline-none focus:ring-2 focus:ring-coral/20"
              />
            </div>

            <div id="attraction-extra-filters" className={`${mobileOpen ? "grid" : "hidden"} min-w-0 gap-3 sm:grid sm:grid-cols-2`}>
            {/* Category / Type Select */}
            <div className="relative">
              <label htmlFor="attraction-type" className="sr-only">
                ประเภทสถานที่
              </label>
              <select
                id="attraction-type"
                name="type"
                defaultValue={selectedType ?? ""}
                className="attraction-control w-full min-h-12 rounded-xl border border-ink/15 bg-cream/40 px-3.5 text-sm font-semibold text-ink focus:border-coral focus:bg-white focus:outline-none focus:ring-2 focus:ring-coral/20"
              >
                <option value="">ทุกประเภท</option>
                {typeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* District Select */}
            <div className="relative">
              <label htmlFor="attraction-district" className="sr-only">
                อำเภอ
              </label>
              <select
                id="attraction-district"
                name="district"
                defaultValue={selectedDistrict ?? ""}
                className="attraction-control w-full min-h-12 rounded-xl border border-ink/15 bg-cream/40 px-3.5 text-sm font-semibold text-ink focus:border-coral focus:bg-white focus:outline-none focus:ring-2 focus:ring-coral/20"
              >
                <option value="">ทุกอำเภอ (จ.ยะลา)</option>
                {districtOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={isPending}
                className="attraction-control inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#b94727] px-6 text-sm font-black text-white hover:bg-[#96391f] disabled:cursor-wait disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral"
              >
                <MagnifyingGlass size={18} weight="bold" aria-hidden="true" />
                <span>{isPending ? "กำลังค้นหา…" : "ค้นหาสถานที่"}</span>
              </button>

              {hasFilters ? (
                <Link
                  href="/attractions"
                  aria-label="ล้างตัวกรอง"
                  className="inline-flex min-h-12 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-ink/15 bg-white px-4 text-xs font-bold text-muted transition-colors hover:bg-black/5 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral"
                >
                  <X size={15} weight="bold" aria-hidden="true" />
                  <span>ล้างตัวกรอง</span>
                </Link>
              ) : null}
            </div>
          </div>
          <p role="status" className="sr-only">{isPending ? "กำลังค้นหาสถานที่ กรุณารอสักครู่" : ""}</p>
        </form>

        {/* Quick Filter Category Chips & Map View (Bottom Row) */}
        <div className="mt-4 flex flex-col gap-3 border-t border-orange-100/70 pt-3.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="hide-scrollbar flex min-w-0 items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="shrink-0 font-bold text-muted">ค้นหายอดนิยม:</span>
            <Link
              href={typeHref()}
              className={
                !selectedType
                  ? "attraction-control min-h-11 shrink-0 inline-flex items-center rounded-full px-3 py-1 font-bold bg-coral/10 text-[#b94727] border border-coral/30"
                  : "attraction-control min-h-11 shrink-0 inline-flex items-center rounded-full px-3 py-1 font-semibold bg-cream text-ink/75 hover:bg-orange-50 hover:text-coral border border-ink/5"
              }
            >
              ทั้งหมด
            </Link>
            {typeOptions.map((opt) => {
              const isActive = selectedType === opt.value;
              const href = typeHref(isActive ? undefined : opt.value);
              return (
                <Link
                  key={opt.value}
                  href={href}
                  className={
                    isActive
                      ? "attraction-control min-h-11 shrink-0 inline-flex items-center rounded-full px-3 py-1 font-bold bg-[#b94727] text-white"
                      : "attraction-control min-h-11 shrink-0 inline-flex items-center rounded-full px-3 py-1 font-semibold bg-cream text-ink/75 hover:bg-orange-50 hover:text-coral border border-ink/5"
                  }
                >
                  {opt.label}
                </Link>
              );
            })}
          </div>

          <Link
            href="/routes"
            className="inline-flex min-h-8 shrink-0 items-center justify-center gap-1.5 self-end rounded-full border border-orange-200 bg-orange-50/60 px-3.5 py-1 text-xs font-black text-coral transition-colors hover:bg-coral hover:text-white sm:self-auto"
          >
            <MapTrifold size={15} weight="bold" aria-hidden="true" />
            <span>ดูเส้นทาง</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
