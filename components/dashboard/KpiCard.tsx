import type { DashboardKpi } from "@/types/dashboard";
import { MetricTooltip } from "@/components/dashboard/MetricTooltip";

export function KpiCard({ metric }: { metric: DashboardKpi }) {
  const isNoData = metric.value === "No data";

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">{metric.label}</p>
        <MetricTooltip definition={metric.definition} />
      </div>
      <p className={`mt-4 text-2xl font-black tracking-tight ${isNoData ? "text-slate-400" : "text-[#073F37]"}`}>
        {metric.value}
      </p>
      {metric.note ? <p className="mt-2 text-xs font-bold text-[#D36B4B]">{metric.note}</p> : null}
    </article>
  );
}
