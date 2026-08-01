import type { ReactNode } from "react";
import { ChartBar, CurrencyCircleDollar, Files, MapPin, Star, Users, WarningCircle } from "@phosphor-icons/react/dist/ssr";
import { localizeDashboardKpi } from "@/components/dashboard/dashboard-localization";
import { MetricTooltip } from "@/components/dashboard/MetricTooltip";
import { SmallSampleWarning } from "@/components/dashboard/SmallSampleWarning";
import { DASHBOARD_MIN_SAMPLE_SIZE } from "@/constants/dashboard-metrics";
import type { DashboardKpi, TrendPoint } from "@/types/dashboard";

function metricIcon(key: string): ReactNode {
  const className = "h-5 w-5";
  if (key.includes("tourist")) return <Users aria-hidden="true" className={className} weight="fill" />;
  if (key.includes("visit") || key.includes("checkin") || key.includes("attraction")) return <MapPin aria-hidden="true" className={className} weight="fill" />;
  if (key.includes("certificate") || key.includes("stamp")) return <Files aria-hidden="true" className={className} weight="fill" />;
  if (key.includes("satisfaction") || key.includes("score")) return <Star aria-hidden="true" className={className} weight="fill" />;
  if (key.includes("expense") || key.includes("spending")) return <CurrencyCircleDollar aria-hidden="true" className={className} weight="fill" />;
  return <ChartBar aria-hidden="true" className={className} weight="fill" />;
}

function Sparkline({ data }: { data: TrendPoint[] }) {
  if (data.length < 2) return null;
  const values = data.map((point) => point.value);
  const min = Math.min(...values);
  const range = Math.max(...values) - min || 1;
  const points = data.map((point, index) => `${(index / (data.length - 1)) * 100},${30 - ((point.value - min) / range) * 26}`).join(" ");
  return (
    <svg className="h-8 w-full" viewBox="0 0 100 32" preserveAspectRatio="none" role="img" aria-label="แนวโน้มย่อของตัวชี้วัด">
      <polyline points={points} fill="none" stroke="#B94727" strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export function KpiCard({
  metric,
  sparklineData,
  sampleCount,
  sampleLabel = "คำตอบ",
}: {
  metric: DashboardKpi;
  sparklineData?: TrendPoint[];
  index?: number;
  sampleCount?: number;
  sampleLabel?: string;
}) {
  const localized = localizeDashboardKpi(metric);
  const noData = metric.value === "No data" || metric.value === "N/A" || metric.value === "ยังไม่มีข้อมูล";

  return (
    <article data-dashboard-kpi={metric.key} className={`relative min-w-0 overflow-hidden rounded-md border bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)] ${noData ? "border-dashed border-slate-300" : "border-slate-200"}`}>
      {!noData ? <span aria-hidden="true" className="absolute inset-x-0 top-0 h-0.5 bg-[#B94727]" /> : null}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[#F0C8BB] bg-[#FFF7F3] text-[#B94727]">{metricIcon(metric.key)}</span>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="truncate text-xs font-semibold text-slate-600">{localized.label}</h3>
              <MetricTooltip definition={localized.definition} />
            </div>
            {noData ? (
              <p className="mt-1 flex items-center gap-1.5 text-sm font-bold text-slate-500"><WarningCircle aria-hidden="true" size={16} />ยังไม่มีข้อมูล</p>
            ) : (
              <p className="mt-1 truncate text-2xl font-black tabular-nums text-slate-900">{localized.value}</p>
            )}
          </div>
        </div>
      </div>
      {metric.note && !noData ? <p className="mt-2 text-xs leading-5 text-slate-500">{metric.note}</p> : null}
      {sampleCount !== undefined && sampleCount < DASHBOARD_MIN_SAMPLE_SIZE && !noData ? <div className="mt-3"><SmallSampleWarning count={sampleCount} label={sampleLabel} /></div> : null}
      {sparklineData && !noData ? <div className="mt-3 border-t border-slate-100 pt-2"><Sparkline data={sparklineData} /></div> : null}
    </article>
  );
}
