"use client";

import { Funnel, MagnifyingGlass, MapTrifold, X } from "@phosphor-icons/react";
import Link from "next/link";
import { useState } from "react";

export interface RestaurantDiscoveryFiltersProps {
  query?: string;
  categorySlug?: string;
  foodType?: string;
  province?: string;
  categoryOptions: Array<{ value: string; label: string }>;
  categoryParam?: "category" | "foodType";
}

export function RestaurantDiscoveryFilters({
  query,
  categorySlug,
  foodType,
  province,
  categoryOptions,
  categoryParam = "category",
}: RestaurantDiscoveryFiltersProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const selectedCategory = categorySlug || foodType;
  const hasFilters = Boolean(query || selectedCategory || province);

  return (
    <div className="relative -mt-8 z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-orange-100/90 bg-white p-4 shadow-xl shadow-orange-500/5 sm:p-6">
        {/* Mobile Filter Toggle Button */}
        <div className="flex items-center justify-between sm:hidden">
          <p className="text-xs font-bold text-ink">ค้นหาและกรองร้านอาหาร</p>
          <button
            type="button"
            aria-expanded={mobileOpen}
            aria-controls="restaurant-filter-form"
            onClick={() => setMobileOpen((open) => !open)}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-orange-200 bg-orange-50/50 px-3 py-1.5 text-xs font-bold text-coral transition-colors hover:bg-orange-100/70"
          >
            <Funnel aria-hidden="true" size={16} weight="bold" />
            {mobileOpen ? "ซ่อนตัวกรอง" : "เปิดตัวกรอง"}
          </button>
        </div>

        {/* Main Search & Dropdown Form */}
        <form
          id="restaurant-filter-form"
          action="/restaurants"
          method="GET"
          className={mobileOpen ? "mt-4 block" : "hidden sm:block"}
        >
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1.8fr)_minmax(180px,1fr)_minmax(160px,0.9fr)_auto]">
            {/* Search Input */}
            <div className="relative">
              <label htmlFor="restaurant-search" className="sr-only">
                ค้นหาร้านอาหาร
              </label>
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted">
                <MagnifyingGlass size={18} weight="bold" aria-hidden="true" />
              </div>
              <input
                id="restaurant-search"
                name="q"
                type="search"
                defaultValue={query ?? ""}
                placeholder="ค้นหาร้านอาหารหรือเมนู เช่น ข้าวมันไก่, โรตี, ติ่มซำ..."
                className="w-full min-h-12 rounded-xl border border-ink/15 bg-cream/40 pl-10 pr-4 text-sm font-semibold text-ink transition-all placeholder:text-muted focus:border-coral focus:bg-white focus:outline-none focus:ring-2 focus:ring-coral/20"
              />
            </div>

            {/* Category / Type Select */}
            <div className="relative">
              <label htmlFor="restaurant-category" className="sr-only">
                หมวดหมู่ร้านอาหาร
              </label>
              <select
                id="restaurant-category"
                name={categoryParam}
                defaultValue={selectedCategory ?? ""}
                className="w-full min-h-12 rounded-xl border border-ink/15 bg-cream/40 px-3.5 text-sm font-semibold text-ink transition-all focus:border-coral focus:bg-white focus:outline-none focus:ring-2 focus:ring-coral/20"
              >
                <option value="">หมวดหมู่ร้านอาหาร</option>
                {categoryOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* District / Scope Visual Selector (Disabled to preserve Yala scope) */}
            <div className="relative hidden sm:block">
              <label htmlFor="restaurant-district" className="sr-only">
                อำเภอ
              </label>
              <select
                id="restaurant-district"
                disabled
                defaultValue="all"
                className="w-full min-h-12 cursor-not-allowed rounded-xl border border-ink/10 bg-black/5 px-3.5 text-sm font-semibold text-muted"
              >
                <option value="all">ทุกอำเภอ (จ.ยะลา)</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-6 text-sm font-black text-white shadow-md shadow-orange-500/20 transition-all hover:scale-[1.02] hover:shadow-orange-500/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral sm:flex-initial"
              >
                <MagnifyingGlass size={18} weight="bold" aria-hidden="true" />
                <span>ค้นหาร้านอาหาร</span>
              </button>

              {hasFilters ? (
                <Link
                  href="/restaurants"
                  aria-label="ล้างตัวกรอง"
                  className="inline-flex min-h-12 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-ink/15 bg-white px-4 text-xs font-bold text-muted transition-colors hover:bg-black/5 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral"
                >
                  <X size={15} weight="bold" aria-hidden="true" />
                  <span>ล้างตัวกรอง</span>
                </Link>
              ) : null}
            </div>
          </div>
        </form>

        {/* Quick Filter Category Chips & Map View (Bottom Row) */}
        <div className="mt-4 flex flex-col gap-3 border-t border-orange-100/70 pt-3.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="hide-scrollbar flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="shrink-0 font-bold text-muted">ค้นหายอดนิยม:</span>
            <Link
              href="/restaurants"
              className={
                !selectedCategory
                  ? "min-h-8 shrink-0 inline-flex items-center rounded-full px-3 py-1 font-bold bg-coral/10 text-coral border border-coral/30"
                  : "min-h-8 shrink-0 inline-flex items-center rounded-full px-3 py-1 font-semibold bg-cream text-ink/75 hover:bg-orange-50 hover:text-coral border border-ink/5"
              }
            >
              ร้านอาหารทั้งหมด
            </Link>
            {categoryOptions.map((opt) => {
              const isActive = selectedCategory === opt.value;
              const href = isActive
                ? "/restaurants"
                : `/restaurants?${categoryParam}=${encodeURIComponent(opt.value)}`;
              return (
                <Link
                  key={opt.value}
                  href={href}
                  className={
                    isActive
                      ? "min-h-8 shrink-0 inline-flex items-center rounded-full px-3 py-1 font-bold bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xs"
                      : "min-h-8 shrink-0 inline-flex items-center rounded-full px-3 py-1 font-semibold bg-cream text-ink/75 hover:bg-orange-50 hover:text-coral border border-ink/5"
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
            <span>แผนที่</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
