"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { CaretDown, FunnelSimple, X } from "@phosphor-icons/react/dist/ssr";
import { getPreviousDashboardPeriod } from "@/lib/services/dashboard-comparison";
import type { DashboardFilters, DashboardReferenceOption, DashboardReferenceOptions } from "@/types/dashboard";

const EVIDENCE_SCOPE_OPTIONS: DashboardReferenceOption[] = [
  { value: "field_claim", label: "หลักฐานภาคสนาม (ค่าเริ่มต้น)" },
  { value: "all_records", label: "ทุกชุดข้อมูล" },
  { value: "pilot_only", label: "Pilot เท่านั้น" },
  { value: "simulated_only", label: "สถานการณ์จำลองเท่านั้น" },
];

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
        className="mt-1 min-h-10 w-full rounded-[5px] border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition-colors focus:border-[#B94727] focus:ring-2 focus:ring-[#B94727]/15"
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

function ScoreSelect({ label, name, value }: { label: string; name: string; value?: number }) {
  return (
    <label className="block min-w-0">
      <span className="text-xs font-semibold text-slate-600">{label}</span>
      <select
        className="mt-1 min-h-10 w-full rounded-[5px] border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition-colors focus:border-[#B94727] focus:ring-2 focus:ring-[#B94727]/15"
        defaultValue={value === undefined ? "" : String(value)}
        name={name}
      >
        <option value="">ไม่กำหนด</option>
        {[1, 2, 3, 4, 5].map((score) => <option key={score} value={score}>{score} / 5</option>)}
      </select>
    </label>
  );
}

function optionLabel(options: DashboardReferenceOption[], value: number | string | undefined): string | null {
  if (value === undefined) return null;
  return options.find((option) => option.value === String(value))?.label ?? String(value);
}

