import { BarChartCard } from "@/components/dashboard/BarChartCard";
import { AnalyticsSectionHeader } from "@/components/dashboard/AnalyticsSectionHeader";
import { localizeDashboardLabel } from "@/components/dashboard/dashboard-localization";
import { SurveyRecordsLink } from "@/components/dashboard/SurveyRecordsLink";
import { TravelBehaviorDetailTable } from "@/components/dashboard/TravelBehaviorDetailTable";
import type { DashboardViewModel, DistributionItem } from "@/types/dashboard";

const CONTEXT_COLORS = ["#B94727", "#171717", "#D6A13D", "#0A6B62"];

function total(items: DistributionItem[]): number {
  return items.reduce((sum, item) => sum + item.value, 0);
}

function kpiDivider(index: number): string {
  if (index === 0) return "";
  if (index === 1) return "border-t border-slate-200 sm:border-l sm:border-t-0";
  if (index === 2) return "border-t border-slate-200 xl:border-l xl:border-t-0";
  return "border-t border-slate-200 sm:border-l xl:border-t-0";
}

function OvernightContext({ items }: { items: DistributionItem[] }) {
  const positive = items.filter((item) => item.value > 0);
  const visible = positive.slice(0, 4);
  const responseCount = total(positive);

  return (
    <section className="h-full rounded-md border border-slate-200 bg-white p-4 shadow-[0_4px_8px_rgba(15,23,42,0.05)]">
      <h2 className="text-base font-bold text-slate-900">บริบทการค้างคืน</h2>
      <p className="mt-1 text-sm leading-6 text-slate-500">สัดส่วนนี้คำนวณจากผู้ที่ตอบคำถามการค้างคืนเท่านั้น</p>
      {responseCount === 0 ? (
        <p className="mt-4 rounded-md border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">ยังไม่มีข้อมูลการค้างคืน</p>
      ) : (
        <>
          <div className="mt-5 flex h-3 overflow-hidden rounded-sm bg-slate-100" role="img" aria-label="สัดส่วนการค้างคืน">
            {visible.map((item, index) => <span key={item.label} style={{ width: `${(item.value / responseCount) * 100}%`, backgroundColor: CONTEXT_COLORS[index] }} />)}
          </div>
          <ul className="mt-4 space-y-2">
            {visible.map((item, index) => (
              <li key={item.label} className="flex items-center justify-between gap-3 text-sm">
                <span className="flex min-w-0 items-center gap-2 text-slate-700"><span aria-hidden="true" className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: CONTEXT_COLORS[index] }} />{localizeDashboardLabel(item.label)}</span>
                <strong className="shrink-0 tabular-nums text-slate-900">{Math.round((item.value / responseCount) * 100)}%</strong>
              </li>
            ))}
          </ul>
          {positive.length > visible.length ? <p className="mt-3 text-xs text-slate-500">แสดง 4 รูปแบบแรกจากทั้งหมด {positive.length.toLocaleString("th-TH")} รูปแบบ</p> : null}
          <p className="mt-5 border-t border-slate-100 pt-3 text-xs leading-5 text-slate-500">ฐานข้อมูล {responseCount.toLocaleString("th-TH")} คำตอบ ช่องที่ไม่ตอบไม่ถูกรวมเป็นการไปเช้าเย็นกลับ</p>
        </>
      )}
    </section>
  );
}

export function TravelBehaviorSection({ data }: { data: DashboardViewModel }) {
  const behavior = data.travelBehavior;
  const kpis = [
    ["ขนาดกลุ่มเฉลี่ย", behavior.averageGroupSize === null ? "ยังไม่มีข้อมูล" : `${behavior.averageGroupSize.toFixed(1)} คน`],
    ["ฐานคำตอบขนาดกลุ่ม", `${behavior.answeredGroupSizeCount.toLocaleString("th-TH")} รายการ`],
    ["จำนวนคืนเฉลี่ย", behavior.averageNights === null ? "ยังไม่มีข้อมูล" : `${behavior.averageNights.toFixed(1)} คืน`],
    ["ฐานคำตอบจำนวนคืน", `${behavior.answeredNightsCount.toLocaleString("th-TH")} รายการ`],
  ] as const;
  const transportResponses = total(behavior.transportModes);
  const purposeResponses = total(behavior.travelPurposes);
  const companionResponses = total(behavior.companionTypes);

  return (
    <section className="space-y-5" aria-labelledby="travel-behavior-heading">
      <AnalyticsSectionHeader
        actions={<SurveyRecordsLink data={data} />}
        description="อ่านรูปแบบการเดินทางจากแบบสำรวจที่สมัครใจ พร้อมแสดงฐานคำตอบเพื่อไม่ให้ตีความข้อมูลที่เว้นว่างเป็นศูนย์"
        headingId="travel-behavior-heading"
        title="พฤติกรรมการเดินทาง"
      />

      <dl role="group" aria-label="ตัวชี้วัดพฤติกรรมการเดินทาง" className="grid overflow-hidden rounded-md border border-slate-200 bg-white sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map(([label, value], index) => (
          <div key={label} className={`min-w-0 p-3.5 ${kpiDivider(index)}`}>
            <dt className="text-xs font-semibold text-slate-600">{label}</dt>
            <dd className="mt-1 text-xl font-black tabular-nums text-slate-900">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="grid min-w-0 gap-4 xl:grid-cols-12">
        <div role="region" aria-label="หลักฐานรูปแบบการเดินทาง" className="min-w-0 xl:col-span-8">
          <BarChartCard data={behavior.transportModes} definition="พาหนะหลักที่ผู้ตอบแบบสำรวจเลือก ช่องที่ไม่ตอบไม่รวมในฐานคำนวณ" emptyDescription="ยังไม่มีข้อมูลพาหนะที่ใช้เดินทาง" title="พาหนะที่ใช้เดินทาง" sampleCount={transportResponses} sampleLabel="คำตอบพาหนะ" />
        </div>
        <div role="region" aria-label="บริบทการค้างคืน" className="min-w-0 xl:col-span-4">
          <OvernightContext items={behavior.overnightStatus} />
        </div>
      </div>

      <div className="grid min-w-0 gap-4 xl:grid-cols-2">
        <BarChartCard data={behavior.travelPurposes} definition="วัตถุประสงค์หลักจากแบบสำรวจที่สมัครใจ" emptyDescription="ยังไม่มีข้อมูลวัตถุประสงค์การเดินทาง" title="วัตถุประสงค์การเดินทาง" sampleCount={purposeResponses} sampleLabel="คำตอบวัตถุประสงค์" />
        <BarChartCard data={behavior.companionTypes} definition="รูปแบบผู้ร่วมเดินทางจากแบบสำรวจที่สมัครใจ" emptyDescription="ยังไม่มีข้อมูลผู้ร่วมเดินทาง" title="ผู้ร่วมเดินทาง" sampleCount={companionResponses} sampleLabel="คำตอบผู้ร่วมเดินทาง" />
      </div>

      <TravelBehaviorDetailTable {...behavior} />
    </section>
  );
}
