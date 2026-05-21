import type { DashboardFilters, DashboardReferenceOptions } from "@/types/dashboard";

type DashboardFiltersProps = {
  filters: DashboardFilters;
  options: DashboardReferenceOptions;
};

function FilterSelect({
  name,
  label,
  value,
  options
}: {
  name: string;
  label: string;
  value?: number | string;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase tracking-wide text-slate-500">{label}</span>
      <select
        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-700 outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15"
        defaultValue={value ? String(value) : ""}
        name={name}
      >
        <option value="">All</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function DashboardFilters({ filters, options }: DashboardFiltersProps) {
  return (
    <form action="/admin/dashboard" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <label className="block">
          <span className="text-xs font-black uppercase tracking-wide text-slate-500">Date from</span>
          <input
            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-bold text-slate-700 outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15"
            defaultValue={filters.dateFrom}
            name="date_from"
            type="date"
          />
        </label>
        <label className="block">
          <span className="text-xs font-black uppercase tracking-wide text-slate-500">Date to</span>
          <input
            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-bold text-slate-700 outline-none focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/15"
            defaultValue={filters.dateTo}
            name="date_to"
            type="date"
          />
        </label>
        <FilterSelect label="Province" name="province_id" options={options.provinces} value={filters.provinceId} />
        <FilterSelect label="Attraction" name="attraction_id" options={options.attractions} value={filters.attractionId} />
        <FilterSelect label="Attraction type" name="attraction_type_id" options={options.attractionTypes} value={filters.attractionTypeId} />
        <FilterSelect label="Origin country" name="origin_country_id" options={options.originCountries} value={filters.originCountryId} />
        <FilterSelect label="Age group" name="age_group" options={options.ageGroups} value={filters.ageGroup} />
        <FilterSelect label="Transport" name="transport_mode_id" options={options.transportModes} value={filters.transportModeId} />
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs leading-5 text-slate-500">
          Filters are validated on the server. Date range is limited for live MVP queries.
        </p>
        <button className="rounded-full bg-[#073F37] px-5 py-2.5 text-sm font-black text-white hover:bg-[#0A6B62]" type="submit">
          Apply filters
        </button>
      </div>
    </form>
  );
}
