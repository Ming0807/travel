import { BarChartCard } from "@/components/dashboard/BarChartCard";
import { localizeDashboardLabel } from "@/components/dashboard/dashboard-localization";
import { ExportCsvButton } from "@/components/dashboard/ExportCsvButton";
import { TouristDetailTable } from "@/components/dashboard/TouristDetailTable";
import type { DashboardViewModel, DistributionItem } from "@/types/dashboard";

const CONTEXT_COLORS = ["#B94727", "#171717", "#D6A13D", "#0A6B62", "#3B82F6"];

function total(items: DistributionItem[]): number {
  return items.reduce((sum, item) => sum + item.value, 0);
}

function kpiDivider(index: number): string {
  if (index === 0) return "";
  if (index === 1) return "border-t border-slate-200 sm:border-l sm:border-t-0";
  if (index === 2) return "border-t border-slate-200 xl:border-l xl:border-t-0";
  return "border-t border-slate-200 sm:border-l xl:border-t-0";
}

function IdentityContext({ items }: { items: DistributionItem[] }) {
  const positive = items.filter((item) => item.value > 0);
  const visible = positive.slice(0, 5);
  const identityCount = total(positive);

  return (
    <section className="h-full rounded-md border border-slate-200 bg-white p-4 shadow-[0_4px_8px_rgba(15,23,42,0.05)]">
      <h2 className="text-base font-bold text-slate-900">บริบทวิธีเข้าใช้งาน</h2>
      <p className="mt-1 text-sm leading-6 text-slate-500">ใช้ดูช่องทางที่โปรไฟล์เชื่อมกับระบบ หนึ่งโปรไฟล์อาจมีมากกว่าหนึ่งวิธีเข้าใช้งาน</p>
      {identityCount === 0 ? (
        <p className="mt-4 rounded-md border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">ยังไม่มีข้อมูลวิธีเข้าใช้งาน</p>
      ) : (
        <>
          <div className="mt-5 flex h-3 overflow-hidden rounded-sm bg-slate-100" role="img" aria-label="สัดส่วนวิธีเข้าใช้งาน">
            {visible.map((item, index) => <span key={item.label} style={{ width: `${(item.value / identityCount) * 100}%`, backgroundColor: CONTEXT_COLORS[index] }} />)}
          </div>
          <ul className="mt-4 space-y-2">
            {visible.map((item, index) => (
              <li key={item.label} className="flex items-center justify-between gap-3 text-sm">
                <span className="flex min-w-0 items-center gap-2 text-slate-700"><span aria-hidden="true" className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: CONTEXT_COLORS[index] }} />{localizeDashboardLabel(item.label)}</span>
                <strong className="shrink-0 tabular-nums text-slate-900">{Math.round((item.value / identityCount) * 100)}%</strong>
              </li>
            ))}
          </ul>
          {positive.length > visible.length ? <p className="mt-3 text-xs text-slate-500">แสดง 5 วิธีแรกจากทั้งหมด {positive.length.toLocaleString("th-TH")} วิธี</p> : null}
        </>
      )}
      <p className="mt-5 border-t border-slate-100 pt-3 text-xs leading-5 text-slate-500">โปรไฟล์ระบบ ไม่ใช่จำนวนบุคคลจริงที่ยืนยันแล้ว และไม่ใช้ข้อมูลผู้ให้บริการเพื่อระบุตัวบุคคลในหน้านี้</p>
    </section>
  );
}

