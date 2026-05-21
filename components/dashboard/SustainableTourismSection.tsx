import type { DashboardViewModel } from "@/types/dashboard";
import { InsightCard } from "@/components/dashboard/InsightCard";
import { NoDataState } from "@/components/dashboard/NoDataState";

export function SustainableTourismSection({ data }: { data: DashboardViewModel }) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-black text-[#073F37]">Sustainable tourism insights</h2>
        <p className="mt-1 text-sm text-slate-500">Heuristic planning cards with evidence and limitations, not AI claims or official impact statements.</p>
      </div>
      {data.insights.length === 0 ? (
        <NoDataState description="No insight cards can be generated yet. More visits and optional survey responses are needed." />
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {data.insights.map((insight) => (
            <InsightCard insight={insight} key={insight.title} />
          ))}
        </div>
      )}
    </section>
  );
}
