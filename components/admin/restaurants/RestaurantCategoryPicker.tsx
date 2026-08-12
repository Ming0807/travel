"use client";

import { useMemo, useState } from "react";
import { Check, MagnifyingGlass, WarningCircle, X } from "@phosphor-icons/react";
import type { AdminRestaurantCategory } from "@/lib/repositories/admin-restaurant-category.repository";

type RestaurantCategoryPickerProps = {
  categories: AdminRestaurantCategory[];
  selectedCategoryIds?: number[];
  error?: string;
};

export function RestaurantCategoryPicker({
  categories,
  selectedCategoryIds = [],
  error,
}: RestaurantCategoryPickerProps) {
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState(() => Array.from(new Set(selectedCategoryIds)));
  const normalizedQuery = query.trim().toLocaleLowerCase("th-TH");

  const filteredCategories = useMemo(() => categories.filter((category) => {
    if (!normalizedQuery) return true;
    return [category.nameTh, category.nameEn ?? "", category.slug]
      .some((value) => value.toLocaleLowerCase("th-TH").includes(normalizedQuery));
  }), [categories, normalizedQuery]);

  const selectedCategories = selectedIds.flatMap((categoryId) => {
    const category = categories.find((item) => item.categoryId === categoryId);
    return category ? [category] : [];
  });
  const activeSelectedCategories = selectedCategories.filter((category) => category.isActive);

  function toggle(categoryId: number) {
    setSelectedIds((current) => current.includes(categoryId)
      ? current.filter((id) => id !== categoryId)
      : current.length < 12 ? [...current, categoryId] : current);
  }

  return (
    <div className="space-y-3">
      {activeSelectedCategories.map((category) => (
        <input
          key={category.categoryId}
          data-testid="restaurant-category-value"
          type="hidden"
          name="categoryIds"
          value={category.categoryId}
        />
      ))}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-bold text-slate-800">หมวดหมู่ร้านอาหาร</p>
          <p className="mt-0.5 text-xs text-slate-500">เลือกได้หลายหมวด หมวดแรกใช้เป็นประเภทหลักสำหรับข้อมูลเดิม</p>
        </div>
        <span className="border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-600">
          เลือกแล้ว {activeSelectedCategories.length} หมวด
        </span>
      </div>

      {selectedCategories.length > 0 ? (
        <div className="flex flex-wrap gap-2" aria-label="หมวดหมู่ที่เลือก">
          {selectedCategories.map((category) => (
            <span
              key={category.categoryId}
              className={`inline-flex min-h-9 items-center gap-2 border px-3 text-xs font-bold ${category.isActive
                ? "border-teal-200 bg-teal-50 text-teal-800"
                : "border-amber-200 bg-amber-50 text-amber-800"
              }`}
            >
              {category.nameTh}
              {!category.isActive ? <span>ปิดใช้งานแล้ว</span> : null}
              <button
                type="button"
                onClick={() => toggle(category.categoryId)}
                aria-label={`นำ${category.nameTh}ออก`}
                className="grid h-7 w-7 place-items-center hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
              >
                <X size={14} weight="bold" aria-hidden="true" />
              </button>
            </span>
          ))}
        </div>
      ) : null}

      <label className="relative block">
        <span className="sr-only">ค้นหาหมวดหมู่ร้านอาหาร</span>
        <MagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="ค้นหาชื่อหมวดหมู่"
          aria-label="ค้นหาหมวดหมู่ร้านอาหาร"
          className="min-h-11 w-full border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none focus:border-teal-700 focus:ring-4 focus:ring-teal-50"
        />
      </label>

      <div className="max-h-64 overflow-y-auto border border-slate-200 bg-white" role="group" aria-label="รายการหมวดหมู่ร้านอาหาร">
        {filteredCategories.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-slate-500">ไม่พบหมวดหมู่ที่ค้นหา</p>
        ) : filteredCategories.map((category) => {
          const checked = selectedIds.includes(category.categoryId);
          return (
            <label
              key={category.categoryId}
              className={`flex min-h-12 items-center gap-3 border-b border-slate-100 px-4 last:border-b-0 ${category.isActive
                ? "cursor-pointer hover:bg-slate-50"
                : "cursor-not-allowed bg-slate-50 text-slate-400"
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                disabled={!category.isActive}
                onChange={() => toggle(category.categoryId)}
                aria-label={`${category.nameTh}${category.nameEn ? ` ${category.nameEn}` : ""}`}
                className="peer sr-only"
              />
              <span className={`grid h-6 w-6 shrink-0 place-items-center border ${checked
                ? "border-teal-700 bg-teal-700 text-white"
                : "border-slate-300 bg-white text-transparent"
              }`} aria-hidden="true">
                <Check size={15} weight="bold" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-slate-800">{category.nameTh}</span>
                <span className="block truncate text-xs text-slate-500">{category.nameEn ?? category.slug}</span>
              </span>
              {!category.isActive ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700">
                  <WarningCircle size={15} aria-hidden="true" /> ปิดใช้งาน
                </span>
              ) : null}
            </label>
          );
        })}
      </div>
      {error ? <p role="alert" className="text-sm font-semibold text-red-600">{error}</p> : null}
    </div>
  );
}
