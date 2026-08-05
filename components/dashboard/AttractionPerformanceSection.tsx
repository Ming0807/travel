import { BarChartCard } from "@/components/dashboard/BarChartCard";
import { AnalyticsSectionHeader } from "@/components/dashboard/AnalyticsSectionHeader";
import { NoDataState } from "@/components/dashboard/NoDataState";
import type { DashboardViewModel, RankedAttraction } from "@/types/dashboard";

function formatCount(value: number): string {
  return value.toLocaleString("th-TH");
}

function kpiDivider(index: number): string {
  if (index === 0) return "";
  if (index === 1) return "border-t border-slate-200 sm:border-l sm:border-t-0";
  if (index === 2) return "border-t border-slate-200 xl:border-l xl:border-t-0";
  return "border-t border-slate-200 sm:border-l xl:border-t-0";
}

function ConcentrationContext({ attractions, visitCount }: { attractions: RankedAttraction[]; visitCount: number }) {
  const leader = attractions.reduce<RankedAttraction | null>((current, item) => {
    if (current === null || item.visitCount > current.visitCount) return item;
    return current;
  }, null);
  const leaderShare = leader !== null && visitCount > 0 ? leader.visitCount / visitCount : null;

  return (
    <section className="h-full rounded-md border border-slate-200 bg-white p-4 shadow-[0_4px_8px_rgba(15,23,42,0.05)]">
      <h2 className="text-base font-bold text-slate-900">การกระจายการเข้าชม</h2>
      <p className="mt-1 text-sm leading-6 text-slate-500">ช่วยอ่านว่าสถานที่อันดับหนึ่งมีน้ำหนักเท่าใดในชุดอันดับที่กำลังแสดง</p>
      {leader === null || leaderShare === null ? (
        <p className="mt-4 rounded-md border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">ยังไม่มีข้อมูลเพียงพอสำหรับอธิบายการกระจายการเข้าชม</p>
      ) : (
        <div className="mt-5">
          <p className="text-xs font-semibold text-slate-600">สถานที่อันดับหนึ่ง</p>
          <p className="mt-1 break-words text-lg font-black text-slate-900">{leader.attractionName}</p>
          <p className="mt-3 text-3xl font-black tabular-nums text-[#B94727]">{(leaderShare * 100).toFixed(1)}%</p>
          <p className="mt-1 text-sm text-slate-600">{(leaderShare * 100).toFixed(1)}% ของการเข้าชมในอันดับที่แสดง</p>
          <div className="mt-4 h-2 overflow-hidden rounded-sm bg-slate-100" role="img" aria-label={`${leader.attractionName} คิดเป็น ${(leaderShare * 100).toFixed(1)}% ของการเข้าชมในอันดับที่แสดง`}>
            <div className="h-full rounded-sm bg-[#B94727]" style={{ width: `${Math.min(leaderShare * 100, 100)}%` }} />
          </div>
        </div>
      )}
      <p className="mt-5 border-t border-slate-100 pt-3 text-xs leading-5 text-slate-500">สัดส่วนนี้อ้างอิงเฉพาะสถานที่ในอันดับที่ระบบส่งมา ควรอ่านร่วมกับจำนวนผู้ตอบและความพึงพอใจก่อนตัดสินใจส่งเสริมหรือปรับปรุง</p>
    </section>
  );
}

