import { localizeDashboardLabel } from "@/components/dashboard/dashboard-localization";
import type { DistributionItem } from "@/types/dashboard";

function formatCount(value: number): string {
  return value.toLocaleString("th-TH");
}

function formatPercent(value: number | null): string {
  return value === null ? "ยังไม่มีฐานคำนวณ" : `${(value * 100).toFixed(1)}%`;
}

function BehaviorDetailSection({
  title,
  description,
  items,
  emptyMessage,
}: {
  title: string;
  description: string;
  items: DistributionItem[];
  emptyMessage: string;
}) {
  return (
    <section className="min-w-0" aria-label={title}>
      <h3 className="text-sm font-bold text-slate-800">{title}</h3>
      <p className="mt-1 min-h-10 text-xs leading-5 text-slate-500">{description}</p>
      {items.length === 0 ? (
        <p className="mt-2 rounded-md border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">{emptyMessage}</p>
      ) : (
        <div className="mt-2 overflow-x-auto rounded-md border border-slate-200 bg-white">
          <table className="w-full min-w-96 text-sm">
            <caption className="sr-only">รายละเอียด{title}</caption>
            <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs text-slate-600">
              <tr><th className="px-3 py-2.5 font-semibold">รายการ</th><th className="px-3 py-2.5 text-right font-semibold">จำนวน</th><th className="px-3 py-2.5 text-right font-semibold">สัดส่วน</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.slice(0, 15).map((item) => (
                <tr key={item.label}>
                  <td className="px-3 py-2.5 font-medium text-slate-800">{localizeDashboardLabel(item.label)}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-slate-900">{formatCount(item.value)}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-slate-600">{formatPercent(item.percent)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {items.length > 15 ? <p className="border-t border-slate-100 px-3 py-2 text-xs text-slate-500">แสดง 15 อันดับแรกจากทั้งหมด {items.length.toLocaleString("th-TH")} รายการ</p> : null}
        </div>
      )}
    </section>
  );
}

type TravelBehaviorDetailTableProps = {
  companionTypes: DistributionItem[];
  transportModes: DistributionItem[];
  travelPurposes: DistributionItem[];
  overnightStatus: DistributionItem[];
  averageGroupSize: number | null;
  averageNights: number | null;
  answeredGroupSizeCount: number;
  answeredNightsCount: number;
};

export function TravelBehaviorDetailTable({
  companionTypes,
  transportModes,
  travelPurposes,
  overnightStatus,
  averageGroupSize,
  averageNights,
  answeredGroupSizeCount,
  answeredNightsCount,
}: TravelBehaviorDetailTableProps) {
  return (
    <section className="border-t border-slate-200 pt-5" aria-labelledby="travel-detail-table-heading">
      <h2 id="travel-detail-table-heading" className="text-base font-bold text-slate-900">ตารางรายละเอียดพฤติกรรมการเดินทาง</h2>
      <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">ข้อมูลมาจากคำตอบแบบสำรวจที่สมัครใจ ค่าเฉลี่ยไม่รวมช่องที่เว้นว่างและไม่แทนค่าที่หายด้วยศูนย์</p>
      <p className="mt-2 text-xs text-slate-500">ฐานค่าเฉลี่ย: ขนาดกลุ่ม {answeredGroupSizeCount.toLocaleString("th-TH")} คำตอบ{averageGroupSize === null ? " (ยังคำนวณไม่ได้)" : ""} · จำนวนคืน {answeredNightsCount.toLocaleString("th-TH")} คำตอบ{averageNights === null ? " (ยังคำนวณไม่ได้)" : ""}</p>
      <div className="mt-4 grid gap-5 xl:grid-cols-2">
        <BehaviorDetailSection title="พาหนะที่ใช้เดินทาง" description="พาหนะหลักที่ผู้ตอบแบบสำรวจเลือก" items={transportModes} emptyMessage="ยังไม่มีข้อมูลพาหนะที่ใช้เดินทาง" />
        <BehaviorDetailSection title="วัตถุประสงค์การเดินทาง" description="เหตุผลหลักของการเดินทางจากคำตอบที่สมัครใจ" items={travelPurposes} emptyMessage="ยังไม่มีข้อมูลวัตถุประสงค์การเดินทาง" />
        <BehaviorDetailSection title="ผู้ร่วมเดินทาง" description="รูปแบบผู้ร่วมเดินทางจากคำตอบที่สมัครใจ" items={companionTypes} emptyMessage="ยังไม่มีข้อมูลผู้ร่วมเดินทาง" />
        <BehaviorDetailSection title="การค้างคืน" description="เปรียบเทียบการเดินทางแบบไปกลับและค้างคืน" items={overnightStatus} emptyMessage="ยังไม่มีข้อมูลการค้างคืน" />
      </div>
    </section>
  );
}
