import type { DistributionItem } from "@/types/dashboard";
import { MetricTooltip } from "@/components/dashboard/MetricTooltip";
import { NoDataState } from "@/components/dashboard/NoDataState";

type BarChartCardProps = {
  title: string;
  definition: string;
  data: DistributionItem[];
  emptyDescription: string;
};

export function BarChartCard({ title, definition, data, emptyDescription }: BarChartCardProps) {
  const max = Math.max(...data.map((item) => item.value), 0);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-lg font-black text-slate-800">{title}</h2>
        <MetricTooltip definition={definition} />
      </div>
      {data.length === 0 ? (
        <div className="mt-4">
          <NoDataState description={emptyDescription} />
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          {data.slice(0, 8).map((item) => {
            const width = max > 0 ? Math.max((item.value / max) * 100, 3) : 0;
            return (
              <div key={item.label}>
                <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                  <span className="truncate font-bold text-slate-600">{item.label}</span>
                  <span className="shrink-0 font-black text-slate-800">{item.value.toLocaleString("th-TH")}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-[#F3704C]" style={{ width: `${width}%` }} />
                </div>
                {item.percent !== null ? (
                  <p className="mt-1 text-xs text-slate-400">{Math.round(item.percent * 100)}% of selected data</p>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
