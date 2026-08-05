import { ExecutiveAttractionRanking } from "@/components/dashboard/ExecutiveAttractionRanking";
import { ExecutiveExperienceSummary } from "@/components/dashboard/ExecutiveExperienceSummary";
import { ExecutiveFunnelSummary } from "@/components/dashboard/ExecutiveFunnelSummary";
import { AnalyticsSectionHeader } from "@/components/dashboard/AnalyticsSectionHeader";
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
    <section className="space-y-4" aria-labelledby="executive-overview-heading">
      <div className="border-b border-slate-200 pb-4">
        <AnalyticsSectionHeader
          actions={<ExportCsvButton />}
          description="ติดตามรายการเข้าชม ประสิทธิภาพการเก็บข้อมูล และคุณภาพประสบการณ์ในช่วงที่เลือก"
          headingId="executive-overview-heading"
          title="ภาพรวมสำหรับผู้บริหาร"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {primaryMetrics.map((metric, index) => (
          <KpiCard
            key={metric.key}
            index={index}
            metric={metric}
            variant="band"
          />
        ))}
      </div>

      <div className="grid min-w-0 items-stretch gap-4 xl:grid-cols-[minmax(0,1.9fr)_minmax(19rem,0.82fr)]">
        <div className="min-w-0">
          <TrendChart points={data.executive.visitTrend} />
        </div>
        <div className="min-w-0">
          <ExecutiveFunnelSummary stages={data.funnel.stages} />
        </div>
      </div>

      <div className="grid min-w-0 items-stretch gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(22rem,0.9fr)]">
        <div className="min-w-0">
          <ExecutiveAttractionRanking attractions={data.executive.topAttractions} />
        </div>
        <div className="min-w-0">
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
