import type { DashboardViewModel } from "@/types/dashboard";
import { FunnelChart } from "@/components/dashboard/FunnelChart";
import { NoDataState } from "@/components/dashboard/NoDataState";

export function FunnelSection({ data }: { data: DashboardViewModel }) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-black text-[#073F37]">Funnel analytics</h2>
        <p className="mt-1 text-sm text-slate-500">Funnel events explain drop-off. They are not visits and not unique people.</p>
      </div>
      {data.funnel.largestDropOffStage ? (
        <NoDataState
          title="Largest drop-off signal"
          description={`${data.funnel.largestDropOffStage.label}: ${
            data.funnel.largestDropOffStage.dropOffFromPrevious === null
              ? "No data"
              : `${Math.round(data.funnel.largestDropOffStage.dropOffFromPrevious * 100)}% drop-off from previous stage`
          }.`}
        />
      ) : null}
      <FunnelChart stages={data.funnel.stages} />
    </section>
  );
}
