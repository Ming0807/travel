import { CircleHelp } from "lucide-react";

export function MetricTooltip({ definition }: { definition: string }) {
  return (
    <span className="group relative inline-flex" tabIndex={0} aria-label={`คำอธิบายตัวชี้วัด: ${definition}`}>
      <CircleHelp aria-hidden="true" className="text-slate-500" size={16} />
      <span role="tooltip" className="pointer-events-none absolute right-0 top-6 z-20 hidden w-72 max-w-[80vw] rounded-md border border-slate-200 bg-white p-3 text-xs font-medium leading-5 text-slate-700 shadow-card group-hover:block group-focus:block">
        {definition}
      </span>
    </span>
  );
}
