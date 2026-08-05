import type { ReactNode } from "react";

type AnalyticsMetric = {
  label: string;
  value: ReactNode;
  icon: ReactNode;
  note?: string;
};

const TONES = [
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
] as const;

export function AnalyticsMetricGrid({
  items,
  label,
}: {
  items: AnalyticsMetric[];
  label: string;
}) {
  return (
    <dl aria-label={label} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" role="group">
      {items.map((item, index) => {
        const tone = TONES[index % TONES.length];

        return (
          <div
            className={`relative min-h-28 min-w-0 overflow-hidden rounded-[5px] border bg-white p-4 shadow-[0_4px_8px_rgba(15,23,42,0.05)] ${tone.border}`}
            key={item.label}
          >
            <span aria-hidden="true" className={`absolute inset-x-0 top-0 h-0.5 ${tone.rule}`} />
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <dt className="text-xs font-bold leading-5 text-slate-600">{item.label}</dt>
                <dd className="mt-2 break-words text-2xl font-black leading-none tabular-nums text-slate-950">
                  {item.value}
                </dd>
              </div>
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[5px] border ${tone.icon}`}>
                {item.icon}
              </span>
            </div>
            {item.note ? <p className="mt-3 text-xs leading-5 text-slate-500">{item.note}</p> : null}
          </div>
        );
      })}
    </dl>
  );
}
