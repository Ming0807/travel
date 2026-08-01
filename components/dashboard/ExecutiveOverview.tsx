import { BarChartCard } from "@/components/dashboard/BarChartCard";
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
  const topAttractions = data.executive.topAttractions.map((attraction) => ({
    label: attraction.attractionName,
    value: attraction.visitCount,
    percent: null,
  }));

  return (
    <section className="space-y-4" aria-labelledby="executive-overview-heading">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="executive-overview-heading" className="text-lg font-bold text-slate-900">สรุปสำหรับผู้บริหาร</h2>
          <p className="mt-1 text-sm text-slate-500">กิจกรรมล่าสุด ประสิทธิภาพการเก็บข้อมูล และคุณภาพประสบการณ์ในมุมมองเดียว</p>
        </div>
        <ExportCsvButton />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {primaryMetrics.map((metric) => (
          <KpiCard key={metric.key} metric={metric} sparklineData={metric.key === "total_visits" ? data.executive.visitTrend : undefined} />
        ))}
      </div>

      {data.dataQualityWarnings.length > 0 ? (
        <details className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3">
          <summary className="cursor-pointer text-sm font-bold text-amber-900">ข้อจำกัดของข้อมูล {data.dataQualityWarnings.length} รายการ</summary>
          <div className="mt-3 grid gap-2 md:grid-cols-2">
            {data.dataQualityWarnings.map((warning) => <NoDataState key={warning} title="ข้อจำกัดของข้อมูล" description={warning} />)}
          </div>
        </details>
      ) : null}

      <div className="grid min-w-0 gap-4 xl:grid-cols-12">
        <div className="min-w-0 xl:col-span-8">
          <TrendChart points={data.executive.visitTrend} />
        </div>
        <div className="min-w-0 xl:col-span-4">
          <ExecutiveFunnelSummary stages={data.funnel.stages} />
        </div>
        <div className="min-w-0 xl:col-span-8">
          <BarChartCard
            data={topAttractions}
            definition="จัดอันดับสถานที่ตามจำนวนรายการเข้าชมที่บันทึกสำเร็จในระบบ"
            emptyDescription="ยังไม่มีข้อมูลสถานที่ท่องเที่ยวสำหรับช่วงและตัวกรองที่เลือก"
            title="สถานที่ที่มีการเข้าชมสูงสุด"
          />
        </div>
        <div className="min-w-0 xl:col-span-4">
          <ExecutiveExperienceSummary satisfaction={data.satisfaction} />
        </div>
      </div>
    </section>
  );
}
