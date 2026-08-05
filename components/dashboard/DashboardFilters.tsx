"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { CaretDown, FunnelSimple, X } from "@phosphor-icons/react/dist/ssr";
import type { DashboardFilters, DashboardReferenceOption, DashboardReferenceOptions } from "@/types/dashboard";

type DashboardFiltersProps = {
  filters: DashboardFilters;
  options: DashboardReferenceOptions;
};

function FilterSelect({
  name,
  label,
  value,
  options,
}: {
  name: string;
  label: string;
  value?: number | string;
  options: DashboardReferenceOption[];
}) {
  const currentAgeOptions = name === "age_group"
    ? options.filter((option) => !option.label.endsWith("(ข้อมูลเดิม)"))
    : [];
  const legacyAgeOptions = name === "age_group"
    ? options.filter((option) => option.label.endsWith("(ข้อมูลเดิม)"))
    : [];

  return (
    <label className="block min-w-0">
      <span className="text-xs font-semibold text-slate-600">{label}</span>
      <select
        className="mt-1.5 min-h-11 w-full rounded-[5px] border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition-colors focus:border-[#B94727] focus:ring-2 focus:ring-[#B94727]/15"
        defaultValue={value === undefined ? "" : String(value)}
        name={name}
      >
        <option value="">ทั้งหมด</option>
        {name === "age_group" ? (
          <>
            <optgroup label="ช่วงอายุมาตรฐานปัจจุบัน">
              {currentAgeOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </optgroup>
            {legacyAgeOptions.length > 0 ? (
              <optgroup label="ช่วงอายุจากข้อมูลเดิม">
                {legacyAgeOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </optgroup>
            ) : null}
          </>
        ) : options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  );
}

function optionLabel(options: DashboardReferenceOption[], value: number | string | undefined): string | null {
  if (value === undefined) return null;
  return options.find((option) => option.value === String(value))?.label ?? String(value);
}

export function DashboardFilters({ filters, options }: DashboardFiltersProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const activeFilters = [
    ["province_id", "จังหวัด", optionLabel(options.provinces, filters.provinceId)],
    ["attraction_id", "สถานที่", optionLabel(options.attractions, filters.attractionId)],
    ["attraction_type_id", "ประเภท", optionLabel(options.attractionTypes, filters.attractionTypeId)],
    ["origin_country_id", "ประเทศต้นทาง", optionLabel(options.originCountries, filters.originCountryId)],
    ["origin_province_id", "จังหวัดต้นทาง", optionLabel(options.originProvinces, filters.originProvinceId)],
    ["age_group", "ช่วงอายุ", optionLabel(options.ageGroups, filters.ageGroup)],
    ["transport_mode_id", "พาหนะ", optionLabel(options.transportModes, filters.transportModeId)],
    ["travel_purpose_id", "วัตถุประสงค์", optionLabel(options.travelPurposes, filters.travelPurposeId)],
  ].filter((item): item is [string, string, string] => Boolean(item[2]));

  function removeHref(key: string): string {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  }

  return (
    <section aria-labelledby="dashboard-filters-heading" className="border-y border-slate-200 bg-white">
      <div className="flex flex-wrap items-center gap-3 px-3 py-2.5 sm:px-4 lg:flex-nowrap lg:gap-4">
        <div className="flex min-w-0 shrink-0 items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[5px] bg-[#FFF0EA] text-[#B94727]">
            <FunnelSimple aria-hidden="true" size={17} weight="bold" />
          </span>
          <div className="min-w-0">
            <h2 id="dashboard-filters-heading" className="text-sm font-bold text-slate-900">ตัวกรองข้อมูล</h2>
            <p className="truncate text-xs text-slate-500">
              {filters.dateFrom} ถึง {filters.dateTo}{activeFilters.length > 0 ? ` · ใช้อยู่ ${activeFilters.length} ตัวกรอง` : ""}
            </p>
          </div>
        </div>

        <button
          aria-controls="dashboard-filter-form"
          aria-expanded={isOpen}
          className="ml-auto inline-flex min-h-11 items-center gap-2 rounded-[5px] border border-slate-300 px-3 text-xs font-bold text-slate-700 transition-colors hover:border-[#E8B8A8] hover:text-[#B94727] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B94727] focus-visible:ring-offset-2 lg:hidden"
          onClick={() => setIsOpen((current) => !current)}
          type="button"
        >
          ปรับตัวกรอง
          <CaretDown aria-hidden="true" className={`transition-transform ${isOpen ? "rotate-180" : ""}`} size={14} weight="bold" />
        </button>

        <div className={`${isOpen ? "block" : "hidden"} w-full min-w-0 lg:block lg:flex-1`} id="dashboard-filter-form">
          <form action={pathname} className="space-y-3 lg:flex lg:items-end lg:gap-2 lg:space-y-0">
            <div className="grid gap-3 sm:grid-cols-2 lg:min-w-0 lg:flex-1 lg:grid-cols-4">
              <label className="block min-w-0">
                <span className="text-xs font-semibold text-slate-600">ตั้งแต่วันที่</span>
                <input className="mt-1.5 min-h-11 w-full rounded-[5px] border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition-colors focus:border-[#B94727] focus:ring-2 focus:ring-[#B94727]/15" defaultValue={filters.dateFrom} name="date_from" type="date" />
              </label>
              <label className="block min-w-0">
                <span className="text-xs font-semibold text-slate-600">ถึงวันที่</span>
                <input className="mt-1.5 min-h-11 w-full rounded-[5px] border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition-colors focus:border-[#B94727] focus:ring-2 focus:ring-[#B94727]/15" defaultValue={filters.dateTo} name="date_to" type="date" />
              </label>
              <FilterSelect label="จังหวัดปลายทาง" name="province_id" options={options.provinces} value={filters.provinceId} />
              <FilterSelect label="สถานที่ท่องเที่ยว" name="attraction_id" options={options.attractions} value={filters.attractionId} />
            </div>

            <button className="min-h-11 shrink-0 rounded-[5px] bg-[#171717] px-5 text-sm font-bold text-white transition-colors hover:bg-[#B94727] focus:outline-none focus:ring-2 focus:ring-[#B94727] focus:ring-offset-2" type="submit">นำตัวกรองไปใช้</button>

            <details className="group relative shrink-0">
              <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-[5px] border border-slate-300 px-3 text-xs font-bold text-slate-700 transition-colors hover:border-slate-500 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B94727] focus-visible:ring-offset-2">
                เพิ่มเติม
                <CaretDown aria-hidden="true" className="transition-transform group-open:rotate-180" size={14} weight="bold" />
              </summary>
              <div className="mt-2 grid gap-3 border-t border-slate-200 bg-white pt-3 sm:grid-cols-2 lg:absolute lg:right-0 lg:top-full lg:z-20 lg:mt-1 lg:w-[min(52rem,calc(100vw-2rem))] lg:border lg:border-slate-200 lg:p-3 lg:shadow-[0_4px_8px_rgba(23,23,23,0.08)]">
                <FilterSelect label="ประเภทสถานที่" name="attraction_type_id" options={options.attractionTypes} value={filters.attractionTypeId} />
                <FilterSelect label="ประเทศต้นทาง" name="origin_country_id" options={options.originCountries} value={filters.originCountryId} />
                <FilterSelect label="จังหวัดต้นทาง" name="origin_province_id" options={options.originProvinces} value={filters.originProvinceId} />
                <FilterSelect label="ช่วงอายุ" name="age_group" options={options.ageGroups} value={filters.ageGroup} />
                <FilterSelect label="พาหนะ" name="transport_mode_id" options={options.transportModes} value={filters.transportModeId} />
                <FilterSelect label="วัตถุประสงค์การเดินทาง" name="travel_purpose_id" options={options.travelPurposes} value={filters.travelPurposeId} />
              </div>
            </details>
          </form>
        </div>
      </div>

      {activeFilters.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 px-3 py-2 sm:px-4" aria-label="ตัวกรองที่ใช้อยู่">
          <span className="mr-1 text-xs font-semibold text-slate-500">กำลังใช้</span>
          {activeFilters.map(([key, label, value]) => (
            <Link key={key} href={removeHref(key)} className="inline-flex min-h-8 items-center gap-1.5 rounded-[5px] border border-[#E8B8A8] bg-[#FFF7F3] px-3 text-xs font-semibold text-[#8F351F] hover:border-[#B94727] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B94727]" aria-label={`ลบตัวกรอง ${label} ${value}`}>
              {label}: {value}
              <X aria-hidden="true" size={12} weight="bold" />
            </Link>
          ))}
          <Link className="ml-auto min-h-8 px-2 text-xs font-semibold text-[#B94727] underline-offset-4 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B94727]" href={pathname}>ล้างทั้งหมด</Link>
        </div>
      ) : null}
    </section>
  );
}
