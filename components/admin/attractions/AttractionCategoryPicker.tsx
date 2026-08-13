"use client";

import { useState } from "react";
import { Check, Star, WarningCircle } from "@phosphor-icons/react";

export type AttractionCategoryOption = {
  id: number;
  label: string;
  labelEn?: string | null;
  isActive?: boolean;
};

type AttractionCategoryPickerProps = {
  categories: AttractionCategoryOption[];
  selectedCategoryIds?: number[];
  primaryCategoryId?: number | null;
  error?: string;
};

export function AttractionCategoryPicker({
  categories,
  selectedCategoryIds = [],
  primaryCategoryId = null,
  error,
}: AttractionCategoryPickerProps) {
  const initialIds = Array.from(new Set(selectedCategoryIds));
  const activeCategoryIds = new Set(categories.filter((category) => category.isActive !== false).map((category) => category.id));
  const [selectedIds, setSelectedIds] = useState(initialIds);
  const initialActiveIds = initialIds.filter((id) => activeCategoryIds.has(id));
  const [primaryId, setPrimaryId] = useState<number | null>(
    primaryCategoryId !== null && initialActiveIds.includes(primaryCategoryId)
      ? primaryCategoryId
      : initialActiveIds[0] ?? null,
  );

  const activeSelectedIds = selectedIds.filter((id) => activeCategoryIds.has(id));
  const atLimit = activeSelectedIds.length >= 4;

  function toggle(category: AttractionCategoryOption) {
    if (category.isActive === false) return;
    setSelectedIds((current) => {
      if (current.includes(category.id)) {
        const next = current.filter((id) => id !== category.id);
        if (primaryId === category.id) {
          setPrimaryId(next.find((id) => activeCategoryIds.has(id)) ?? null);
        }
        return next;
      }
      if (current.filter((id) => activeCategoryIds.has(id)).length >= 4) return current;
      if (primaryId === null) setPrimaryId(category.id);
      return [...current, category.id];
    });
  }

  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-bold text-slate-800">หมวดหมู่สถานที่</legend>
      <p className="text-xs leading-5 text-slate-600">
        หมวดหลักใช้บนการ์ดและ Dashboard ส่วนหมวดรองช่วยให้ค้นหาสถานที่พบจากหลายบริบท
      </p>

      {activeSelectedIds.map((id) => (
        <input key={id} type="hidden" name="attractionTypeIds" value={id} />
      ))}
      <input type="hidden" name="primaryAttractionTypeId" value={primaryId ?? ""} />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-semibold text-slate-500">เลือกแล้ว {activeSelectedIds.length}/4 หมวด</span>
        {atLimit ? <span className="text-xs font-bold text-amber-700">เลือกได้สูงสุด 4 หมวด</span> : null}
      </div>

      <div className="divide-y divide-slate-200 border border-slate-200 bg-white" role="group" aria-label="รายการหมวดหมู่สถานที่">
        {categories.map((category) => {
          const checkboxId = `attraction-category-${category.id}`;
          const checked = selectedIds.includes(category.id);
          const isActive = category.isActive !== false;
          const disabled = !isActive || (atLimit && !checked);
          return (
            <div
              key={category.id}
              className={`flex min-h-12 items-center gap-3 px-3 py-2 ${disabled && !checked ? "cursor-not-allowed bg-slate-50 text-slate-400" : "cursor-pointer hover:bg-slate-50"}`}
            >
              <label htmlFor={checkboxId} className={`flex min-h-12 min-w-0 flex-1 items-center gap-3 ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}>
                <input
                  id={checkboxId}
                  type="checkbox"
                  checked={checked}
                  disabled={disabled}
                  onChange={() => toggle(category)}
                  aria-label={category.label}
                  className="peer sr-only"
                />
                <span className={`grid h-6 w-6 shrink-0 place-items-center border ${checked && isActive ? "border-[var(--admin-accent)] bg-[var(--admin-accent)] text-white" : "border-slate-300 bg-white text-transparent"}`} aria-hidden="true">
                  <Check size={15} weight="bold" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-slate-800">{category.label}</span>
                  {category.labelEn ? <span className="block text-xs text-slate-500">{category.labelEn}</span> : null}
                </span>
              </label>
              {!isActive ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700">
                  <WarningCircle size={15} aria-hidden="true" /> ปิดใช้งานแล้ว
                </span>
              ) : checked ? (
                <span className="inline-flex min-h-10 items-center gap-2">
                  <input
                    type="radio"
                    name="primary-category-control"
                    checked={primaryId === category.id}
                    onChange={() => setPrimaryId(category.id)}
                    aria-label={`ตั้ง ${category.label} เป็นหมวดหลัก`}
                    className="h-5 w-5 accent-[var(--admin-accent)]"
                  />
                  <span className={`hidden items-center gap-1 text-xs font-bold sm:inline-flex ${primaryId === category.id ? "text-[var(--admin-accent-strong)]" : "text-slate-500"}`}>
                    <Star size={14} weight={primaryId === category.id ? "fill" : "regular"} aria-hidden="true" />
                    {primaryId === category.id ? "หมวดหลัก" : "ตั้งเป็นหลัก"}
                  </span>
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
      {error ? <p role="alert" className="text-sm font-semibold text-red-600">{error}</p> : null}
    </fieldset>
  );
}
