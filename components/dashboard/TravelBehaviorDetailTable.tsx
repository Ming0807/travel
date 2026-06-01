import type { DistributionItem } from "@/types/dashboard";

function fmt(n: number): string {
  return n.toLocaleString("th-TH");
}

function pct(value: number | null): string {
  if (value === null) return "—";
  return `${(value * 100).toFixed(1)}%`;
}

function BehaviorDetailSection({
  title,
  description,
  items,
  emptyMessage,
  accentColor = "#0A6B62",
}: {
  title: string;
  description: string;
  items: DistributionItem[];
  emptyMessage: string;
  accentColor?: string;
}) {
  const maxCount = Math.max(...items.map((i) => i.value), 1);

  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <h3 className="mb-1 text-base font-black text-slate-800">{title}</h3>
      <p className="mb-4 text-sm text-slate-500">{description}</p>

      {items.length === 0 ? (
        <p className="text-sm text-slate-400 italic">{emptyMessage}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="pb-3 pr-4">Option</th>
                <th className="pb-3 pr-4 text-right">Count</th>
                <th className="pb-3 pr-4 text-right">% of total</th>
                <th className="pb-3 w-40">Distribution</th>
              </tr>
            </thead>
            <tbody>
              {items.slice(0, 15).map((item) => {
                const barWidth = maxCount > 0 ? (item.value / maxCount) * 100 : 0;
                return (
                  <tr
                    key={item.label}
                    className="border-b border-slate-50 last:border-0 transition-colors hover:bg-slate-50/80"
                  >
                    <td className="py-3 pr-4 font-semibold text-slate-800">
                      {item.label}
                    </td>
                    <td className="py-3 pr-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                      {fmt(item.value)}
                    </td>
                    <td className="py-3 pr-4 text-right font-mono tabular-nums text-slate-500">
                      {pct(item.percent)}
                    </td>
                    <td className="py-3">
                      <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${Math.min(barWidth, 100)}%`,
                            backgroundColor: accentColor,
                            opacity: 0.7,
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
              {items.length > 15 && (
                <tr className="border-t border-slate-100 bg-slate-50/30">
                  <td
                    colSpan={4}
                    className="px-3 py-2 text-center text-xs text-slate-400"
                  >
                    +{items.length - 15} more items (showing top 15)
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

type TravelBehaviorDetailTableProps = {
  companionTypes: DistributionItem[];
  transportModes: DistributionItem[];
  travelPurposes: DistributionItem[];
  overnightStatus: DistributionItem[];
  averageGroupSize: number | null;
  averageNights: number | null;
  answeredGroupSizeCount: number;
  answeredNightsCount: number;
};

export function TravelBehaviorDetailTable({
  companionTypes,
  transportModes,
  travelPurposes,
  overnightStatus,
  averageGroupSize,
  averageNights,
  answeredGroupSizeCount,
  answeredNightsCount,
}: TravelBehaviorDetailTableProps) {
  const totalResponded =
    answeredGroupSizeCount + answeredNightsCount > 0;

  return (
    <section className="space-y-5">
      {/* Detail tables in 2-column grid */}
      <div className="grid gap-5 md:grid-cols-2">
        <BehaviorDetailSection
          title="Companion types"
          description="Who tourists travel with. Based on optional survey fields."
          items={companionTypes}
          emptyMessage="No companion type data available."
          accentColor="#F3704C"
        />
        <BehaviorDetailSection
          title="Transport modes"
          description="How tourists travel to the destination."
          items={transportModes}
          emptyMessage="No transport mode data available."
          accentColor="#0A6B62"
        />
        <BehaviorDetailSection
          title="Travel purposes"
          description="Main reasons for visiting. Based on optional survey fields."
          items={travelPurposes}
          emptyMessage="No travel purpose data available."
          accentColor="#14b8a6"
        />
        <BehaviorDetailSection
          title="Overnight status"
          description="Same-day versus overnight stay distribution."
          items={overnightStatus}
          emptyMessage="No overnight status data available."
          accentColor="#D6A13D"
        />
      </div>

      {/* Group size & nights summary cards */}
      <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <h2 className="mb-1 text-lg font-black text-slate-800">
          Group size &amp; stay duration
        </h2>
        <p className="mb-5 text-sm text-slate-500">
          Summary statistics from the optional survey. Only non-null answers are
          included in averages — missing values are excluded, not treated as
          zero.
        </p>

        {!totalResponded ? (
          <p className="text-sm text-slate-400 italic">
            No group size or stay duration data available.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Average group size
              </p>
              <p className="mt-1 text-3xl font-black text-slate-800 tabular-nums">
                {averageGroupSize !== null
                  ? averageGroupSize.toFixed(1)
                  : "—"}
              </p>
              <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                {fmt(answeredGroupSizeCount)} responses
              </div>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Average nights stayed
              </p>
              <p className="mt-1 text-3xl font-black text-slate-800 tabular-nums">
                {averageNights !== null
                  ? averageNights.toFixed(1)
                  : "—"}
              </p>
              <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#0A6B62]" />
                {fmt(answeredNightsCount)} responses
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
