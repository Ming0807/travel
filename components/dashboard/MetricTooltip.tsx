import { CircleHelp } from "lucide-react";

export function MetricTooltip({ definition }: { definition: string }) {
  return (
    <span className="group relative inline-flex">
      <CircleHelp aria-hidden="true" className="text-slate-400" size={16} />
      <span className="pointer-events-none absolute right-0 top-6 z-20 hidden w-72 rounded-xl border border-slate-200 bg-white p-3 text-xs font-medium leading-5 text-slate-600 shadow-card group-hover:block">
        {definition}
      </span>
    </span>
  );
}
