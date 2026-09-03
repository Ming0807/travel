import type { ReactNode } from "react";
import { ChartBar, CurrencyCircleDollar, Files, MapPin, Star, Users, WarningCircle } from "@phosphor-icons/react/dist/ssr";
import { localizeDashboardKpi } from "@/components/dashboard/dashboard-localization";
import { MetricTooltip } from "@/components/dashboard/MetricTooltip";
import { SmallSampleWarning } from "@/components/dashboard/SmallSampleWarning";
import { DASHBOARD_MIN_SAMPLE_SIZE } from "@/constants/dashboard-metrics";
import type { DashboardKpi, DashboardMetricComparison, KpiValueType, TrendPoint } from "@/types/dashboard";

function metricIcon(key: string): ReactNode {
  const className = "h-5 w-5";
  if (key.includes("tourist")) return <Users aria-hidden="true" className={className} weight="fill" />;
  if (key.includes("visit") || key.includes("checkin") || key.includes("attraction")) return <MapPin aria-hidden="true" className={className} weight="fill" />;
  if (key.includes("certificate") || key.includes("stamp")) return <Files aria-hidden="true" className={className} weight="fill" />;
  if (key.includes("satisfaction") || key.includes("score")) return <Star aria-hidden="true" className={className} weight="fill" />;
  if (key.includes("expense") || key.includes("spending")) return <CurrencyCircleDollar aria-hidden="true" className={className} weight="fill" />;
  return <ChartBar aria-hidden="true" className={className} weight="fill" />;
}

