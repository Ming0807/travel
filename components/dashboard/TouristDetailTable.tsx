import { localizeDashboardLabel } from "@/components/dashboard/dashboard-localization";
import type { DistributionItem } from "@/types/dashboard";

function formatCount(value: number): string {
  return value.toLocaleString("th-TH");
}

function formatPercent(value: number | null): string {
  return value === null ? "ยังไม่มีฐานคำนวณ" : `${(value * 100).toFixed(1)}%`;
}

function DetailSection({
  title,
  items,
  emptyMessage,
}: {
  title: string;
  items: DistributionItem[];
  emptyMessage: string;
}) {
  return (
    <section className="min-w-0" aria-label={title}>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <h3 className="text-sm font-bold text-slate-800">{title}</h3>
        <span className="text-xs text-slate-500">{items.length.toLocaleString("th-TH")} รายการ</span>
      </div>
      {items.length === 0 ? (
        <p className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">{emptyMessage}</p>
      ) : (
        <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
          <table className="w-full min-w-96 text-sm">
            <caption className="sr-only">รายละเอียด{title}</caption>
            <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs text-slate-600">
              <tr>
                <th className="px-3 py-2.5 font-semibold">รายการ</th>
                <th className="px-3 py-2.5 text-right font-semibold">จำนวน</th>
                <th className="px-3 py-2.5 text-right font-semibold">สัดส่วน</th>
              </tr>
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

type TouristDetailTableProps = {
  originCountries: DistributionItem[];
  originProvinces: DistributionItem[];
  ageGroups: DistributionItem[];
  preferredLanguages: DistributionItem[];
  identityProviders: DistributionItem[];
};

export function TouristDetailTable({
  originCountries,
  originProvinces,
  ageGroups,
  preferredLanguages,
  identityProviders,
}: TouristDetailTableProps) {
  return (
    <section className="border-t border-slate-200 pt-5" aria-labelledby="tourist-detail-table-heading">
      <h2 id="tourist-detail-table-heading" className="text-base font-bold text-slate-900">ตารางรายละเอียดลักษณะนักท่องเที่ยว</h2>
      <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">ใช้ตรวจสอบค่าที่แสดงในกราฟแบบรวม โดยไม่แสดงชื่อ ข้อมูลติดต่อ หรือรหัสบัญชีของนักท่องเที่ยว</p>
      <div className="mt-4 grid min-w-0 grid-cols-[minmax(0,1fr)] gap-5 xl:grid-cols-2">
        <DetailSection title="ประเทศต้นทาง" items={originCountries} emptyMessage="ยังไม่มีข้อมูลประเทศต้นทาง" />
        <DetailSection title="จังหวัดต้นทางในประเทศไทย" items={originProvinces} emptyMessage="ยังไม่มีข้อมูลจังหวัดต้นทางในประเทศไทย" />
        <DetailSection title="ช่วงอายุ" items={ageGroups} emptyMessage="ยังไม่มีข้อมูลช่วงอายุ" />
        <DetailSection title="ภาษาที่ต้องการ" items={preferredLanguages} emptyMessage="ยังไม่มีข้อมูลภาษาที่ต้องการ" />
        <div className="xl:col-span-2">
          <DetailSection title="วิธีเข้าใช้งาน" items={identityProviders} emptyMessage="ยังไม่มีข้อมูลวิธีเข้าใช้งาน" />
        </div>
      </div>
    </section>
  );
}
