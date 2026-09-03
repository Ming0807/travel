import { Bed, ClipboardText, ListChecks, UsersThree } from "@phosphor-icons/react/dist/ssr";
import { AnalyticsMetricGrid } from "@/components/dashboard/AnalyticsMetricGrid";
import { BarChartCard } from "@/components/dashboard/BarChartCard";
import { AnalyticsSectionHeader } from "@/components/dashboard/AnalyticsSectionHeader";
import { DonutChartCard } from "@/components/dashboard/DonutChartCard";
import { SurveyRecordsLink } from "@/components/dashboard/SurveyRecordsLink";
import { TravelBehaviorDetailTable } from "@/components/dashboard/TravelBehaviorDetailTable";
import type { DashboardViewModel, DistributionItem } from "@/types/dashboard";
import { buildDistributionInterpretation } from "@/lib/dashboard/distribution-evidence";

function total(items: DistributionItem[]): number {
  return items.reduce((sum, item) => sum + item.value, 0);
}

export function TravelBehaviorSection({ data }: { data: DashboardViewModel }) {
  const behavior = data.travelBehavior;
  const kpis = [
    { label: "ขนาดกลุ่มเฉลี่ย", value: behavior.averageGroupSize === null ? "ยังไม่มีข้อมูล" : `${behavior.averageGroupSize.toFixed(1)} คน`, icon: <UsersThree aria-hidden="true" size={20} weight="fill" /> },
    { label: "ฐานคำตอบขนาดกลุ่ม", value: `${behavior.answeredGroupSizeCount.toLocaleString("th-TH")} รายการ`, icon: <ClipboardText aria-hidden="true" size={20} weight="fill" /> },
    { label: "จำนวนคืนเฉลี่ย", value: behavior.averageNights === null ? "ยังไม่มีข้อมูล" : `${behavior.averageNights.toFixed(1)} คืน`, icon: <Bed aria-hidden="true" size={20} weight="fill" /> },
    { label: "ฐานคำตอบจำนวนคืน", value: `${behavior.answeredNightsCount.toLocaleString("th-TH")} รายการ`, icon: <ListChecks aria-hidden="true" size={20} weight="fill" /> },
  ];
  const transportResponses = total(behavior.transportModes);
  const purposeResponses = total(behavior.travelPurposes);
  const companionResponses = total(behavior.companionTypes);
  const overnightResponses = total(behavior.overnightStatus);
  const visitMetric = data.kpis.find((metric) => metric.key === "total_visits");
  const denominator = behavior.recordCount ?? (typeof visitMetric?.rawValue === "number" ? visitMetric.rawValue : Math.max(transportResponses, purposeResponses, companionResponses, overnightResponses));

  return (
    <section className="space-y-5" aria-labelledby="travel-behavior-heading">
      <AnalyticsSectionHeader
        actions={<SurveyRecordsLink data={data} />}
        description="อ่านรูปแบบการเดินทางจากแบบสำรวจที่สมัครใจ พร้อมแสดงฐานคำตอบเพื่อไม่ให้ตีความข้อมูลที่เว้นว่างเป็นศูนย์"
        headingId="travel-behavior-heading"
        title="พฤติกรรมการเดินทาง"
      />

      <AnalyticsMetricGrid items={kpis} label="ตัวชี้วัดพฤติกรรมการเดินทาง" />

      <div className="grid min-w-0 gap-4 xl:grid-cols-12">
        <div role="region" aria-label="หลักฐานรูปแบบการเดินทาง" className="min-w-0 xl:col-span-8">
          <BarChartCard data={behavior.transportModes} definition="พาหนะหลักที่ผู้ตอบแบบสำรวจเลือก ช่องที่ไม่ตอบไม่รวมในฐานคำนวณ" emptyDescription="ยังไม่มีข้อมูลพาหนะที่ใช้เดินทาง" title="พาหนะที่ใช้เดินทาง" sampleCount={transportResponses} sampleLabel="คำตอบพาหนะ" denominatorCount={denominator} interpretation={buildDistributionInterpretation(behavior.transportModes, { answeredCount: transportResponses, denominatorCount: denominator })} />
        </div>
        <div role="region" aria-label="บริบทการค้างคืน" className="min-w-0 xl:col-span-4">
          <DonutChartCard
            data={behavior.overnightStatus}
            definition="สัดส่วนสถานะการค้างคืน คำนวณเฉพาะผู้ที่ตอบคำถามนี้"
            emptyDescription="ยังไม่มีข้อมูลการค้างคืน"
            footerNote={`ฐานข้อมูล ${overnightResponses.toLocaleString("th-TH")} คำตอบ ช่องที่ไม่ตอบไม่ถูกรวมเป็นการไปเช้าเย็นกลับ`}
            sampleCount={overnightResponses}
            denominatorCount={denominator}
            interpretation={buildDistributionInterpretation(behavior.overnightStatus, { answeredCount: overnightResponses, denominatorCount: denominator })}
            sampleLabel="คำตอบการค้างคืน"
            title="บริบทการค้างคืน"
          />
        </div>
      </div>

      <div className="grid min-w-0 gap-4 xl:grid-cols-2">
        <BarChartCard data={behavior.travelPurposes} definition="วัตถุประสงค์หลักจากแบบสำรวจที่สมัครใจ" emptyDescription="ยังไม่มีข้อมูลวัตถุประสงค์การเดินทาง" title="วัตถุประสงค์การเดินทาง" sampleCount={purposeResponses} sampleLabel="คำตอบวัตถุประสงค์" denominatorCount={denominator} interpretation={buildDistributionInterpretation(behavior.travelPurposes, { answeredCount: purposeResponses, denominatorCount: denominator })} />
        <BarChartCard data={behavior.companionTypes} definition="รูปแบบผู้ร่วมเดินทางจากแบบสำรวจที่สมัครใจ" emptyDescription="ยังไม่มีข้อมูลผู้ร่วมเดินทาง" title="ผู้ร่วมเดินทาง" sampleCount={companionResponses} sampleLabel="คำตอบผู้ร่วมเดินทาง" denominatorCount={denominator} interpretation={buildDistributionInterpretation(behavior.companionTypes, { answeredCount: companionResponses, denominatorCount: denominator })} />
      </div>

      <TravelBehaviorDetailTable {...behavior} />
    </section>
  );
}