export function AttractionPerformanceSection({ data }: { data: DashboardViewModel }) {
  const attractions = data.executive.topAttractions;
  const visits = attractions.reduce((sum, item) => sum + item.visitCount, 0);
  const certificates = attractions.reduce((sum, item) => sum + item.certificateCount, 0);
  const responses = attractions.reduce((sum, item) => sum + item.surveyResponseCount, 0);
  const ranking = attractions.map((item) => ({ label: item.attractionName, value: item.visitCount, percent: visits > 0 ? item.visitCount / visits : null }));
  const kpis = [
    ["การเข้าชมในอันดับ", visits],
    ["ใบประกาศที่สร้าง", certificates],
    ["คำตอบแบบสำรวจ", responses],
    ["สถานที่ที่มีข้อมูล", attractions.length],
  ] as const;

  return (
    <section className="space-y-5" aria-labelledby="attraction-performance-heading">
      <AnalyticsSectionHeader
        description="เปรียบเทียบการเข้าชม ใบประกาศ และเสียงตอบรับ เพื่อพิจารณาการกระจายความสนใจโดยไม่สรุปเกินฐานข้อมูลที่มี"
        headingId="attraction-performance-heading"
        title="ผลงานสถานที่ท่องเที่ยว"
      />

      <dl role="group" aria-label="ตัวชี้วัดผลงานสถานที่" className="grid overflow-hidden rounded-md border border-slate-200 bg-white sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map(([label, value], index) => (
          <div key={label} className={`min-w-0 p-3.5 ${kpiDivider(index)}`}>
            <dt className="text-xs font-semibold text-slate-600">{label}</dt>
            <dd className="mt-1 text-xl font-black tabular-nums text-slate-900">{formatCount(value)}</dd>
          </div>
        ))}
      </dl>

      <div className="grid min-w-0 gap-4 xl:grid-cols-12">
        <div role="region" aria-label="หลักฐานอันดับสถานที่" className="min-w-0 xl:col-span-8">
          <BarChartCard data={ranking} definition="อันดับตามจำนวนรายการเข้าชมที่บันทึกสำเร็จภายใต้ตัวกรองที่เลือก" emptyDescription="ยังไม่มีข้อมูลการเข้าชมสถานที่" title="อันดับการเข้าชมสถานที่" sampleCount={visits} sampleLabel="รายการเข้าชม" />
        </div>
        <div role="region" aria-label="บริบทการกระจายการเข้าชม" className="min-w-0 xl:col-span-4">
          <ConcentrationContext attractions={attractions} visitCount={visits} />
        </div>
      </div>

      {attractions.length === 0 ? (
        <NoDataState description="ยังไม่มีข้อมูลสถานที่สำหรับช่วงและตัวกรองที่เลือก" />
      ) : (
        <section className="border-t border-slate-200 pt-5" aria-labelledby="attraction-detail-table-heading">
          <h2 id="attraction-detail-table-heading" className="text-base font-bold text-slate-900">ตารางตรวจสอบผลงานรายสถานที่</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">ความพึงพอใจแสดงเฉพาะเมื่อมีคำตอบ และต้องอ่านร่วมกับจำนวนผู้ตอบในคอลัมน์สุดท้าย</p>
          <div className="mt-4 overflow-x-auto rounded-md border border-slate-200 bg-white">
            <table className="w-full min-w-[760px] text-sm">
              <caption className="sr-only">รายละเอียดผลงานรายสถานที่</caption>
              <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs text-slate-600">
                <tr><th className="px-4 py-3">อันดับ</th><th className="px-4 py-3">สถานที่</th><th className="px-4 py-3">จังหวัด</th><th className="px-4 py-3 text-right">การเข้าชม</th><th className="px-4 py-3 text-right">ใบประกาศ</th><th className="px-4 py-3 text-right">ความพึงพอใจ</th><th className="px-4 py-3 text-right">ผู้ตอบ</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attractions.map((item) => (
                  <tr key={`${item.rank}-${item.attractionName}`}>
                    <td className="px-4 py-3 font-bold tabular-nums">{item.rank}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{item.attractionName}</td>
                    <td className="px-4 py-3 text-slate-600">{item.provinceName}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatCount(item.visitCount)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatCount(item.certificateCount)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{item.averageSatisfaction === null ? "ยังไม่มีข้อมูล" : `${item.averageSatisfaction.toFixed(1)} / 5`}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatCount(item.surveyResponseCount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </section>
  );
}
