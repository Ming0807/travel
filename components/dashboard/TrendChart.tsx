import type { TrendPoint } from "@/types/dashboard";
import { NoDataState } from "@/components/dashboard/NoDataState";

export function TrendChart({ points }: { points: TrendPoint[] }) {
  const max = Math.max(...points.map((point) => point.value), 0);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
      <h2 className="text-lg font-black text-slate-800">Website Traffic Overview</h2>
      <p className="mt-1 text-sm text-slate-500">Visits are visit records only. QR scans are tracked separately.</p>
      {points.length === 0 ? (
        <div className="mt-4">
          <NoDataState description="No visits in the selected date range." />
        </div>
      ) : (
        <div className="mt-6 flex h-44 items-end gap-1 overflow-x-auto pb-2">
          {points.map((point) => {
            const height = max > 0 ? Math.max((point.value / max) * 100, 4) : 0;
            return (
              <div className="flex min-w-8 flex-1 flex-col items-center gap-2" key={point.label}>
                <div className="flex h-32 w-full items-end rounded-t-xl bg-slate-50">
                  <div className="w-full rounded-t-xl bg-[#F3704C]" style={{ height: `${height}%` }} title={`${point.label}: ${point.value}`} />
                </div>
                <span className="max-w-16 truncate text-[10px] font-bold text-slate-500">{point.label.slice(5)}</span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
