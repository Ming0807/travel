import { BarChartCard } from "@/components/dashboard/BarChartCard";
import { ExportCsvButton } from "@/components/dashboard/ExportCsvButton";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { StackedDistributionCard } from "@/components/dashboard/StackedDistributionCard";
import type { DashboardViewModel, DistributionItem } from "@/types/dashboard";

function percent(value: number | null): string {
  return value === null ? "No data" : `${Math.round(value * 100)}%`;
}

export function SatisfactionSection({ data }: { data: DashboardViewModel }) {
  const dimensions: DistributionItem[] = [
    { label: "ความปลอดภัย", value: data.satisfaction.safetyAverage ?? 0, percent: data.satisfaction.safetyAverage === null ? null : data.satisfaction.safetyAverage / 5 },
    { label: "ความสะอาด", value: data.satisfaction.cleanlinessAverage ?? 0, percent: data.satisfaction.cleanlinessAverage === null ? null : data.satisfaction.cleanlinessAverage / 5 },
    { label: "การเข้าถึง", value: data.satisfaction.accessibilityAverage ?? 0, percent: data.satisfaction.accessibilityAverage === null ? null : data.satisfaction.accessibilityAverage / 5 },
    { label: "ข้อมูลและป้ายแนะนำ", value: data.satisfaction.informationAverage ?? 0, percent: data.satisfaction.informationAverage === null ? null : data.satisfaction.informationAverage / 5 },
    { label: "ความคุ้มค่า", value: data.satisfaction.valueAverage ?? 0, percent: data.satisfaction.valueAverage === null ? null : data.satisfaction.valueAverage / 5 },
  ].filter((item) => item.percent !== null);
  const byAttraction = data.satisfaction.byAttraction.filter((item) => item.averageSatisfaction !== null).map((item) => ({ label: item.attractionName, value: item.averageSatisfaction ?? 0, percent: item.averageSatisfaction === null ? null : item.averageSatisfaction / 5 }));

  return (
    <section className="space-y-5" aria-labelledby="satisfaction-heading">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="satisfaction-heading" className="text-lg font-bold text-slate-900">ความพึงพอใจของนักท่องเที่ยว</h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">คำนวณจากแบบสำรวจที่สมัครใจเท่านั้น คะแนนที่เว้นว่างจะไม่ถูกแทนด้วยศูนย์</p>
        </div>
        <ExportCsvButton />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <KpiCard metric={{ key: "satisfaction_avg", label: "คะแนนเฉลี่ยโดยรวม", value: data.satisfaction.averageOverall === null ? "No data" : `${data.satisfaction.averageOverall.toFixed(1)} / 5`, rawValue: data.satisfaction.averageOverall, valueType: "rating", definition: "คะแนนความพึงพอใจโดยรวมเฉลี่ยจากคำตอบที่มีข้อมูล", note: `จากผู้ตอบ ${data.satisfaction.responseCount.toLocaleString("th-TH")} รายการ` }} sampleCount={data.satisfaction.responseCount} sampleLabel="คำตอบความพึงพอใจ" />
        <KpiCard metric={{ key: "revisit_rate", label: "ตั้งใจกลับมาเที่ยวซ้ำ", value: percent(data.satisfaction.revisitIntentionRate), rawValue: data.satisfaction.revisitIntentionRate, valueType: "percentage", definition: "สัดส่วนผู้ตอบที่ระบุว่าตั้งใจกลับมาเที่ยวซ้ำ" }} sampleCount={data.satisfaction.responseCount} sampleLabel="คำตอบความพึงพอใจ" />
        <KpiCard metric={{ key: "recommend_rate", label: "ตั้งใจแนะนำต่อ", value: percent(data.satisfaction.recommendIntentionRate), rawValue: data.satisfaction.recommendIntentionRate, valueType: "percentage", definition: "สัดส่วนผู้ตอบที่ระบุว่าจะแนะนำสถานที่ให้ผู้อื่น" }} sampleCount={data.satisfaction.responseCount} sampleLabel="คำตอบความพึงพอใจ" />
      </div>

      <div className="grid min-w-0 gap-4 xl:grid-cols-2">
        <BarChartCard data={dimensions} definition="คะแนนเฉลี่ยรายด้านจาก 1 ถึง 5 คะแนน ใช้เพื่อระบุประเด็นที่ควรปรับปรุง" emptyDescription="ยังไม่มีคะแนนความพึงพอใจรายด้าน" title="คะแนนประสบการณ์รายด้าน" sampleCount={data.satisfaction.responseCount} sampleLabel="คำตอบความพึงพอใจ" />
        <StackedDistributionCard data={data.satisfaction.distribution} definition="สัดส่วนการให้คะแนนความพึงพอใจโดยรวมในแต่ละระดับ" emptyDescription="ยังไม่มีการกระจายคะแนนความพึงพอใจ" title="การกระจายคะแนนโดยรวม" />
        <BarChartCard data={byAttraction} definition="คะแนนความพึงพอใจเฉลี่ยแยกตามสถานที่ ควรพิจารณาควบคู่กับจำนวนผู้ตอบ" emptyDescription="ยังไม่มีคะแนนที่แยกตามสถานที่" title="ความพึงพอใจแยกตามสถานที่" sampleCount={data.satisfaction.responseCount} sampleLabel="คำตอบความพึงพอใจ" />
      </div>
    </section>
  );
}
