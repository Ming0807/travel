import type { DashboardViewModel } from "@/types/dashboard";
import { BarChartCard } from "@/components/dashboard/BarChartCard";
import { DonutChartCard } from "@/components/dashboard/DonutChartCard";
import { TouristDetailTable } from "@/components/dashboard/TouristDetailTable";
import { ExportCsvButton } from "@/components/dashboard/ExportCsvButton";

function getUniqueProfileCount(data: DashboardViewModel): number {
  return data.touristProfile.originCountries.reduce((sum, item) => sum + item.value, 0);
}

export function TouristProfileSection({ data }: { data: DashboardViewModel }) {
  const profileCount = getUniqueProfileCount(data);
  const hasIdentityData = data.touristProfile.identityProviders.length > 0 &&
    data.touristProfile.identityProviders.some((item) => item.value > 0);

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#073F37]">Tourist profile summary</h2>
          <p className="mt-1 text-sm text-slate-500">
            Aggregated profile signals only. These are profiles, not verified
            unique people. Identity provider data shows how tourists authenticate.
          </p>
        </div>
        <ExportCsvButton />
      </div>

      {/* Summary KPI row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Total profiles
          </p>
          <p className="mt-1 text-2xl font-black text-[#073F37] tabular-nums">
            {profileCount.toLocaleString("th-TH")}
          </p>
        </div>
        <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Countries represented
          </p>
          <p className="mt-1 text-2xl font-black text-[#073F37] tabular-nums">
            {data.touristProfile.originCountries.length}
          </p>
        </div>
        <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Thai provinces
          </p>
          <p className="mt-1 text-2xl font-black text-[#073F37] tabular-nums">
            {data.touristProfile.originProvinces.length}
          </p>
        </div>
        <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Age groups
          </p>
          <p className="mt-1 text-2xl font-black text-[#073F37] tabular-nums">
            {data.touristProfile.ageGroups.length}
          </p>
        </div>
      </div>

      {/* Charts grid */}
      <div className="grid gap-5 xl:grid-cols-2">
        <BarChartCard
          data={data.touristProfile.originCountries}
          definition="Counts distinct tourist profiles with visits, grouped by self-reported origin country."
          emptyDescription="No origin country data in selected filters."
          title="Origin country"
          sampleCount={profileCount}
          sampleLabel="profiles"
        />
        <BarChartCard
          data={data.touristProfile.originProvinces}
          definition="Counts distinct tourist profiles with visits, grouped by Thai origin province when provided."
          emptyDescription="No Thai origin province data in selected filters."
          title="Thai origin province"
          sampleCount={profileCount}
          sampleLabel="profiles"
        />
        <DonutChartCard
          data={data.touristProfile.ageGroups}
          definition="Self-reported age group distribution. Exact birthdate is not collected."
          emptyDescription="No age group data in selected filters."
          title="Age group"
          sampleCount={profileCount}
          sampleLabel="profiles"
        />
        <DonutChartCard
          data={data.touristProfile.preferredLanguages}
          definition="Preferred language distribution where available."
          emptyDescription="No language data in selected filters."
          title="Preferred language"
          sampleCount={profileCount}
          sampleLabel="profiles"
        />
      </div>

      {/* Identity providers (full width) */}
      {hasIdentityData && (
        <div className="max-w-md">
          <DonutChartCard
            data={data.touristProfile.identityProviders}
            definition="How tourists authenticated: anonymous device, LINE, email, or Google."
            emptyDescription="No identity provider data."
            title="Identity provider"
            sampleCount={profileCount}
            sampleLabel="profiles"
          />
        </div>
      )}

      {/* Detail table */}
      <TouristDetailTable
        originCountries={data.touristProfile.originCountries}
        originProvinces={data.touristProfile.originProvinces}
        ageGroups={data.touristProfile.ageGroups}
        preferredLanguages={data.touristProfile.preferredLanguages}
        identityProviders={data.touristProfile.identityProviders}
      />
    </section>
  );
}
