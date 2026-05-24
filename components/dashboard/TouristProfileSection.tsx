import type { DashboardViewModel } from "@/types/dashboard";
import { BarChartCard } from "@/components/dashboard/BarChartCard";
import { DonutChartCard } from "@/components/dashboard/DonutChartCard";
import { ExportCsvButton } from "@/components/dashboard/ExportCsvButton";

export function TouristProfileSection({ data }: { data: DashboardViewModel }) {
  return (
    <section className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#073F37]">Tourist profile summary</h2>
          <p className="mt-1 text-sm text-slate-500">Aggregated profile signals only. These are profiles, not verified unique people.</p>
        </div>
        <ExportCsvButton />
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <BarChartCard
          data={data.touristProfile.originCountries}
          definition="Counts distinct tourist profiles with visits, grouped by self-reported origin country."
          emptyDescription="No origin country data in selected filters."
          title="Origin country"
        />
        <BarChartCard
          data={data.touristProfile.originProvinces}
          definition="Counts distinct tourist profiles with visits, grouped by Thai origin province when provided."
          emptyDescription="No Thai origin province data in selected filters."
          title="Thai origin province"
        />
        <DonutChartCard
          data={data.touristProfile.ageGroups}
          definition="Self-reported age group distribution. Exact birthdate is not collected."
          emptyDescription="No age group data in selected filters."
          title="Age group"
        />
        <DonutChartCard
          data={data.touristProfile.preferredLanguages}
          definition="Preferred language distribution where available."
          emptyDescription="No language data in selected filters."
          title="Preferred language"
        />
      </div>
    </section>
  );
}
