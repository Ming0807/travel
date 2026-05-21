import type { DashboardViewModel } from "@/types/dashboard";
import { BarChartCard } from "@/components/dashboard/BarChartCard";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { NoDataState } from "@/components/dashboard/NoDataState";
import { TrendChart } from "@/components/dashboard/TrendChart";

export function ExecutiveOverview({ data }: { data: DashboardViewModel }) {
  return (
    <section className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {data.kpis.map((metric) => (
          <KpiCard key={metric.key} metric={metric} />
        ))}
      </div>
      {data.dataQualityWarnings.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2">
          {data.dataQualityWarnings.map((warning) => (
            <NoDataState description={warning} key={warning} title="Data limitation" />
          ))}
        </div>
      ) : null}
      <div className="grid gap-5 xl:grid-cols-2">
        <TrendChart points={data.executive.visitTrend} />
        <BarChartCard
          data={data.executive.visitsByProvince}
          definition="Visits by province counts visit records grouped by attraction province. It is platform participation, not official arrivals."
          emptyDescription="No visits by province for selected filters."
          title="Visits by province"
        />
      </div>
    </section>
  );
}
