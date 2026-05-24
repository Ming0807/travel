import type { DashboardViewModel } from "@/types/dashboard";
import { BarChartCard } from "@/components/dashboard/BarChartCard";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { NoDataState } from "@/components/dashboard/NoDataState";
import { TrendChart } from "@/components/dashboard/TrendChart";
import { ExportCsvButton } from "@/components/dashboard/ExportCsvButton";

export function ExecutiveOverview({ data }: { data: DashboardViewModel }) {
  const visitTrend = data.executive.visitTrend;

  /* heuristic: which KPIs get a sparkline? */
  const sparklineKeys = ["visit", "tourist", "checkin", "certificate"];

  return (
    <section className="space-y-6">
      <div className="flex justify-end">
        <ExportCsvButton />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {data.kpis.map((metric, i) => {
          const k = (metric.key + metric.label).toLowerCase();
          const showSparkline =
            sparklineKeys.some((s) => k.includes(s)) && visitTrend.length >= 2;
          return (
            <KpiCard
              key={metric.key}
              metric={metric}
              index={i}
              sparklineData={showSparkline ? visitTrend : undefined}
            />
          );
        })}
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
