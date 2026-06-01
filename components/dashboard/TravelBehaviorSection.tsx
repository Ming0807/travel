import type { DashboardViewModel } from "@/types/dashboard";
import { BarChartCard } from "@/components/dashboard/BarChartCard";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { TravelBehaviorDetailTable } from "@/components/dashboard/TravelBehaviorDetailTable";

export function TravelBehaviorSection({ data }: { data: DashboardViewModel }) {
  const totalBehaviorAnswers =
    data.travelBehavior.answeredGroupSizeCount + data.travelBehavior.answeredNightsCount;

  const totalVisits = data.kpis.find((k) => k.key === "total_visits")?.rawValue ?? 0;
  const behaviorParticipationRate =
    totalBehaviorAnswers > 0 && totalVisits > 0
      ? totalBehaviorAnswers / totalVisits
      : null;

  const totalBehaviorResponses =
    data.travelBehavior.companionTypes.reduce((s, i) => s + i.value, 0) +
    data.travelBehavior.transportModes.reduce((s, i) => s + i.value, 0) +
    data.travelBehavior.travelPurposes.reduce((s, i) => s + i.value, 0) +
    data.travelBehavior.overnightStatus.reduce((s, i) => s + i.value, 0) +
    totalBehaviorAnswers;

  const responseRate =
    totalVisits > 0
      ? Math.round((data.travelBehavior.answeredGroupSizeCount / totalVisits) * 100)
      : 0;
  const nightsRate =
    totalVisits > 0
      ? Math.round((data.travelBehavior.answeredNightsCount / totalVisits) * 100)
      : 0;

  return (
    <section className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-[#073F37]">Travel behavior</h2>
        <p className="mt-1 text-sm text-slate-500">Optional survey and visit behavior fields. Missing values are not treated as zero.</p>
      </div>

      {/* Summary metrics row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
          sampleCount={data.travelBehavior.answeredGroupSizeCount}
          sampleLabel="group size answers"
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
          sampleCount={data.travelBehavior.answeredNightsCount}
          sampleLabel="nights answers"
        />
        <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Behavior field responses
          </p>
          <p className="mt-1 text-2xl font-black text-slate-800 tabular-nums">
            {(totalBehaviorResponses).toLocaleString("th-TH")}
          </p>
          {behaviorParticipationRate !== null && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Of total visits</span>
                <span className="font-semibold text-slate-600">
                  {Math.round(behaviorParticipationRate * 100)}%
                </span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(Math.round(behaviorParticipationRate * 100), 100)}%`,
                    backgroundColor: "#0A6B62",
                    opacity: 0.7,
                  }}
                />
              </div>
            </div>
          )}
        </div>
        <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Response rate
          </p>
          <p className="mt-1 text-2xl font-black text-slate-800 tabular-nums">
            {responseRate > 0 ? `${responseRate}%` : "0%"}
          </p>
          <div className="mt-2 flex flex-col gap-1 text-xs">
            <span className="text-slate-400">
              <span className="font-semibold text-slate-600">{nightsRate}%</span> nights answered
            </span>
          </div>
        </div>
      </div>

      {/* Bar chart grid */}
      <div className="grid gap-5 xl:grid-cols-2">
        <BarChartCard data={data.travelBehavior.companionTypes} definition="Travel companion distribution from optional survey fields." emptyDescription="No travel companion data." title="Travel companion" />
        <BarChartCard data={data.travelBehavior.transportModes} definition="Transport mode distribution from optional survey fields." emptyDescription="No transport mode data." title="Transport mode" />
        <BarChartCard data={data.travelBehavior.travelPurposes} definition="Travel purpose distribution from optional survey fields." emptyDescription="No travel purpose data." title="Travel purpose" />
        <BarChartCard data={data.travelBehavior.overnightStatus} definition="Same-day versus overnight distribution. Unknown/missing stays visible as No data." emptyDescription="No overnight status data." title="Same-day vs overnight" />
      </div>

      {/* Detail table section */}
      <div>
        <div className="mb-4 flex items-center gap-3">
          <h3 className="text-lg font-black text-slate-800">
            Detailed breakdown
          </h3>
          <div className="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent" />
        </div>
        <TravelBehaviorDetailTable
          companionTypes={data.travelBehavior.companionTypes}
          transportModes={data.travelBehavior.transportModes}
          travelPurposes={data.travelBehavior.travelPurposes}
          overnightStatus={data.travelBehavior.overnightStatus}
          averageGroupSize={data.travelBehavior.averageGroupSize}
          averageNights={data.travelBehavior.averageNights}
          answeredGroupSizeCount={data.travelBehavior.answeredGroupSizeCount}
          answeredNightsCount={data.travelBehavior.answeredNightsCount}
        />
      </div>
    </section>
  );
}
