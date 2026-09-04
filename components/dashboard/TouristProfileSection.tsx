import { GlobeHemisphereWest, IdentificationCard, MapPin, UsersThree } from "@phosphor-icons/react/dist/ssr";
import { AnalyticsMetricGrid } from "@/components/dashboard/AnalyticsMetricGrid";
import { BarChartCard } from "@/components/dashboard/BarChartCard";
import { AnalyticsSectionHeader } from "@/components/dashboard/AnalyticsSectionHeader";
import { localizeDashboardLabel } from "@/components/dashboard/dashboard-localization";
import { ExportCsvButton } from "@/components/dashboard/ExportCsvButton";
import { TouristDetailTable } from "@/components/dashboard/TouristDetailTable";
import type { DashboardViewModel, DistributionItem } from "@/types/dashboard";
import { buildDistributionInterpretation } from "@/lib/dashboard/distribution-evidence";

const CONTEXT_COLORS = ["#B94727", "#171717", "#D6A13D", "#0A6B62", "#3B82F6"];

function total(items: DistributionItem[]): number {
  return items.reduce((sum, item) => sum + item.value, 0);
}

function IdentityContext({ items }: { items: DistributionItem[] }) {
  const positive = items.filter((item) => item.value > 0);
  const visible = positive.slice(0, 5);

  return (
    <section className="h-full rounded-md border border-slate-200 bg-white p-4 sm:p-5">
      <h2 className="text-base font-bold text-slate-900">บริบทวิธีเข้าใช้งาน</h2>
      <p className="mt-1 text-sm leading-6 text-slate-500">ใช้ดูช่องทางที่โปรไฟล์เชื่อมกับระบบ หนึ่งโปรไฟล์อาจมีมากกว่าหนึ่งวิธีเข้าใช้งาน</p>
      {positive.length === 0 ? (
        <p className="mt-4 rounded-md border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">ยังไม่มีข้อมูลวิธีเข้าใช้งาน</p>
      ) : (
        <>
          <ul className="mt-5 space-y-3">
            {visible.map((item, index) => (
              <li key={item.label} className="text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="flex min-w-0 items-center gap-2 text-slate-700"><span aria-hidden="true" className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: CONTEXT_COLORS[index] }} />{localizeDashboardLabel(item.label)}</span>
                  <strong className="shrink-0 tabular-nums text-slate-900">{item.value.toLocaleString("th-TH")} โปรไฟล์ · {Math.round((item.percent ?? 0) * 100)}%</strong>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-sm bg-slate-100" role="img" aria-label={`${localizeDashboardLabel(item.label)} ${Math.round((item.percent ?? 0) * 100)}% ของโปรไฟล์`}>
                  <div className="h-full rounded-sm" style={{ width: `${Math.min((item.percent ?? 0) * 100, 100)}%`, backgroundColor: CONTEXT_COLORS[index] }} />
                </div>
              </li>
            ))}
          </ul>
          {positive.length > visible.length ? <p className="mt-3 text-xs text-slate-500">แสดง 5 วิธีแรกจากทั้งหมด {positive.length.toLocaleString("th-TH")} วิธี</p> : null}
        </>
      )}
      <p className="mt-5 border-t border-slate-100 pt-3 text-xs leading-5 text-slate-500">คิดสัดส่วนต่อจำนวนโปรไฟล์ หนึ่งโปรไฟล์อาจมีหลายช่องทางจึงรวมเกิน 100% ได้ โปรไฟล์ระบบไม่ใช่จำนวนบุคคลจริงที่ยืนยันแล้ว และไม่ใช้ข้อมูลผู้ให้บริการเพื่อระบุตัวบุคคลในหน้านี้</p>
    </section>
  );
}

