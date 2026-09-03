import { ExecutiveAttractionMatrix } from "@/components/dashboard/ExecutiveAttractionMatrix";
import { ExecutiveFunnelSummary } from "@/components/dashboard/ExecutiveFunnelSummary";
import { ExecutiveDecisionSummary } from "@/components/dashboard/ExecutiveDecisionSummary";
import { ExecutiveQualityStrip } from "@/components/dashboard/ExecutiveQualityStrip";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { TrendChart } from "@/components/dashboard/TrendChart";
import type { DashboardViewModel } from "@/types/dashboard";

const PRIMARY_KPIS = [
  "tourist_profiles",
  "total_visits",
  "certificates_generated",
  "survey_completion_rate",
  "average_satisfaction",
];

export function ExecutiveOverview({ data }: { data: DashboardViewModel }) {
  const primaryMetrics = PRIMARY_KPIS.map((key) => data.kpis.find((metric) => metric.key === key)).filter((metric): metric is DashboardViewModel["kpis"][number] => Boolean(metric));
  const surveyCompletionRate = data.kpis.find((metric) => metric.key === "survey_completion_rate")?.rawValue ?? null;

  return (
    <section className="space-y-4" aria-labelledby="executive-overview-heading">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5" aria-label="ตัวชี้วัดหลัก">
        {primaryMetrics.map((metric, index) => (
          <KpiCard
            key={metric.key}
            index={index}
            metric={metric}
            comparison={data.comparison?.status === "ready" ? data.comparison.metrics[metric.key] : undefined}
            sparklineData={metric.key === "total_visits" ? data.executive.visitTrend : undefined}
            variant="band"
          />
        ))}
      </div>

      <div className="grid min-w-0 items-stretch gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(20rem,0.9fr)]">
        <div className="min-w-0">
          <TrendChart points={data.executive.visitTrend} />
        </div>
        <div className="min-w-0">
          <ExecutiveDecisionSummary comparison={data.comparison} insights={data.insights} kpis={data.kpis} />
        </div>
      </div>

      <div className="grid min-w-0 items-stretch gap-4 xl:grid-cols-2">
        <div className="min-w-0">
          <ExecutiveFunnelSummary stages={data.funnel.stages} />
        </div>
        <div className="min-w-0">
          <ExecutiveAttractionMatrix attractions={data.executive.topAttractions} />
        </div>
      </div>

      <ExecutiveQualityStrip
        expense={data.expense}
        generatedAt={data.summaryRefreshTimestamp ?? data.generatedAt}
        satisfaction={data.satisfaction}
        surveyCompletionRate={surveyCompletionRate}
      />

      {data.dataQualityWarnings.length > 0 ? (
        <details className="rounded-md border border-amber-200 bg-[#FFFBEB] px-4 py-2.5">
          <summary className="min-h-10 cursor-pointer py-2 text-sm font-bold text-amber-950">
            คุณภาพข้อมูล: มีข้อควรระวัง {data.dataQualityWarnings.length} รายการ
          </summary>
          <ul className="border-t border-amber-200 py-2 text-sm leading-6 text-amber-950">
            {data.dataQualityWarnings.map((warning) => (
              <li key={warning} className="py-1">• {warning}</li>
            ))}
          </ul>
        </details>
      ) : null}
    </section>
  );
}