function formatThaiDate(value: string) {
  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00.000Z`));
}

export function DashboardFilters({ filters, options }: DashboardFiltersProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const supportsComparison = pathname === "/admin/dashboard";
  const previousPeriod = getPreviousDashboardPeriod(filters.dateFrom, filters.dateTo);
  const satisfactionLabel = filters.satisfactionMin !== undefined || filters.satisfactionMax !== undefined
    ? `${filters.satisfactionMin ?? 1}-${filters.satisfactionMax ?? 5}`
    : null;
  const activeFilters = [
    ["province_id", "จังหวัด", optionLabel(options.provinces, filters.provinceId)],
    ["district_id", "อำเภอ", optionLabel(options.districts, filters.districtId)],
    ["attraction_id", "สถานที่", optionLabel(options.attractions, filters.attractionId)],
    ["attraction_type_id", "ประเภท", optionLabel(options.attractionTypes, filters.attractionTypeId)],
    ["origin_country_id", "ประเทศต้นทาง", optionLabel(options.originCountries, filters.originCountryId)],
    ["origin_province_id", "จังหวัดต้นทาง", optionLabel(options.originProvinces, filters.originProvinceId)],
    ["age_group", "ช่วงอายุ", optionLabel(options.ageGroups, filters.ageGroup)],
    ["transport_mode_id", "พาหนะ", optionLabel(options.transportModes, filters.transportModeId)],
    ["travel_purpose_id", "วัตถุประสงค์", optionLabel(options.travelPurposes, filters.travelPurposeId)],
    ["satisfaction_score", "คะแนน", satisfactionLabel],
    ["evidence_scope", "ขอบเขตหลักฐาน", filters.evidenceScope && filters.evidenceScope !== "field_claim" ? optionLabel(EVIDENCE_SCOPE_OPTIONS, filters.evidenceScope) : null],
  ].filter((item): item is [string, string, string] => Boolean(item[2]));
  const advancedFilterCount = activeFilters.filter(([key]) => !["province_id", "attraction_id"].includes(key)).length;

  useEffect(() => {
    if (!isAdvancedOpen) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setIsAdvancedOpen(false);
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isAdvancedOpen]);

  function removeHref(key: string): string {
    const params = new URLSearchParams(searchParams.toString());
    if (key === "satisfaction_score") {
      params.delete("satisfaction_min");
      params.delete("satisfaction_max");
      params.delete("satisfactionMin");
      params.delete("satisfactionMax");
    } else {
      params.delete(key);
      const camelKey = key.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase());
      params.delete(camelKey);
    }
    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  }

  return (
    <section aria-labelledby="dashboard-filters-heading" className="overflow-visible rounded-md border border-slate-200 bg-white lg:sticky lg:top-20 lg:z-20">
      <div className="flex flex-wrap items-center gap-3 px-3 py-2.5 lg:flex-nowrap">
        <div className="flex min-w-0 shrink-0 items-center gap-3 lg:hidden">
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
          className="ml-auto inline-flex min-h-10 items-center gap-2 rounded-[5px] border border-slate-300 px-3 text-xs font-bold text-slate-700 transition-colors hover:border-[#E8B8A8] hover:text-[#B94727] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B94727] focus-visible:ring-offset-2 lg:hidden"
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
                <input className="mt-1 min-h-10 w-full rounded-[5px] border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition-colors focus:border-[#B94727] focus:ring-2 focus:ring-[#B94727]/15" defaultValue={filters.dateFrom} name="date_from" type="date" />
              </label>
              <label className="block min-w-0">
                <span className="text-xs font-semibold text-slate-600">ถึงวันที่</span>
                <input className="mt-1 min-h-10 w-full rounded-[5px] border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition-colors focus:border-[#B94727] focus:ring-2 focus:ring-[#B94727]/15" defaultValue={filters.dateTo} name="date_to" type="date" />
              </label>
              <FilterSelect label="จังหวัดปลายทาง" name="province_id" options={options.provinces} value={filters.provinceId} />
              <FilterSelect label="สถานที่ท่องเที่ยว" name="attraction_id" options={options.attractions} value={filters.attractionId} />
            </div>

            <button className="min-h-10 shrink-0 rounded-[5px] bg-[#171717] px-4 text-sm font-bold text-white transition-colors hover:bg-[#B94727] focus:outline-none focus:ring-2 focus:ring-[#B94727] focus:ring-offset-2" type="submit">อัปเดตข้อมูล</button>

            {supportsComparison ? (
              <label className="flex min-h-10 shrink-0 cursor-pointer items-center gap-2 rounded-[5px] border border-slate-300 px-3 text-xs font-bold text-slate-700 transition-colors hover:border-[#E8B8A8]">
                <input
                  className="h-4 w-4 accent-[#B94727]"
                  defaultChecked={filters.comparisonMode === "previous_period"}
                  name="compare"
                  type="checkbox"
                  value="previous_period"
                />
                <span>เทียบช่วงก่อนหน้า</span>
              </label>
            ) : filters.comparisonMode ? <input name="compare" type="hidden" value={filters.comparisonMode} /> : null}

            <div className="relative shrink-0">
              <button
                aria-controls="dashboard-advanced-filters"
                aria-expanded={isAdvancedOpen}
                className="inline-flex min-h-10 items-center gap-2 rounded-[5px] border border-slate-300 px-3 text-xs font-bold text-slate-700 transition-colors hover:border-slate-500 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B94727] focus-visible:ring-offset-2"
                onClick={() => setIsAdvancedOpen((current) => !current)}
                type="button"
              >
                ตัวกรองขั้นสูง{advancedFilterCount > 0 ? ` (${advancedFilterCount})` : ""}
                <CaretDown aria-hidden="true" className={`transition-transform ${isAdvancedOpen ? "rotate-180" : ""}`} size={14} weight="bold" />
              </button>
              {isAdvancedOpen ? (
                <>
                  <button aria-label="ปิดตัวกรองขั้นสูง" className="fixed inset-0 z-40 bg-slate-950/35 lg:hidden" onClick={() => setIsAdvancedOpen(false)} type="button" />
                  <div
                    aria-label="ตัวกรองขั้นสูง"
                    className="fixed inset-x-3 bottom-3 z-50 max-h-[min(80dvh,42rem)] overflow-y-auto rounded-md border border-slate-200 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.18)] sm:grid-cols-2 lg:absolute lg:inset-x-auto lg:bottom-auto lg:right-0 lg:top-full lg:z-30 lg:mt-2 lg:grid lg:w-[min(54rem,calc(100vw-18rem))] lg:gap-3 lg:shadow-[0_4px_8px_rgba(23,23,23,0.10)]"
                    id="dashboard-advanced-filters"
                    role="region"
                  >
                    <div className="mb-4 flex items-start justify-between gap-3 border-b border-slate-200 pb-3 sm:col-span-2 lg:mb-0">
                      <div><p className="text-sm font-black text-slate-900">ตัวกรองขั้นสูง</p><p className="mt-1 text-xs leading-5 text-slate-500">ใช้เพื่อเปรียบเทียบกลุ่มข้อมูลเฉพาะ ค่าที่ไม่ตอบจะไม่ถูกแทนด้วยศูนย์</p></div>
                      <button aria-label="ปิดแผงตัวกรองขั้นสูง" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[4px] text-slate-500 hover:bg-slate-100" onClick={() => setIsAdvancedOpen(false)} type="button"><X aria-hidden="true" size={18} weight="bold" /></button>
                    </div>
                    <div className="grid gap-3 sm:col-span-2 sm:grid-cols-2 lg:grid-cols-4">
                      <FilterSelect label="อำเภอปลายทาง" name="district_id" options={options.districts} value={filters.districtId} />
                <FilterSelect label="ประเภทสถานที่" name="attraction_type_id" options={options.attractionTypes} value={filters.attractionTypeId} />
                <FilterSelect label="ประเทศต้นทาง" name="origin_country_id" options={options.originCountries} value={filters.originCountryId} />
                <FilterSelect label="จังหวัดต้นทาง" name="origin_province_id" options={options.originProvinces} value={filters.originProvinceId} />
                <FilterSelect label="ช่วงอายุ" name="age_group" options={options.ageGroups} value={filters.ageGroup} />
                <FilterSelect label="พาหนะ" name="transport_mode_id" options={options.transportModes} value={filters.transportModeId} />
                <FilterSelect label="วัตถุประสงค์การเดินทาง" name="travel_purpose_id" options={options.travelPurposes} value={filters.travelPurposeId} />
                      <FilterSelect label="ขอบเขตหลักฐาน" name="evidence_scope" options={EVIDENCE_SCOPE_OPTIONS} value={filters.evidenceScope ?? "field_claim"} />
                      <ScoreSelect label="คะแนนขั้นต่ำ" name="satisfaction_min" value={filters.satisfactionMin} />
                      <ScoreSelect label="คะแนนสูงสุด" name="satisfaction_max" value={filters.satisfactionMax} />
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </form>
        </div>
      </div>

      {supportsComparison && filters.comparisonMode === "previous_period" && previousPeriod ? (
        <div className="border-t border-[#F0C8BB] bg-[#FFF7F3] px-3 py-2 text-xs leading-5 text-[#71301F] sm:px-4">
          เปรียบเทียบกับช่วงก่อนหน้าที่มีจำนวนวันเท่ากัน: {formatThaiDate(previousPeriod.dateFrom)} - {formatThaiDate(previousPeriod.dateTo)}
        </div>
      ) : null}

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
