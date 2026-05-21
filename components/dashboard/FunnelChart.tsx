import type { FunnelStage } from "@/types/dashboard";
import { MetricTooltip } from "@/components/dashboard/MetricTooltip";

export function FunnelChart({ stages }: { stages: FunnelStage[] }) {
  const max = Math.max(...stages.map((stage) => stage.count), 0);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-[#073F37]">QR-to-certificate funnel</h2>
          <p className="mt-1 text-sm text-slate-500">Event counts are not visits or unique people.</p>
        </div>
        <MetricTooltip definition="Funnel conversion uses current event count divided by previous event count. Zero denominator returns No data." />
      </div>
      <div className="mt-5 space-y-3">
        {stages.map((stage) => {
          const width = max > 0 ? Math.max((stage.count / max) * 100, stage.count > 0 ? 3 : 0) : 0;
          return (
            <div className="rounded-xl bg-slate-50 p-3" key={stage.key}>
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-black text-slate-700">{stage.label}</span>
                <span className="font-black text-[#073F37]">{stage.count.toLocaleString("th-TH")}</span>
              </div>
              <div className="mt-2 h-3 overflow-hidden rounded-full bg-white">
                <div className="h-full rounded-full bg-[#0A6B62]" style={{ width: `${width}%` }} />
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Conversion from previous:{" "}
                {stage.conversionFromPrevious === null ? "No data" : `${Math.round(stage.conversionFromPrevious * 100)}%`}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
