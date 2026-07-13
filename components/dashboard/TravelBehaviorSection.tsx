import { BarChartCard } from "@/components/dashboard/BarChartCard";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { StackedDistributionCard } from "@/components/dashboard/StackedDistributionCard";
import type { DashboardViewModel } from "@/types/dashboard";

export function TravelBehaviorSection({ data }: { data: DashboardViewModel }) {
  return (
    <section className="space-y-5" aria-labelledby="travel-behavior-heading">
      <div>
        <h2 id="travel-behavior-heading" className="text-lg font-bold text-slate-900">พฤติกรรมการเดินทาง</h2>
        <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">ข้อมูลจากรายการเข้าชมและแบบสำรวจที่สมัครใจ ช่องที่ไม่ตอบจะไม่นำไปคำนวณเป็นศูนย์</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard metric={{ key: "average_group_size", label: "ขนาดกลุ่มเฉลี่ย", value: data.travelBehavior.averageGroupSize === null ? "No data" : `${data.travelBehavior.averageGroupSize.toFixed(1)} คน`, rawValue: data.travelBehavior.averageGroupSize, valueType: "text", definition: "ค่าเฉลี่ยจากคำตอบขนาดกลุ่มที่มีข้อมูลเท่านั้น", note: `มีคำตอบ ${data.travelBehavior.answeredGroupSizeCount.toLocaleString("th-TH")} รายการ` }} sampleCount={data.travelBehavior.answeredGroupSizeCount} sampleLabel="คำตอบขนาดกลุ่ม" />
        <KpiCard metric={{ key: "average_nights", label: "จำนวนคืนเฉลี่ย", value: data.travelBehavior.averageNights === null ? "No data" : `${data.travelBehavior.averageNights.toFixed(1)} คืน`, rawValue: data.travelBehavior.averageNights, valueType: "text", definition: "ค่าเฉลี่ยจากคำตอบจำนวนคืนที่มีข้อมูลเท่านั้น", note: `มีคำตอบ ${data.travelBehavior.answeredNightsCount.toLocaleString("th-TH")} รายการ` }} sampleCount={data.travelBehavior.answeredNightsCount} sampleLabel="คำตอบจำนวนคืน" />
      </div>

      <div className="grid min-w-0 gap-4 xl:grid-cols-2">
        <BarChartCard data={data.travelBehavior.companionTypes} definition="รูปแบบผู้ร่วมเดินทางจากแบบสำรวจที่สมัครใจ" emptyDescription="ยังไม่มีข้อมูลผู้ร่วมเดินทาง" title="ผู้ร่วมเดินทาง" />
        <BarChartCard data={data.travelBehavior.transportModes} definition="พาหนะหลักที่ผู้ตอบแบบสำรวจเลือก" emptyDescription="ยังไม่มีข้อมูลพาหนะ" title="พาหนะที่ใช้เดินทาง" />
        <BarChartCard data={data.travelBehavior.travelPurposes} definition="วัตถุประสงค์การเดินทางจากแบบสำรวจที่สมัครใจ" emptyDescription="ยังไม่มีข้อมูลวัตถุประสงค์การเดินทาง" title="วัตถุประสงค์การเดินทาง" />
        <StackedDistributionCard data={data.travelBehavior.overnightStatus} definition="เปรียบเทียบการท่องเที่ยวแบบไปกลับและค้างคืน ช่องที่ไม่ตอบจะไม่ถูกรวมเป็นศูนย์" emptyDescription="ยังไม่มีข้อมูลการค้างคืน" title="การค้างคืน" />
      </div>
    </section>
  );
}
