import type { DashboardViewModel } from "@/types/dashboard";
import { BarChartCard } from "@/components/dashboard/BarChartCard";
import { KpiCard } from "@/components/dashboard/KpiCard";

export function TravelBehaviorSection({ data }: { data: DashboardViewModel }) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-black text-[#073F37]">Travel behavior</h2>
        <p className="mt-1 text-sm text-slate-500">Optional survey and visit behavior fields. Missing values are not treated as zero.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <KpiCard
          metric={{
            key: "average_group_size",
            label: "Average Group Size",
            value: data.travelBehavior.averageGroupSize === null ? "No data" : data.travelBehavior.averageGroupSize.toFixed(1),
            rawValue: data.travelBehavior.averageGroupSize,
            valueType: "text",
            definition: "Average group size uses only non-null group_size answers. Missing answers are excluded.",
            note: `${data.travelBehavior.answeredGroupSizeCount} answered`
          }}
          index={0}
        />
        <KpiCard
          metric={{
            key: "average_nights",
            label: "Average Nights",
            value: data.travelBehavior.averageNights === null ? "No data" : data.travelBehavior.averageNights.toFixed(1),
            rawValue: data.travelBehavior.averageNights,
            valueType: "text",
            definition: "Average nights uses only non-null nights answers. Missing answers are excluded.",
            note: `${data.travelBehavior.answeredNightsCount} answered`
          }}
          index={1}
        />
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <BarChartCard data={data.travelBehavior.companionTypes} definition="Travel companion distribution from optional survey fields." emptyDescription="No travel companion data." title="Travel companion" />
        <BarChartCard data={data.travelBehavior.transportModes} definition="Transport mode distribution from optional survey fields." emptyDescription="No transport mode data." title="Transport mode" />
        <BarChartCard data={data.travelBehavior.travelPurposes} definition="Travel purpose distribution from optional survey fields." emptyDescription="No travel purpose data." title="Travel purpose" />
        <BarChartCard data={data.travelBehavior.overnightStatus} definition="Same-day versus overnight distribution. Unknown/missing stays visible as No data." emptyDescription="No overnight status data." title="Same-day vs overnight" />
      </div>
    </section>
  );
}