function metricContext(key: string): string | null {
  if (key === "tourist_profiles") return "โปรไฟล์ที่เชื่อมกับการเยี่ยมชม";
  if (key === "total_visits") return "รายการที่ผ่านขั้นข้อมูลขั้นต่ำ";
  if (key === "certificates_generated") return "ใบประกาศที่สร้างสำเร็จ";
  if (key === "survey_completion_rate") return "เทียบกับใบประกาศที่สร้าง";
  return null;
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

function comparisonText(comparison: DashboardMetricComparison, valueType: KpiValueType) {
  if (comparison.currentValue === null || comparison.previousValue === null) return "ยังไม่มีฐานเปรียบเทียบ";
  if (valueType === "percentage" && comparison.absoluteChange !== null) {
    const pointChange = comparison.absoluteChange * 100;
    if (pointChange === 0) return "คงที่จากช่วงก่อน";
    return `${pointChange > 0 ? "เพิ่มขึ้น" : "ลดลง"} ${Math.abs(pointChange).toLocaleString("th-TH", { maximumFractionDigits: 1 })} จุดร้อยละจากช่วงก่อน`;
  }
  if (valueType === "rating" && comparison.absoluteChange !== null) {
    if (comparison.absoluteChange === 0) return "คงที่จากช่วงก่อน";
    return `${comparison.absoluteChange > 0 ? "เพิ่มขึ้น" : "ลดลง"} ${Math.abs(comparison.absoluteChange).toLocaleString("th-TH", { maximumFractionDigits: 1 })} คะแนนจากช่วงก่อน`;
  }
  if (comparison.percentChange === null) {
    return `ช่วงก่อน ${comparison.previousValue.toLocaleString("th-TH")} · ไม่คำนวณร้อยละ`;
  }
  if (comparison.direction === "flat") return "คงที่จากช่วงก่อน";
  const action = comparison.direction === "up" ? "เพิ่มขึ้น" : "ลดลง";
  return `${action} ${Math.abs(comparison.percentChange).toLocaleString("th-TH", { maximumFractionDigits: 1 })}% จากช่วงก่อน`;
}

function EvidenceLabel({ evidence }: { evidence: NonNullable<DashboardKpi["evidence"]> }) {
  const label = {
    system_record: "ข้อมูลระบบ",
    limited: "หลักฐานยังน้อย",
    decision_ready: "พร้อมใช้เชิงพรรณนา",
    unavailable: "ยังไม่มีฐานข้อมูล",
  }[evidence.level];
  const base = `${evidence.sampleSize.toLocaleString("th-TH")} ${evidence.unit}`;
  const denominator = evidence.denominator === null
    ? ""
    : ` / ฐาน ${evidence.denominator.toLocaleString("th-TH")}`;

  return (
    <p className={`mt-2 text-[10px] font-bold leading-4 ${evidence.level === "limited" ? "text-amber-700" : "text-slate-500"}`}>
      {label}{evidence.level === "unavailable" ? "" : ` · ${base}${denominator}`}
    </p>
  );
}

export function KpiCard({
  metric,
  comparison,
  sparklineData,
  index = 0,
  sampleCount,
  sampleLabel = "คำตอบ",
  variant = "card",
}: {
  metric: DashboardKpi;
  comparison?: DashboardMetricComparison;
  sparklineData?: TrendPoint[];
  index?: number;
  sampleCount?: number;
  sampleLabel?: string;
  variant?: "card" | "band";
}) {
  const localized = localizeDashboardKpi(metric);
  const context = metricContext(metric.key);
  const noData = metric.value === "No data" || metric.value === "N/A" || metric.value === "ยังไม่มีข้อมูล";
  const bandTheme = [
    {
      border: "border-[#EDC7BA]",
      icon: "border-[#F0C8BB] bg-[#FFF0EA] text-[#B94727]",
      rule: "bg-[#B94727]",
    },
    {
      border: "border-slate-300",
      icon: "border-slate-950 bg-slate-950 text-white",
      rule: "bg-slate-950",
    },
    {
      border: "border-[#B7D9D5]",
      icon: "border-[#B7D9D5] bg-[#EAF6F4] text-[#0A6B62]",
      rule: "bg-[#0A6B62]",
    },
    {
      border: "border-[#E8D5A5]",
      icon: "border-[#E8D5A5] bg-[#FFF8E6] text-[#8B6515]",
      rule: "bg-[#D6A13D]",
    },
  ][index % 4];
  const containerClass = variant === "band"
    ? "relative min-h-[8.25rem] min-w-0 overflow-hidden rounded-md border border-slate-200 bg-white p-4"
    : `relative min-w-0 overflow-hidden rounded-md border bg-white p-4 ${noData ? "border-dashed border-slate-300" : "border-slate-200"}`;

  return (
    <article data-dashboard-kpi={metric.key} className={containerClass}>
      {!noData ? (
        <span
          aria-hidden="true"
          className={`absolute inset-x-0 bottom-0 h-1 ${variant === "band" ? bandTheme.rule : "bg-[#B94727]"}`}
        />
      ) : null}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="text-[13px] font-bold leading-5 text-slate-700">{localized.label}</h3>
            <MetricTooltip definition={localized.definition} />
          </div>
          {noData ? (
            <p className="mt-3 flex items-center gap-1.5 text-sm font-bold text-slate-600"><WarningCircle aria-hidden="true" size={16} />ยังไม่มีข้อมูล</p>
          ) : (
            <p className="mt-2 break-words text-[2rem] font-black leading-none tabular-nums text-slate-950">{localized.value}</p>
          )}
        </div>
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${variant === "band" ? bandTheme.icon : "border-[#F0C8BB] bg-[#FFF7F3] text-[#B94727]"}`}>
          {metricIcon(metric.key)}
        </span>
      </div>
      {metric.note && !noData ? <p className="mt-2 line-clamp-1 text-[11px] leading-4 text-slate-500">{metric.note}</p> : null}
      {!metric.note && context && !noData ? <p className="mt-2 line-clamp-1 text-[11px] leading-4 text-slate-500">{context}</p> : null}
      {metric.evidence ? <EvidenceLabel evidence={metric.evidence} /> : null}
      {comparison && !noData ? (
        <p className="mt-2 border-t border-slate-100 pt-2 text-[11px] font-semibold leading-4 text-slate-600">
          {comparisonText(comparison, metric.valueType)}
        </p>
      ) : null}
      {sampleCount !== undefined && sampleCount < DASHBOARD_MIN_SAMPLE_SIZE && !noData ? <div className="mt-3"><SmallSampleWarning count={sampleCount} label={sampleLabel} /></div> : null}
      {sparklineData && !noData ? <div className="mt-2"><Sparkline data={sparklineData} /></div> : null}
    </article>
  );
}