export function TouristProfileSection({ data }: { data: DashboardViewModel }) {
  const profileMetric = data.kpis.find((metric) => metric.key === "tourist_profiles");
  const originResponseCount = total(data.touristProfile.originCountries);
  const profileCount = typeof profileMetric?.rawValue === "number" ? profileMetric.rawValue : originResponseCount;
  const provinceResponseCount = total(data.touristProfile.originProvinces);
  const ageResponseCount = total(data.touristProfile.ageGroups);
  const languageResponseCount = total(data.touristProfile.preferredLanguages);
  const kpis = [
    ["โปรไฟล์ที่มีรายการเข้าชม", profileCount],
    ["ประเทศต้นทางที่พบ", data.touristProfile.originCountries.length],
    ["จังหวัดต้นทางในไทย", data.touristProfile.originProvinces.length],
    ["ช่วงอายุที่มีข้อมูล", data.touristProfile.ageGroups.length],
  ] as const;

  return (
    <section className="space-y-5" aria-labelledby="tourist-profile-heading">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="tourist-profile-heading" className="text-lg font-bold text-slate-900">ลักษณะนักท่องเที่ยว</h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">สำรวจพื้นที่ต้นทาง ช่วงอายุ และภาษาจากโปรไฟล์ที่มีรายการเข้าชม โดยแสดงเฉพาะข้อมูลสรุปที่ไม่ระบุตัวบุคคล</p>
        </div>
        <ExportCsvButton />
      </div>

      <dl role="group" aria-label="ตัวชี้วัดลักษณะนักท่องเที่ยว" className="grid overflow-hidden rounded-md border border-slate-200 bg-white sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map(([label, value], index) => (
          <div key={label} className={`min-w-0 p-3.5 ${kpiDivider(index)}`}>
            <dt className="text-xs font-semibold text-slate-600">{label}</dt>
            <dd className="mt-1 text-xl font-black tabular-nums text-slate-900">{value.toLocaleString("th-TH")}</dd>
          </div>
        ))}
      </dl>

      <div className="grid min-w-0 gap-4 xl:grid-cols-12">
        <div role="region" aria-label="หลักฐานประเทศต้นทาง" className="min-w-0 xl:col-span-8">
          <BarChartCard data={data.touristProfile.originCountries} definition="จำนวนโปรไฟล์ที่มีรายการเข้าชม แยกตามประเทศต้นทางที่ผู้ใช้ระบุ" emptyDescription="ยังไม่มีข้อมูลประเทศต้นทางสำหรับตัวกรองที่เลือก" title="ประเทศต้นทาง" sampleCount={originResponseCount} sampleLabel="โปรไฟล์ที่ระบุประเทศ" />
        </div>
        <div role="region" aria-label="บริบทวิธีเข้าใช้งาน" className="min-w-0 xl:col-span-4">
          <IdentityContext items={data.touristProfile.identityProviders} />
        </div>
      </div>

      <div className="grid min-w-0 gap-4 lg:grid-cols-3">
        <BarChartCard data={data.touristProfile.originProvinces} definition="จำนวนโปรไฟล์จากประเทศไทย แยกตามจังหวัดต้นทางที่ผู้ใช้ระบุ" emptyDescription="ยังไม่มีข้อมูลจังหวัดต้นทางในประเทศไทย" title="จังหวัดต้นทางในประเทศไทย" sampleCount={provinceResponseCount} sampleLabel="โปรไฟล์ที่ระบุจังหวัด" />
        <BarChartCard data={data.touristProfile.ageGroups} definition="การกระจายช่วงอายุที่ผู้ใช้เลือก ระบบไม่เก็บวันเกิดแบบละเอียด" emptyDescription="ยังไม่มีข้อมูลช่วงอายุ" title="ช่วงอายุ" sampleCount={ageResponseCount} sampleLabel="โปรไฟล์ที่ระบุช่วงอายุ" />
        <BarChartCard data={data.touristProfile.preferredLanguages} definition="ภาษาที่ผู้ใช้เลือกใช้ในระบบเมื่อมีข้อมูล" emptyDescription="ยังไม่มีข้อมูลภาษาที่ต้องการ" title="ภาษาที่ต้องการ" sampleCount={languageResponseCount} sampleLabel="โปรไฟล์ที่ระบุภาษา" />
      </div>

      <TouristDetailTable {...data.touristProfile} />
    </section>
  );
}
