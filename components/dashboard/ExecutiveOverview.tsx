import { ExecutiveAttractionRanking } from "@/components/dashboard/ExecutiveAttractionRanking";
import { ExecutiveExperienceSummary } from "@/components/dashboard/ExecutiveExperienceSummary";
import { ExecutiveFunnelSummary } from "@/components/dashboard/ExecutiveFunnelSummary";
import { ExportCsvButton } from "@/components/dashboard/ExportCsvButton";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { NoDataState } from "@/components/dashboard/NoDataState";
import { TrendChart } from "@/components/dashboard/TrendChart";
import type { DashboardViewModel } from "@/types/dashboard";

const PRIMARY_KPIS = [
  "tourist_profiles",
  "total_visits",
  "certificates_generated",
  "survey_completion_rate",
];

export function ExecutiveOverview({ data }: { data: DashboardViewModel }) {
  const primaryMetrics = PRIMARY_KPIS.map((key) => data.kpis.find((metric) => metric.key === key)).filter((metric): metric is DashboardViewModel["kpis"][number] => Boolean(metric));

  return (
    <section className="space-y-5" aria-labelledby="executive-overview-heading">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="max-w-2xl">
          <h2 id="executive-overview-heading" className="text-xl font-black text-slate-950">ภาพรวมสำหรับผู้บริหาร</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">ติดตามรายการเข้าชม ประสิทธิภาพการเก็บข้อมูล และคุณภาพประสบการณ์ในช่วงที่เลือก</p>
        </div>
        <ExportCsvButton />
      </div>

      <div className="grid overflow-hidden rounded-md border border-slate-200 bg-white shadow-[0_4px_8px_rgba(15,23,42,0.05)] sm:grid-cols-2 xl:grid-cols-4">
        {primaryMetrics.map((metric, index) => (
          <KpiCard
            key={metric.key}
            index={index}
            metric={metric}
            sparklineData={metric.key === "total_visits" ? data.executive.visitTrend : undefined}
            variant="band"
          />
        ))}
      </div>

      <div className="grid min-w-0 items-stretch gap-4 xl:grid-cols-12">
        <div className="min-w-0 xl:col-span-8">
          <TrendChart points={data.executive.visitTrend} />
        </div>
        <div className="min-w-0 xl:col-span-4">
          <ExecutiveFunnelSummary stages={data.funnel.stages} />
        </div>
      </div>

      <div className="grid min-w-0 items-stretch gap-4 xl:grid-cols-12">
        <div className="min-w-0 xl:col-span-8">
          <ExecutiveAttractionRanking attractions={data.executive.topAttractions} />
        </div>
        <div className="min-w-0 xl:col-span-4">
          <ExecutiveExperienceSummary satisfaction={data.satisfaction} />
        </div>
      </div>

      {data.dataQualityWarnings.length > 0 ? (
        <details className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3">
          <summary className="min-h-11 cursor-pointer py-2 text-sm font-bold text-amber-900">
            ข้อจำกัดของข้อมูล {data.dataQualityWarnings.length} รายการ
          </summary>
          <div className="mt-2 grid gap-2 md:grid-cols-2">
            {data.dataQualityWarnings.map((warning) => (
              <NoDataState key={warning} title="ข้อจำกัดของข้อมูล" description={warning} />
            ))}
          </div>
        </details>
      ) : null}
    </section>
  );
}
