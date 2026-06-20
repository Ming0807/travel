import type { DashboardViewModel } from "@/types/dashboard";
import { BarChartCard } from "@/components/dashboard/BarChartCard";
import { ExportCsvButton } from "@/components/dashboard/ExportCsvButton";
import { WarningCircle, Star, MapPin, Users, Ticket } from "@phosphor-icons/react/dist/ssr";
import { NoDataState } from "@/components/dashboard/NoDataState";

export function AttractionPerformanceSection({ data }: { data: DashboardViewModel }) {
  const topAttractions = data.executive.topAttractions;
  const hasAttractions = topAttractions.length > 0;

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#073F37]">
            ประสิทธิภาพของสถานที่ท่องเที่ยว
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            ข้อมูลประสิทธิภาพของแต่ละสถานที่ท่องเที่ยว อ้างอิงจากการเช็คอิน การออกเกียรติบัตร และแบบสอบถาม
          </p>
        </div>
        <ExportCsvButton />
      </div>

      {/* Low sample warning */}
      {hasAttractions && topAttractions.reduce((sum, a) => sum + a.visitCount, 0) < 50 && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200/70 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
          <WarningCircle size={20} weight="fill" className="mt-0.5 shrink-0 text-amber-500" />
          <div>
            <strong className="font-black">กลุ่มตัวอย่างขนาดเล็ก:</strong> จำนวนการเข้าชมรวมยังมีน้อยมาก ค่าเฉลี่ยและอันดับอาจจะยังไม่มีนัยสำคัญทางสถิติ
          </div>
        </div>
      )}

      {/* Top Attractions Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
          <h3 className="font-semibold text-slate-900 dark:text-white">สถานที่ท่องเที่ยวยอดนิยมตามจำนวนการเข้าชม</h3>
        </div>
        {hasAttractions ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/50 text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-medium">อันดับ</th>
                  <th className="px-4 py-3 font-medium">ชื่อสถานที่</th>
                  <th className="px-4 py-3 font-medium">จังหวัด</th>
                  <th className="px-4 py-3 font-medium text-right">การเข้าชม</th>
                  <th className="px-4 py-3 font-medium text-right">เกียรติบัตร</th>
                  <th className="px-4 py-3 font-medium text-right">ความพึงพอใจเฉลี่ย</th>
                  <th className="px-4 py-3 font-medium text-right">จำนวนแบบสอบถาม</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {topAttractions.map((attraction, i) => (
                  <tr key={attraction.attractionName + i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {attraction.rank}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                      {attraction.attractionName}
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1">
                        <MapPin size={14} weight="fill" />
                        {attraction.provinceName}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5 font-semibold text-[#073F37] dark:text-[#0C6A5D]">
                        <Users size={14} />
                        {attraction.visitCount.toLocaleString("th-TH")}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5 text-slate-600 dark:text-slate-300">
                        <Ticket size={14} />
                        {attraction.certificateCount.toLocaleString("th-TH")}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {attraction.averageSatisfaction !== null ? (
                        <div className="flex items-center justify-end gap-1 text-amber-500">
                          <Star size={14} weight="fill" />
                          <span className="font-medium text-slate-900 dark:text-white">{attraction.averageSatisfaction.toFixed(1)}</span>
                          <span className="text-xs text-slate-400">/ 5</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-500 dark:text-slate-400">
                      {attraction.surveyResponseCount > 0 ? (
                        attraction.surveyResponseCount.toLocaleString("th-TH")
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8">
            <NoDataState title="ไม่มีข้อมูลสถานที่ท่องเที่ยว" description="ไม่พบการเข้าชมหรือแบบสอบถามสำหรับสถานที่ท่องเที่ยวที่ตรงกับตัวกรองของคุณ" />
          </div>
        )}
      </div>

      {/* Charts */}
      <div className="grid gap-5 xl:grid-cols-2">
        <BarChartCard
          data={data.satisfaction.byAttraction.map(a => ({ label: a.attractionName, value: a.averageSatisfaction ?? 0, percent: (a.averageSatisfaction ?? 0) / 5 * 100 }))}
          definition="คะแนนความพึงพอใจเฉลี่ยของแต่ละสถานที่จากแบบสอบถาม ช่วยในการประเมินประสิทธิภาพ"
          emptyDescription="ไม่มีข้อมูลความพึงพอใจแยกตามสถานที่สำหรับตัวกรองที่เลือก"
          title="ความพึงพอใจแยกตามสถานที่ท่องเที่ยว"
        />
      </div>
    </section>
  );
}
