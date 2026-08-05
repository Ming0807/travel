import { ArrowClockwise, ChartBar, Star, UsersThree } from "@phosphor-icons/react/dist/ssr";
import { BarChartCard } from "@/components/dashboard/BarChartCard";
import { ExportCsvButton } from "@/components/dashboard/ExportCsvButton";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { SatisfactionDetailTable } from "@/components/dashboard/SatisfactionDetailTable";
import { SmallSampleWarning } from "@/components/dashboard/SmallSampleWarning";
import { StackedDistributionCard } from "@/components/dashboard/StackedDistributionCard";
import { SurveyRecordsLink } from "@/components/dashboard/SurveyRecordsLink";
import type { DashboardViewModel, DistributionItem } from "@/types/dashboard";

function formatPercent(value: number | null): string {
  return value === null ? "ยังไม่มีข้อมูล" : `${Math.round(value * 100)}%`;
}

type SatisfactionDimension = {
  label: string;
  value: number | null;
  responseCount: number;
};

export function SatisfactionSection({ data }: { data: DashboardViewModel }) {
  const dimensions: SatisfactionDimension[] = [
    { label: "ความปลอดภัย", value: data.satisfaction.safetyAverage, responseCount: data.satisfaction.safetyResponseCount },
    { label: "ความสะอาด", value: data.satisfaction.cleanlinessAverage, responseCount: data.satisfaction.cleanlinessResponseCount },
    { label: "การเข้าถึง", value: data.satisfaction.accessibilityAverage, responseCount: data.satisfaction.accessibilityResponseCount },
    { label: "ข้อมูลและป้ายแนะนำ", value: data.satisfaction.informationAverage, responseCount: data.satisfaction.informationResponseCount },
    { label: "ความคุ้มค่า", value: data.satisfaction.valueAverage, responseCount: data.satisfaction.valueResponseCount },
  ];
  const chartDimensions: DistributionItem[] = dimensions
    .filter((dimension): dimension is SatisfactionDimension & { value: number } => dimension.value !== null)
    .map((dimension) => ({ label: dimension.label, value: dimension.value, percent: dimension.value / 5, note: `${dimension.responseCount.toLocaleString("th-TH")} คำตอบ` }));
  const weakestDimension = chartDimensions.reduce<DistributionItem | null>((current, item) => (
    current === null || item.value < current.value ? item : current
  ), null);
  const byAttraction = data.satisfaction.byAttraction
    .filter((item) => item.averageSatisfaction !== null)
    .map((item) => ({ label: item.attractionName, value: item.averageSatisfaction as number, percent: (item.averageSatisfaction as number) / 5, note: `${item.surveyResponseCount.toLocaleString("th-TH")} คำตอบ` }));

  return (
    <section aria-labelledby="satisfaction-heading" className="space-y-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-950" id="satisfaction-heading">ความพึงพอใจของนักท่องเที่ยว</h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">สรุปเฉพาะแบบสำรวจที่สมัครใจ พร้อมฐานคำตอบของแต่ละตัวชี้วัด</p>
        </div>
        <div className="flex flex-wrap gap-2"><SurveyRecordsLink data={data} /><ExportCsvButton /></div>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <KpiCard metric={{ key: "satisfaction_avg", label: "คะแนนเฉลี่ยโดยรวม", value: data.satisfaction.averageOverall === null ? "ยังไม่มีข้อมูล" : `${data.satisfaction.averageOverall.toFixed(1)} / 5`, rawValue: data.satisfaction.averageOverall, valueType: "rating", definition: "คะแนนความพึงพอใจโดยรวมเฉลี่ยจากคำตอบที่มีข้อมูล", note: `จากผู้ตอบ ${data.satisfaction.responseCount.toLocaleString("th-TH")} รายการ` }} sampleCount={data.satisfaction.responseCount} sampleLabel="คำตอบความพึงพอใจ" />
        <KpiCard metric={{ key: "revisit_rate", label: "ตั้งใจกลับมาเที่ยวซ้ำ", value: formatPercent(data.satisfaction.revisitIntentionRate), rawValue: data.satisfaction.revisitIntentionRate, valueType: "percentage", definition: "สัดส่วนผู้ตอบที่ระบุว่าตั้งใจกลับมาเที่ยวซ้ำ" }} sampleCount={data.satisfaction.revisitAnsweredCount} sampleLabel="คำตอบความตั้งใจกลับมา" />
        <KpiCard metric={{ key: "recommend_rate", label: "ตั้งใจแนะนำต่อ", value: formatPercent(data.satisfaction.recommendIntentionRate), rawValue: data.satisfaction.recommendIntentionRate, valueType: "percentage", definition: "สัดส่วนผู้ตอบที่ระบุว่าจะแนะนำสถานที่ให้ผู้อื่น" }} sampleCount={data.satisfaction.recommendAnsweredCount} sampleLabel="คำตอบความตั้งใจแนะนำ" />
      </div>

      <div className="grid min-w-0 gap-4 xl:grid-cols-12">
        <div aria-label="หลักฐานความพึงพอใจ" className="min-w-0 xl:col-span-8" role="region">
          <BarChartCard data={chartDimensions} definition="คะแนนเฉลี่ยรายด้านจาก 1 ถึง 5 คำนวณเฉพาะคำตอบที่มีข้อมูล" emptyDescription="ยังไม่มีคะแนนความพึงพอใจรายด้าน" title="คุณภาพประสบการณ์รายด้าน" sampleCount={data.satisfaction.responseCount} sampleLabel="คำตอบความพึงพอใจ" />
        </div>

        <aside aria-label="การตีความประสบการณ์" className="min-w-0 rounded-md border border-slate-200 bg-white p-4 xl:col-span-4" role="region">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#FFF0EA] text-[#B94727]"><Star aria-hidden="true" size={20} weight="fill" /></span>
            <div><h3 className="font-bold text-slate-900">ประเด็นที่ควรตรวจสอบ</h3><p className="mt-1 text-sm leading-6 text-slate-600">ใช้คะแนนร่วมกับจำนวนคำตอบและบริบทของสถานที่ก่อนกำหนดแนวทาง</p></div>
          </div>

          <dl className="mt-4 divide-y divide-slate-100 border-y border-slate-100">
            <div className="grid grid-cols-[32px_1fr] gap-3 py-3">
              <ChartBar aria-hidden="true" className="mt-0.5 text-[#B94727]" size={20} />
              <div><dt className="text-xs font-semibold text-slate-600">มิติที่ได้คะแนนต่ำสุด</dt><dd className="mt-1 font-bold text-slate-900">{weakestDimension ? `${weakestDimension.label} ${weakestDimension.value.toFixed(1)} / 5` : "ยังไม่มีข้อมูล"}</dd></div>
            </div>
            <div className="grid grid-cols-[32px_1fr] gap-3 py-3">
              <ArrowClockwise aria-hidden="true" className="mt-0.5 text-[#0A6B62]" size={20} />
              <div><dt className="text-xs font-semibold text-slate-600">ตั้งใจกลับมาเที่ยวซ้ำ</dt><dd className="mt-1 font-bold text-slate-900">{formatPercent(data.satisfaction.revisitIntentionRate)} <span className="text-xs font-normal text-slate-600">จาก {data.satisfaction.revisitAnsweredCount.toLocaleString("th-TH")} คำตอบ</span></dd></div>
            </div>
            <div className="grid grid-cols-[32px_1fr] gap-3 py-3">
              <UsersThree aria-hidden="true" className="mt-0.5 text-[#0A6B62]" size={20} />
              <div><dt className="text-xs font-semibold text-slate-600">ตั้งใจแนะนำต่อ</dt><dd className="mt-1 font-bold text-slate-900">{formatPercent(data.satisfaction.recommendIntentionRate)} <span className="text-xs font-normal text-slate-600">จาก {data.satisfaction.recommendAnsweredCount.toLocaleString("th-TH")} คำตอบ</span></dd></div>
            </div>
          </dl>
          {data.satisfaction.responseCount < 30 ? <div className="mt-4"><SmallSampleWarning count={data.satisfaction.responseCount} label="คำตอบความพึงพอใจ" /></div> : null}
        </aside>
      </div>

      <div className="grid min-w-0 gap-4 xl:grid-cols-2">
        <StackedDistributionCard data={data.satisfaction.distribution} definition="สัดส่วนการให้คะแนนความพึงพอใจโดยรวมในแต่ละระดับ" emptyDescription="ยังไม่มีการกระจายคะแนนความพึงพอใจ" title="การกระจายคะแนนโดยรวม" />
        <BarChartCard data={byAttraction} definition="คะแนนเฉลี่ยแยกตามสถานที่ ควรพิจารณาควบคู่กับจำนวนผู้ตอบ" emptyDescription="ยังไม่มีคะแนนที่แยกตามสถานที่" title="ความพึงพอใจแยกตามสถานที่" sampleCount={data.satisfaction.responseCount} sampleLabel="คำตอบความพึงพอใจ" />
      </div>

      <SatisfactionDetailTable
        byAttraction={data.satisfaction.byAttraction}
        dimensionResponseCounts={{
          safety: data.satisfaction.safetyResponseCount,
          cleanliness: data.satisfaction.cleanlinessResponseCount,
          accessibility: data.satisfaction.accessibilityResponseCount,
          information: data.satisfaction.informationResponseCount,
          value: data.satisfaction.valueResponseCount,
          facility: data.satisfaction.facilityResponseCount,
        }}
        dimensionScores={{
          safetyAverage: data.satisfaction.safetyAverage,
          cleanlinessAverage: data.satisfaction.cleanlinessAverage,
          accessibilityAverage: data.satisfaction.accessibilityAverage,
          informationAverage: data.satisfaction.informationAverage,
          valueAverage: data.satisfaction.valueAverage,
          facilityAverage: data.satisfaction.facilityAverage,
        }}
        overallAverage={data.satisfaction.averageOverall}
      />
    </section>
  );
}
