import { BarChartCard } from "@/components/dashboard/BarChartCard";
import { ExportCsvButton } from "@/components/dashboard/ExportCsvButton";
import { StackedDistributionCard } from "@/components/dashboard/StackedDistributionCard";
import type { DashboardViewModel } from "@/types/dashboard";

export function TouristProfileSection({ data }: { data: DashboardViewModel }) {
  const profileCount = data.touristProfile.originCountries.reduce((sum, item) => sum + item.value, 0);

  return (
    <section className="space-y-5" aria-labelledby="tourist-profile-heading">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="tourist-profile-heading" className="text-lg font-bold text-slate-900">ลักษณะนักท่องเที่ยว</h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">แสดงข้อมูลโปรไฟล์แบบสรุป ไม่ใช่จำนวนบุคคลจริงที่ผ่านการยืนยัน และไม่นำข้อมูลระบุตัวตนมาแสดง</p>
        </div>
        <ExportCsvButton />
      </div>

      <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["โปรไฟล์ที่มีรายการเข้าชม", profileCount],
          ["ประเทศต้นทางที่พบ", data.touristProfile.originCountries.length],
          ["จังหวัดต้นทางในไทย", data.touristProfile.originProvinces.length],
          ["ช่วงอายุที่มีข้อมูล", data.touristProfile.ageGroups.length],
        ].map(([label, value]) => (
          <div key={String(label)} className="rounded-lg border border-slate-200 bg-white p-4">
            <dt className="text-xs font-semibold text-slate-600">{label}</dt>
            <dd className="mt-1 text-2xl font-black tabular-nums text-[#073F37]">{Number(value).toLocaleString("th-TH")}</dd>
          </div>
        ))}
      </dl>

      <div className="grid min-w-0 gap-4 xl:grid-cols-2">
        <BarChartCard data={data.touristProfile.originCountries} definition="จำนวนโปรไฟล์ที่มีรายการเข้าชม แยกตามประเทศต้นทางที่ผู้ใช้ระบุ" emptyDescription="ยังไม่มีข้อมูลประเทศต้นทางสำหรับตัวกรองที่เลือก" title="ประเทศต้นทาง" sampleCount={profileCount} sampleLabel="โปรไฟล์" />
        <BarChartCard data={data.touristProfile.originProvinces} definition="จำนวนโปรไฟล์จากประเทศไทย แยกตามจังหวัดต้นทางที่ผู้ใช้ระบุ" emptyDescription="ยังไม่มีข้อมูลจังหวัดต้นทางในประเทศไทย" title="จังหวัดต้นทางในประเทศไทย" sampleCount={profileCount} sampleLabel="โปรไฟล์" />
        <BarChartCard data={data.touristProfile.ageGroups} definition="การกระจายช่วงอายุที่ผู้ใช้เลือก ระบบไม่เก็บวันเกิดแบบละเอียด" emptyDescription="ยังไม่มีข้อมูลช่วงอายุ" title="ช่วงอายุ" sampleCount={profileCount} sampleLabel="โปรไฟล์" />
        <BarChartCard data={data.touristProfile.preferredLanguages} definition="ภาษาที่ผู้ใช้เลือกใช้ในระบบเมื่อมีข้อมูล" emptyDescription="ยังไม่มีข้อมูลภาษาที่ต้องการ" title="ภาษาที่ต้องการ" sampleCount={profileCount} sampleLabel="โปรไฟล์" />
        <StackedDistributionCard data={data.touristProfile.identityProviders} definition="สัดส่วนวิธีเข้าใช้งาน เช่น ผู้เยี่ยมชม Google LINE หรืออีเมล โดยหนึ่งโปรไฟล์อาจมีหลายวิธีเชื่อมบัญชี" emptyDescription="ยังไม่มีข้อมูลวิธีเข้าใช้งาน" title="วิธีเข้าใช้งาน" />
      </div>
    </section>
  );
}