export function TouristProfileSection({ data }: { data: DashboardViewModel }) {
  const profileMetric = data.kpis.find((metric) => metric.key === "tourist_profiles");
  const originResponseCount = total(data.touristProfile.originCountries);
  const profileCount = typeof profileMetric?.rawValue === "number" ? profileMetric.rawValue : originResponseCount;
  const denominator = data.touristProfile.recordCount ?? profileCount;
  const provinceResponseCount = total(data.touristProfile.originProvinces);
  const thaiProfileCount = data.touristProfile.originProvinceEligibleCount
    ?? data.touristProfile.originCountries.find((item) => /^(ไทย|ประเทศไทย|Thailand)$/i.test(item.label))?.value
    ?? provinceResponseCount;
  const ageResponseCount = total(data.touristProfile.ageGroups);
  const languageResponseCount = total(data.touristProfile.preferredLanguages);
  const kpis = [
    { label: "โปรไฟล์ที่มีรายการเข้าชม", value: profileCount.toLocaleString("th-TH"), icon: <UsersThree aria-hidden="true" size={20} weight="fill" />, note: "โปรไฟล์ระบบ ไม่ใช่จำนวนบุคคลที่ยืนยันตัวตนแล้ว" },
    { label: "ประเทศต้นทางที่พบ", value: data.touristProfile.originCountries.length.toLocaleString("th-TH"), icon: <GlobeHemisphereWest aria-hidden="true" size={20} weight="fill" /> },
    { label: "จังหวัดต้นทางในไทย", value: data.touristProfile.originProvinces.length.toLocaleString("th-TH"), icon: <MapPin aria-hidden="true" size={20} weight="fill" /> },
    { label: "ช่วงอายุที่มีข้อมูล", value: data.touristProfile.ageGroups.length.toLocaleString("th-TH"), icon: <IdentificationCard aria-hidden="true" size={20} weight="fill" /> },
  ];

  return (
    <section className="space-y-5" aria-labelledby="tourist-profile-heading">
      <AnalyticsSectionHeader
        actions={<ExportCsvButton filters={data.filters} quality={data.quality} />}
        description="สำรวจพื้นที่ต้นทาง ช่วงอายุ และภาษาจากโปรไฟล์ที่มีรายการเข้าชม โดยแสดงเฉพาะข้อมูลสรุปที่ไม่ระบุตัวบุคคล"
        headingId="tourist-profile-heading"
        title="ลักษณะนักท่องเที่ยว"
      />

      <AnalyticsMetricGrid items={kpis} label="ตัวชี้วัดลักษณะนักท่องเที่ยว" />

      <div className="grid min-w-0 gap-4 xl:grid-cols-12">
        <div role="region" aria-label="หลักฐานประเทศต้นทาง" className="min-w-0 xl:col-span-8">
          <BarChartCard data={data.touristProfile.originCountries} definition="จำนวนโปรไฟล์ที่มีรายการเข้าชม แยกตามประเทศต้นทางที่ผู้ใช้ระบุ" emptyDescription="ยังไม่มีข้อมูลประเทศต้นทางสำหรับตัวกรองที่เลือก" title="ประเทศต้นทาง" sampleCount={originResponseCount} sampleLabel="โปรไฟล์ที่ระบุประเทศ" denominatorCount={denominator} interpretation={buildDistributionInterpretation(data.touristProfile.originCountries, { answeredCount: originResponseCount, denominatorCount: denominator })} />
        </div>
        <div role="region" aria-label="บริบทวิธีเข้าใช้งาน" className="min-w-0 xl:col-span-4">
          <IdentityContext items={data.touristProfile.identityProviders} />
        </div>
      </div>

      <div className="grid min-w-0 gap-4 lg:grid-cols-3">
        <BarChartCard data={data.touristProfile.originProvinces} definition="จำนวนโปรไฟล์จากประเทศไทย แยกตามจังหวัดต้นทางที่ผู้ใช้ระบุ" emptyDescription="ยังไม่มีข้อมูลจังหวัดต้นทางในประเทศไทย" title="จังหวัดต้นทางในประเทศไทย" sampleCount={provinceResponseCount} sampleLabel="โปรไฟล์ที่ระบุจังหวัด" denominatorCount={thaiProfileCount} interpretation={buildDistributionInterpretation(data.touristProfile.originProvinces, { answeredCount: provinceResponseCount, denominatorCount: thaiProfileCount })} />
        <BarChartCard data={data.touristProfile.ageGroups} definition="การกระจายช่วงอายุที่ผู้ใช้เลือก ระบบไม่เก็บวันเกิดแบบละเอียด" emptyDescription="ยังไม่มีข้อมูลช่วงอายุ" title="ช่วงอายุ" sampleCount={ageResponseCount} sampleLabel="โปรไฟล์ที่ระบุช่วงอายุ" denominatorCount={denominator} interpretation={buildDistributionInterpretation(data.touristProfile.ageGroups, { answeredCount: ageResponseCount, denominatorCount: denominator })} />
        <BarChartCard data={data.touristProfile.preferredLanguages} definition="ภาษาที่ผู้ใช้เลือกใช้ในระบบเมื่อมีข้อมูล" emptyDescription="ยังไม่มีข้อมูลภาษาที่ต้องการ" title="ภาษาที่ต้องการ" sampleCount={languageResponseCount} sampleLabel="โปรไฟล์ที่ระบุภาษา" denominatorCount={denominator} interpretation={buildDistributionInterpretation(data.touristProfile.preferredLanguages, { answeredCount: languageResponseCount, denominatorCount: denominator })} />
      </div>

      <TouristDetailTable {...data.touristProfile} />
    </section>
  );
}
