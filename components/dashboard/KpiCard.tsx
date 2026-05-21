import type { DashboardKpi } from "@/types/dashboard";
import { MetricTooltip } from "@/components/dashboard/MetricTooltip";
import { 
  Users, 
  MapPin, 
  Files, 
  Star, 
  CurrencyCircleDollar,
  ChartBar
} from "@phosphor-icons/react/dist/ssr";

function getIcon(key: string, label: string) {
  const k = (key + label).toLowerCase();
  if (k.includes("tourist") || k.includes("user") || k.includes("visitor")) return <Users size={20} weight="fill" />;
  if (k.includes("visit") || k.includes("destination") || k.includes("attraction")) return <MapPin size={20} weight="fill" />;
  if (k.includes("certificate") || k.includes("article") || k.includes("message")) return <Files size={20} weight="fill" />;
  if (k.includes("satisfaction") || k.includes("review") || k.includes("rating")) return <Star size={20} weight="fill" />;
  if (k.includes("expense") || k.includes("spending") || k.includes("revenue")) return <CurrencyCircleDollar size={20} weight="fill" />;
  return <ChartBar size={20} weight="fill" />;
}

export function KpiCard({ metric }: { metric: DashboardKpi }) {
  const isNoData = metric.value === "No data";

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#FFEBE5] text-[#F3704C]">
          {getIcon(metric.key, metric.label)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-slate-500 truncate">{metric.label}</h3>
            <MetricTooltip definition={metric.definition} />
          </div>
          <p className={`mt-1 text-2xl font-black tracking-tight ${isNoData ? "text-slate-400" : "text-slate-800"}`}>
            {metric.value}
          </p>
        </div>
      </div>
      {metric.note ? (
        <div className="mt-4 flex items-center gap-1">
          <span className="text-xs font-bold text-emerald-500">{metric.note}</span>
          <span className="text-xs text-slate-400">vs expected</span>
        </div>
      ) : (
        <div className="mt-4 flex items-center gap-1 opacity-0 pointer-events-none">
          <span className="text-xs font-bold text-emerald-500">space</span>
        </div>
      )}
    </article>
  );
}
