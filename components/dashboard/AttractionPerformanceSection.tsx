import { BarChartCard } from "@/components/dashboard/BarChartCard";
import { NoDataState } from "@/components/dashboard/NoDataState";
import type { DashboardViewModel } from "@/types/dashboard";

export function AttractionPerformanceSection({ data }: { data: DashboardViewModel }) {
  const attractions = data.executive.topAttractions;
  const visits = attractions.reduce((sum, item) => sum + item.visitCount, 0);
  const certificates = attractions.reduce((sum, item) => sum + item.certificateCount, 0);
  const responses = attractions.reduce((sum, item) => sum + item.surveyResponseCount, 0);
  const ranking = attractions.map((item) => ({ label: item.attractionName, value: item.visitCount, percent: visits > 0 ? item.visitCount / visits : null }));

  return (
    <section className="space-y-5" aria-labelledby="attraction-performance-heading">
      <div>
        <h2 id="attraction-performance-heading" className="text-lg font-bold text-slate-900">ผลงานสถานที่ท่องเที่ยว</h2>
        <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">เปรียบเทียบการเข้าชม ใบประกาศ และเสียงตอบรับ เพื่อเลือกสถานที่ที่ควรส่งเสริมหรือปรับปรุง</p>
      </div>

      <dl className="grid gap-3 sm:grid-cols-3">
        {[["การเข้าชมในอันดับ", visits], ["ใบประกาศที่สร้าง", certificates], ["คำตอบแบบสำรวจ", responses]].map(([label, value]) => (
          <div key={String(label)} className="relative overflow-hidden rounded-md border border-slate-200 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]"><span aria-hidden="true" className="absolute inset-x-0 top-0 h-0.5 bg-[#B94727]" /><dt className="text-xs font-semibold text-slate-600">{label}</dt><dd className="mt-1 text-2xl font-black tabular-nums text-slate-900">{Number(value).toLocaleString("th-TH")}</dd></div>
        ))}
      </dl>

      <BarChartCard data={ranking} definition="อันดับตามจำนวนรายการเข้าชมที่บันทึกสำเร็จภายใต้ตัวกรองที่เลือก" emptyDescription="ยังไม่มีข้อมูลการเข้าชมสถานที่" title="อันดับการเข้าชมสถานที่" />

      {attractions.length === 0 ? <NoDataState description="ยังไม่มีข้อมูลสถานที่สำหรับช่วงและตัวกรองที่เลือก" /> : (
        <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <caption className="px-4 py-3 text-left text-base font-bold text-slate-900">รายละเอียดรายสถานที่</caption>
              <thead className="border-y border-slate-200 bg-slate-50 text-left text-xs text-slate-600"><tr><th className="px-4 py-3">อันดับ</th><th className="px-4 py-3">สถานที่</th><th className="px-4 py-3">จังหวัด</th><th className="px-4 py-3 text-right">การเข้าชม</th><th className="px-4 py-3 text-right">ใบประกาศ</th><th className="px-4 py-3 text-right">ความพึงพอใจ</th><th className="px-4 py-3 text-right">ผู้ตอบ</th></tr></thead>
              <tbody className="divide-y divide-slate-100">{attractions.map((item) => <tr key={`${item.rank}-${item.attractionName}`}><td className="px-4 py-3 font-bold">{item.rank}</td><td className="px-4 py-3 font-semibold text-slate-900">{item.attractionName}</td><td className="px-4 py-3 text-slate-600">{item.provinceName}</td><td className="px-4 py-3 text-right tabular-nums">{item.visitCount.toLocaleString("th-TH")}</td><td className="px-4 py-3 text-right tabular-nums">{item.certificateCount.toLocaleString("th-TH")}</td><td className="px-4 py-3 text-right tabular-nums">{item.averageSatisfaction === null ? "ยังไม่มีข้อมูล" : `${item.averageSatisfaction.toFixed(1)} / 5`}</td><td className="px-4 py-3 text-right tabular-nums">{item.surveyResponseCount.toLocaleString("th-TH")}</td></tr>)}</tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
