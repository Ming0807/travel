import { localizeDashboardLabel } from "@/components/dashboard/dashboard-localization";
import { MetricTooltip } from "@/components/dashboard/MetricTooltip";
import { NoDataState } from "@/components/dashboard/NoDataState";
import { SmallSampleWarning } from "@/components/dashboard/SmallSampleWarning";
import { DASHBOARD_MIN_SAMPLE_SIZE } from "@/constants/dashboard-metrics";
import type { DistributionItem } from "@/types/dashboard";

type BarChartCardProps = {
  title: string;
  definition: string;
  data: DistributionItem[];
  emptyDescription: string;
  sampleCount?: number;
  sampleLabel?: string;
};

export function BarChartCard({ title, definition, data, emptyDescription, sampleCount, sampleLabel = "คำตอบ" }: BarChartCardProps) {
  const visible = data.slice(0, 8);
  const max = Math.max(...visible.map((item) => item.value), 0);

  return (
    <section className="min-w-0 rounded-md border border-slate-200 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-base font-bold text-slate-900">{title}</h2>
        <MetricTooltip definition={definition} />
      </div>
      {visible.length === 0 ? (
        <div className="mt-4"><NoDataState description={emptyDescription} /></div>
      ) : (
        <>
          {sampleCount !== undefined && sampleCount < DASHBOARD_MIN_SAMPLE_SIZE ? <div className="mt-3"><SmallSampleWarning count={sampleCount} label={sampleLabel} /></div> : null}
          <div className="mt-4 space-y-3">
            {visible.map((item, index) => {
              const width = max > 0 ? Math.max((item.value / max) * 100, 2) : 0;
              return (
                <div key={`${item.label}-${index}`}>
                  <div className="mb-1 flex items-start justify-between gap-3 text-sm">
                    <span className="min-w-0 break-words font-medium text-slate-700">{localizeDashboardLabel(item.label)}</span>
                    <span className="shrink-0 font-bold tabular-nums text-slate-900">{item.value.toLocaleString("th-TH")}{item.percent !== null ? ` (${Math.round(item.percent * 100)}%)` : ""}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-sm bg-slate-100" role="img" aria-label={`${localizeDashboardLabel(item.label)} ${item.value.toLocaleString("th-TH")}`}>
                    <div className={`h-full rounded-sm ${index === 0 ? "bg-[#B94727]" : "bg-[#475569]"}`} style={{ width: `${width}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          <details className="mt-4 border-t border-slate-100 pt-3">
            <summary className="cursor-pointer text-xs font-semibold text-[#B94727]">ดูเป็นตารางข้อมูล</summary>
            <div className="mt-2 overflow-x-auto">
              <table className="w-full min-w-80 text-sm">
                <thead><tr className="border-b border-slate-200 text-left text-xs text-slate-500"><th className="py-2 pr-4">รายการ</th><th className="py-2 text-right">จำนวน</th></tr></thead>
                <tbody>{visible.map((item) => <tr key={`table-${item.label}`} className="border-b border-slate-100"><td className="py-2 pr-4">{localizeDashboardLabel(item.label)}</td><td className="py-2 text-right tabular-nums">{item.value.toLocaleString("th-TH")}</td></tr>)}</tbody>
              </table>
            </div>
          </details>
        </>
      )}
    </section>
  );
}
