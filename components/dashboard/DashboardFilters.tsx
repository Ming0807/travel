"use client";

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
        className="mt-1.5 min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition-colors focus:border-[#B94727] focus:ring-2 focus:ring-[#B94727]/15"
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
    <section aria-labelledby="dashboard-filters-heading" className="rounded-md border border-slate-200 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[#FFF0EA] text-[#B94727]"><FunnelSimple aria-hidden="true" size={17} weight="bold" /></span>
          <h2 id="dashboard-filters-heading" className="text-sm font-bold text-slate-800">ตัวกรองข้อมูล</h2>
        </div>
        {activeFilters.length > 0 ? (
          <Link className="text-xs font-semibold text-[#B94727] underline-offset-4 hover:underline" href={pathname}>ล้างตัวกรองทั้งหมด</Link>
        ) : null}
      </div>

      <form action={pathname} className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <label className="block">
            <span className="text-xs font-semibold text-slate-600">ตั้งแต่วันที่</span>
            <input className="mt-1.5 min-h-11 w-full rounded-md border border-slate-300 px-3 text-sm text-slate-800 outline-none focus:border-[#B94727] focus:ring-2 focus:ring-[#B94727]/15" defaultValue={filters.dateFrom} name="date_from" type="date" />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-slate-600">ถึงวันที่</span>
            <input className="mt-1.5 min-h-11 w-full rounded-md border border-slate-300 px-3 text-sm text-slate-800 outline-none focus:border-[#B94727] focus:ring-2 focus:ring-[#B94727]/15" defaultValue={filters.dateTo} name="date_to" type="date" />
          </label>
          <FilterSelect label="จังหวัดปลายทาง" name="province_id" options={options.provinces} value={filters.provinceId} />
          <FilterSelect label="สถานที่ท่องเที่ยว" name="attraction_id" options={options.attractions} value={filters.attractionId} />
          <button className="min-h-11 self-end rounded-md bg-[#171717] px-5 text-sm font-bold text-white transition-colors hover:bg-[#B94727] focus:outline-none focus:ring-2 focus:ring-[#B94727] focus:ring-offset-2" type="submit">นำตัวกรองไปใช้</button>
        </div>

        <details className="group">
          <summary className="inline-flex min-h-10 cursor-pointer list-none items-center gap-2 text-sm font-semibold text-slate-600 hover:text-[#171717] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B94727]">
            ตัวกรองเพิ่มเติม
            <CaretDown aria-hidden="true" className="transition-transform group-open:rotate-180" size={16} weight="bold" />
          </summary>
          <div className="mt-2 grid gap-3 border-l-2 border-slate-200 pl-4 sm:grid-cols-2 xl:grid-cols-4">
            <FilterSelect label="ประเภทสถานที่" name="attraction_type_id" options={options.attractionTypes} value={filters.attractionTypeId} />
            <FilterSelect label="ประเทศต้นทาง" name="origin_country_id" options={options.originCountries} value={filters.originCountryId} />
            <FilterSelect label="จังหวัดต้นทาง" name="origin_province_id" options={options.originProvinces} value={filters.originProvinceId} />
            <FilterSelect label="ช่วงอายุ" name="age_group" options={options.ageGroups} value={filters.ageGroup} />
            <FilterSelect label="พาหนะ" name="transport_mode_id" options={options.transportModes} value={filters.transportModeId} />
            <FilterSelect label="วัตถุประสงค์การเดินทาง" name="travel_purpose_id" options={options.travelPurposes} value={filters.travelPurposeId} />
          </div>
        </details>
      </form>

      {activeFilters.length > 0 ? (
        <div aria-label="ตัวกรองที่ใช้อยู่" className="mt-3 flex flex-wrap gap-2">
          {activeFilters.map(([key, label, value]) => (
            <Link key={key} href={removeHref(key)} className="inline-flex min-h-8 items-center gap-1.5 rounded-md border border-[#E8B8A8] bg-[#FFF7F3] px-3 text-xs font-semibold text-[#8F351F] hover:border-[#B94727]" aria-label={`ลบตัวกรอง ${label} ${value}`}>
              {label}: {value}
              <X aria-hidden="true" size={12} weight="bold" />
            </Link>
          ))}
        </div>
      ) : null}
    </section>
  );
}
