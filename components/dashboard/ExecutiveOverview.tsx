import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { ExecutiveAttractionMatrix } from "@/components/dashboard/ExecutiveAttractionMatrix";
import { ExecutiveExperienceSummary } from "@/components/dashboard/ExecutiveExperienceSummary";
import { ExecutiveFunnelSummary } from "@/components/dashboard/ExecutiveFunnelSummary";
import { ExecutiveDecisionSummary } from "@/components/dashboard/ExecutiveDecisionSummary";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { TrendChart } from "@/components/dashboard/TrendChart";
import { buildDashboardNavigationHref } from "@/components/dashboard/dashboard-navigation";
import { localizeDashboardKpi } from "@/components/dashboard/dashboard-localization";
import { dashboardFiltersToSafeQuery } from "@/lib/dashboard/dashboard-saved-views";
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
  const query = new URLSearchParams(dashboardFiltersToSafeQuery(data.filters)).toString();
  const linkTo = (page: string) => buildDashboardNavigationHref(`/admin/dashboard/${page}`, query);
  const supportingMetrics = data.kpis.filter((metric) => ["estimated_spending", "stamps_earned", "top_attraction"].includes(metric.key)).map(localizeDashboardKpi);
  const comparison = data.quality?.claimsAllowed === false ? null : data.comparison;

  return (
    <section className="space-y-5" aria-label="ภาพรวมการตัดสินใจ">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5 [&>article:last-child]:col-span-2 md:[&>article:last-child]:col-span-1" aria-label="ตัวชี้วัดหลัก" data-print-kpis>
        {primaryMetrics.map((metric, index) => (
          <KpiCard
            key={metric.key}
            index={index}
            metric={metric}
            comparison={comparison?.status === "ready" ? comparison.metrics[metric.key] : undefined}
            variant="band"
            compact
          />
        ))}
      </div>

      <div className="grid min-w-0 items-start gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]" data-print-grid="trend-decision">
        <div className="min-w-0">
          <TrendChart points={data.executive.visitTrend} />
        </div>
        <div className="min-w-0">
          <ExecutiveDecisionSummary comparison={comparison} insights={data.insights} kpis={data.kpis} />
        </div>
      </div>

      <div className="grid min-w-0 items-start gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]" data-print-grid="attraction-experience">
        <div className="min-w-0 space-y-1">
          <ExecutiveAttractionMatrix attractions={data.executive.topAttractions} />
          <DetailLink href={linkTo("attractions")}>วิเคราะห์รายสถานที่</DetailLink>
          <p className="px-2 text-xs leading-5 text-slate-600" data-print-hide>หน้ารายสถานที่รับช่วงวันที่ สถานที่ และชุดหลักฐาน ส่วนตัวกรองกลุ่มผู้ตอบไม่ถูกส่งต่อ</p>
        </div>
        <div className="min-w-0 space-y-1">
          <ExecutiveExperienceSummary satisfaction={data.satisfaction} />
          <DetailLink href={linkTo("satisfaction")}>เจาะลึกคุณภาพประสบการณ์</DetailLink>
        </div>
      </div>

      <div className="grid min-w-0 items-start gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]" data-print-grid="funnel-planning">
        <div className="min-w-0 space-y-1">
          <ExecutiveFunnelSummary stages={data.funnel.stages} />
          <DetailLink href={linkTo("funnel")}>ตรวจเส้นทางผู้ใช้ทุกขั้นตอน</DetailLink>
        </div>
        <section className="min-w-0 border-y border-slate-200 px-1 py-4 sm:px-3" aria-labelledby="executive-planning-heading">
          <h2 id="executive-planning-heading" className="text-lg font-bold text-slate-950">ข้อมูลประกอบการวางแผน</h2>
          <dl className="mt-2 divide-y divide-slate-200">
            {supportingMetrics.map((metric) => (
              <div key={metric.key} className="py-3">
                <dt className="text-xs font-semibold text-slate-600">{metric.label}</dt>
                <dd className="mt-1 break-words text-lg font-bold tabular-nums text-slate-950">{metric.value}</dd>
                <dd className="mt-1 text-xs leading-5 text-slate-600">{metric.note ?? metric.definition}</dd>
              </div>
            ))}
          </dl>
          <nav aria-label="เจาะลึกข้อมูลเพื่อวางแผน" className="mt-3 grid divide-y divide-slate-200" data-print-hide>
            <DetailLink href={linkTo("tourists")}>กลุ่มนักท่องเที่ยวและต้นทาง</DetailLink>
            <DetailLink href={linkTo("visits")}>พฤติกรรมและการค้างคืน</DetailLink>
            <DetailLink href={linkTo("expenses")}>ช่วงค่าใช้จ่ายที่ผู้ตอบรายงาน</DetailLink>
            <DetailLink href={linkTo("sustainability")}>ข้อเสนอเพื่อการพัฒนา</DetailLink>
          </nav>
        </section>
      </div>

      {data.dataQualityWarnings.length > 0 ? (
        <details className="rounded-md border border-amber-200 bg-[#FFFBEB] px-4 py-2.5" data-print-hide>
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

function DetailLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <Link href={href} data-print-hide className="group flex min-h-11 items-center justify-between gap-3 rounded-[4px] px-2 py-2 text-sm font-semibold text-[#9D3715] transition-colors hover:bg-orange-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D94717]">{children}<ArrowUpRight aria-hidden="true" size={18} className="shrink-0" /></Link>;
}
