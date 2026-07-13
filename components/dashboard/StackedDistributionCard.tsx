import { localizeDashboardLabel } from "@/components/dashboard/dashboard-localization";
import { MetricTooltip } from "@/components/dashboard/MetricTooltip";
import { NoDataState } from "@/components/dashboard/NoDataState";
import type { DistributionItem } from "@/types/dashboard";

const COLORS = ["#0A6B62", "#4E9187", "#83B5AD", "#D6A13D", "#E77455", "#64748B"];

export function StackedDistributionCard({ title, definition, data, emptyDescription }: { title: string; definition: string; data: DistributionItem[]; emptyDescription: string }) {
  const visible = data.filter((item) => item.value > 0).slice(0, 6);
  const total = visible.reduce((sum, item) => sum + item.value, 0);
  return (
    <section className="min-w-0 rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3"><h2 className="text-base font-bold text-slate-900">{title}</h2><MetricTooltip definition={definition} /></div>
      {total === 0 ? <div className="mt-4"><NoDataState description={emptyDescription} /></div> : (
        <>
          <div className="mt-5 flex h-4 overflow-hidden rounded-full bg-slate-100" role="img" aria-label={title}>
            {visible.map((item, index) => <span key={item.label} style={{ width: `${(item.value / total) * 100}%`, backgroundColor: COLORS[index] }} />)}
          </div>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {visible.map((item, index) => <li key={item.label} className="flex items-center justify-between gap-3 text-sm"><span className="flex min-w-0 items-center gap-2 text-slate-700"><span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: COLORS[index] }} />{localizeDashboardLabel(item.label)}</span><strong className="shrink-0 tabular-nums text-slate-900">{Math.round((item.value / total) * 100)}%</strong></li>)}
          </ul>
          <table className="sr-only"><caption>{title}</caption><thead><tr><th>รายการ</th><th>จำนวน</th></tr></thead><tbody>{visible.map((item) => <tr key={item.label}><td>{localizeDashboardLabel(item.label)}</td><td>{item.value}</td></tr>)}</tbody></table>
        </>
      )}
    </section>
  );
}
