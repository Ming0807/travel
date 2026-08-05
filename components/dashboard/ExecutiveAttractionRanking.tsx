import { MapPin, Star } from "@phosphor-icons/react/dist/ssr";
import { NoDataState } from "@/components/dashboard/NoDataState";
import type { DashboardViewModel } from "@/types/dashboard";

type RankedAttraction = DashboardViewModel["executive"]["topAttractions"][number];

function satisfactionLabel(value: number | null): string {
  return value === null ? "ยังไม่มีข้อมูล" : value.toFixed(1);
}

export function ExecutiveAttractionRanking({
  attractions,
}: {
  attractions: DashboardViewModel["executive"]["topAttractions"];
}) {
  const visible = attractions.slice(0, 6);

  return (
    <section
      aria-labelledby="executive-attraction-ranking-heading"
      className="h-full min-w-0 rounded-md border border-slate-200 bg-white shadow-[0_4px_8px_rgba(15,23,42,0.05)]"
    >
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 px-4 py-4 sm:px-5">
        <div>
          <h2 id="executive-attraction-ranking-heading" className="text-base font-bold text-slate-950">
            อันดับสถานที่ท่องเที่ยว
          </h2>
          <p className="mt-1 text-xs leading-5 text-slate-600">
            เรียงตามรายการเข้าชมที่บันทึกสำเร็จในช่วงที่เลือก
          </p>
        </div>
        <span className="rounded-sm bg-slate-100 px-2 py-1 text-xs font-bold tabular-nums text-slate-700">
          {visible.length.toLocaleString("th-TH")} สถานที่
        </span>
      </div>

      {visible.length === 0 ? (
        <div className="p-4 sm:p-5">
          <NoDataState description="ยังไม่มีข้อมูลสถานที่ท่องเที่ยวสำหรับช่วงและตัวกรองที่เลือก" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table
            aria-label="อันดับสถานที่ท่องเที่ยวตามรายการเข้าชม"
            className="w-full min-w-[680px] border-collapse text-sm"
          >
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold text-slate-600">
                <th scope="col" className="w-14 px-4 py-3 text-center">อันดับ</th>
                <th scope="col" className="px-3 py-3">สถานที่</th>
                <th scope="col" className="px-3 py-3 text-right">เข้าชม</th>
                <th scope="col" className="px-3 py-3 text-right">ใบประกาศ</th>
                <th scope="col" className="px-4 py-3 text-right">ความพึงพอใจ</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((attraction, index) => (
                <AttractionRow key={`${attraction.rank}-${attraction.attractionName}`} attraction={attraction} index={index} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function AttractionRow({ attraction, index }: { attraction: RankedAttraction; index: number }) {
  return (
    <tr className="border-b border-slate-100 last:border-b-0 hover:bg-[#FFF9F6]">
      <td className="px-4 py-3 text-center">
        <span
          className={`inline-flex h-7 w-7 items-center justify-center rounded-sm text-xs font-black tabular-nums ${
            index === 0 ? "bg-[#B94727] text-white" : "bg-slate-100 text-slate-700"
          }`}
        >
          {attraction.rank}
        </span>
      </td>
      <th scope="row" className="px-3 py-3 text-left font-normal">
        <span className="block font-bold text-slate-900">{attraction.attractionName}</span>
        <span className="mt-1 flex items-center gap-1 text-xs text-slate-600">
          <MapPin aria-hidden="true" size={13} weight="fill" />
          {attraction.provinceName}
        </span>
      </th>
      <td className="px-3 py-3 text-right font-black tabular-nums text-slate-950">
        {attraction.visitCount.toLocaleString("th-TH")}
      </td>
      <td className="px-3 py-3 text-right font-semibold tabular-nums text-slate-700">
        {attraction.certificateCount.toLocaleString("th-TH")}
      </td>
      <td className="px-4 py-3 text-right">
        {attraction.averageSatisfaction === null ? (
          <span className="text-xs font-semibold text-slate-600">ยังไม่มีข้อมูล</span>
        ) : (
          <div className="inline-flex flex-col items-end">
            <span className="flex items-center gap-1 font-black tabular-nums text-slate-900">
              <Star aria-hidden="true" className="text-[#D6A13D]" size={14} weight="fill" />
              <span>{satisfactionLabel(attraction.averageSatisfaction)}</span>
            </span>
            <span className="text-xs tabular-nums text-slate-600">
              {attraction.surveyResponseCount.toLocaleString("th-TH")} คำตอบ
            </span>
          </div>
        )}
      </td>
    </tr>
  );
}
