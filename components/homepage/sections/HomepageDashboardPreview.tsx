import Link from "next/link";
import {
  ArrowRight,
  Certificate,
  MapPinLine,
  Star,
  UsersThree,
} from "@phosphor-icons/react/dist/ssr";
import { getPublicDashboardAnalytics } from "@/lib/services/dashboard.service";

const KPI_DEFINITIONS = [
  { key: "tourist_profiles", label: "โปรไฟล์นักท่องเที่ยว", hint: "ผู้ใช้ที่ระบบบันทึกแล้ว", icon: UsersThree, accent: "text-teal" },
  { key: "total_visits", label: "รายการเช็กอิน", hint: "การเข้าชมสถานที่ที่บันทึกแล้ว", icon: MapPinLine, accent: "text-coral" },
  { key: "certificates_generated", label: "ใบประกาศดิจิทัล", hint: "ใบประกาศที่สร้างสำเร็จ", icon: Certificate, accent: "text-gold" },
  { key: "average_satisfaction", label: "ความพึงพอใจเฉลี่ย", hint: "จากแบบสำรวจที่สมัครใจตอบ", icon: Star, accent: "text-teal" },
] as const;

export async function HomepageDashboardPreview() {
  const analytics = await getPublicDashboardAnalytics({});
  const values = new Map(analytics.kpis.map((kpi) => [kpi.key, kpi.value]));

  return (
    <section id="dashboard" aria-labelledby="homepage-statistics-heading" className="bg-ink px-4 py-10 text-white sm:px-6 lg:px-8 lg:py-14">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-5 border-b border-white/15 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-coral">ข้อมูลสาธารณะจากระบบ</p>
            <h2 id="homepage-statistics-heading" className="mt-2 text-2xl font-black sm:text-3xl">ภาพรวมการท่องเที่ยวที่บันทึกแล้ว</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/65">ตัวเลขสรุปจากการเช็กอิน การสร้างใบประกาศ และแบบสำรวจที่ผู้ใช้สมัครใจตอบ ไม่ใช่จำนวนผู้เข้าชมเว็บไซต์</p>
          </div>
          <Link href="/dashboard" className="inline-flex min-h-11 items-center gap-2 text-sm font-black text-white transition-colors hover:text-coral focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral">
            ดูสถิติฉบับเต็ม <ArrowRight aria-hidden="true" weight="bold" />
          </Link>
        </div>

        <dl className="grid sm:grid-cols-2 lg:grid-cols-4">
          {KPI_DEFINITIONS.map(({ key, label, hint, icon: Icon, accent }, index) => (
            <div key={key} className={`py-6 sm:p-6 ${index > 0 ? "border-t border-white/15 sm:border-l sm:border-t-0" : "sm:pl-0"}`}>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-sm font-bold text-white/70">{label}</dt>
                <Icon aria-hidden="true" size={22} weight="duotone" className={accent} />
              </div>
              <dd className="mt-3 text-3xl font-black tabular-nums">{values.get(key) ?? (key === "average_satisfaction" ? "0.0" : "0")}</dd>
              <p className="mt-2 text-xs leading-5 text-white/50">{hint}</p>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
