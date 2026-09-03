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
  const visible = attractions.slice(0, 5);
  const maxVisits = Math.max(...visible.map((attraction) => attraction.visitCount), 0);

  return (
    <section
      aria-labelledby="executive-attraction-ranking-heading"
      className="h-full min-w-0 overflow-hidden rounded-md border border-slate-200 bg-white"
    >
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 px-4 py-3.5 sm:px-5">
        <div>
          <h2 id="executive-attraction-ranking-heading" className="text-lg font-black text-slate-950">
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
        <div>
          <table
            aria-label="อันดับสถานที่ท่องเที่ยวตามรายการเข้าชม"
            className="w-full table-fixed border-collapse text-sm"
          >
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold text-slate-600">
                <th scope="col" className="w-12 px-3 py-2.5 text-center">อันดับ</th>
                <th scope="col" className="px-2 py-2.5">สถานที่</th>
                <th scope="col" className="w-28 px-2 py-2.5 text-right sm:w-36">เข้าชม</th>
                <th scope="col" className="hidden w-24 px-2 py-2.5 text-right sm:table-cell">ใบประกาศ</th>
                <th scope="col" className="hidden w-28 px-4 py-2.5 text-right lg:table-cell">ความพึงพอใจ</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((attraction, index) => (
                <AttractionRow
                  key={`${attraction.rank}-${attraction.attractionName}`}
                  attraction={attraction}
                  index={index}
                  maxVisits={maxVisits}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function AttractionRow({ attraction, index, maxVisits }: { attraction: RankedAttraction; index: number; maxVisits: number }) {
  const visitWidth = maxVisits > 0 ? (attraction.visitCount / maxVisits) * 100 : 0;

  return (
    <tr className="border-b border-slate-100 last:border-b-0 hover:bg-[#FFF9F6]">
      <td className="px-3 py-2.5 text-center">
        <span
          className={`inline-flex h-7 w-7 items-center justify-center rounded-sm text-xs font-black tabular-nums ${
            index === 0 ? "bg-[#B94727] text-white" : "border border-slate-200 bg-white text-slate-700"
          }`}
        >
          {attraction.rank}
        </span>
      </td>
      <th scope="row" className="px-2 py-2.5 text-left font-normal">
        <span className="block truncate font-bold text-slate-900" title={attraction.attractionName}>{attraction.attractionName}</span>
        <span className="mt-0.5 flex items-center gap-1 text-xs text-slate-600">
          <MapPin aria-hidden="true" size={13} weight="fill" />
          {attraction.provinceName}
        </span>
      </th>
      <td className="px-2 py-2.5 text-right">
        <strong className="font-black tabular-nums text-slate-950">{attraction.visitCount.toLocaleString("th-TH")}</strong>
        <span className="mt-1 block h-1 overflow-hidden rounded-sm bg-slate-100" aria-hidden="true">
          <span className="block h-full rounded-sm bg-[#B94727]" style={{ width: `${visitWidth}%` }} />
        </span>
      </td>
      <td className="hidden px-2 py-2.5 text-right font-semibold tabular-nums text-slate-700 sm:table-cell">
        {attraction.certificateCount.toLocaleString("th-TH")}
      </td>
      <td className="hidden px-4 py-2.5 text-right lg:table-cell">
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
