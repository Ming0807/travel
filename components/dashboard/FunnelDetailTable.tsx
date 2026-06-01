import type { FunnelStage } from "@/types/dashboard";

function pct(value: number | null): string {
  if (value === null) return "—";
  return `${(value * 100).toFixed(1)}%`;
}

function fmt(n: number): string {
  return n.toLocaleString("th-TH");
}

export function FunnelDetailTable({ stages }: { stages: FunnelStage[] }) {
  if (stages.length === 0) return null;

  const maxCount = Math.max(...stages.map((s) => s.count), 1);

  return (
    <section className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <h2 className="mb-4 text-lg font-black text-slate-800">Stage details</h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
              <th className="pb-3 pr-4">Stage</th>
              <th className="pb-3 pr-4 text-right">Events</th>
              <th className="pb-3 pr-4 text-right">% of peak</th>
              <th className="pb-3 pr-4 text-right">Conversion</th>
              <th className="pb-3 pr-4 text-right">Drop-off</th>
              <th className="pb-3 text-xs font-normal text-slate-400 max-w-xs">Definition</th>
            </tr>
          </thead>
          <tbody>
            {stages.map((stage, i) => {
              const pctOfPeak = maxCount > 0 ? (stage.count / maxCount) * 100 : 0;
              return (
                <tr
                  key={stage.key}
                  className="border-b border-slate-50 transition-colors hover:bg-slate-50/80"
                >
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#073F37]/10 text-[11px] font-black text-[#073F37]">
                        {i + 1}
                      </span>
                      <span className="font-semibold text-slate-800">{stage.label}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                    {fmt(stage.count)}
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center justify-end gap-2">
                      <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-[#0A6B62] transition-all"
                          style={{ width: `${Math.min(pctOfPeak, 100)}%` }}
                        />
                      </div>
                      <span className="w-12 text-right font-mono text-xs text-slate-500 tabular-nums">
                        {pctOfPeak.toFixed(0)}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-right font-mono tabular-nums">
                    {i === 0 ? (
                      <span className="text-slate-400">—</span>
                    ) : (
                      <span className="font-semibold text-emerald-600">
                        {pct(stage.conversionFromPrevious)}
                      </span>
                    )}
                  </td>
                  <td className="py-3 pr-4 text-right font-mono tabular-nums">
                    {i === 0 ? (
                      <span className="text-slate-400">—</span>
                    ) : (
                      <span className="font-semibold text-rose-500">
                        {pct(stage.dropOffFromPrevious)}
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-xs text-slate-400 max-w-xs">
                    {stage.definition}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
