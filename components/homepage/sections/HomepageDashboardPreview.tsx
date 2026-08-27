import Link from "next/link";
import {
  ArrowRight,
  Certificate,
  MapPinLine,
  Plant,
  ShieldCheck,
  Star,
  UsersThree,
} from "@phosphor-icons/react/dist/ssr";
import { getPublicDashboardAnalytics } from "@/lib/services/dashboard.service";

const KPI_DEFINITIONS = [
  { key: "tourist_profiles", label: "โปรไฟล์นักท่องเที่ยว", hint: "ผู้ใช้ที่ระบบบันทึกแล้ว", icon: UsersThree },
  { key: "total_visits", label: "รายการเช็กอิน", hint: "การเข้าชมสถานที่", icon: MapPinLine },
  { key: "certificates_generated", label: "ใบประกาศดิจิทัล", hint: "สร้างสำเร็จ", icon: Certificate },
  { key: "average_satisfaction", label: "ความพึงพอใจเฉลี่ย", hint: "จากแบบสำรวจ", icon: Star },
] as const;

export async function HomepageDashboardPreview() {
  const analytics = await getPublicDashboardAnalytics({}).catch(() => null);
  const values = new Map(analytics?.kpis.map((kpi) => [kpi.key, kpi.value]) ?? []);

  return (
    <section id="dashboard" aria-labelledby="homepage-statistics-heading" className="border-t border-ink/10 bg-white px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.15fr] lg:items-center lg:gap-12">
          {/* Left Column: Mission & Purpose */}
          <div className="flex flex-col justify-center">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-coral">ข้อมูลสาธารณะจากระบบ</p>
            <h2 id="homepage-statistics-heading" className="mt-2 text-2xl font-black leading-tight text-ink sm:text-3xl lg:text-4xl">
              เที่ยวยะลา เรียนรู้ สืบสาน <span className="text-coral">วัฒนธรรมท้องถิ่น</span>
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base">
              ภาพรวมการท่องเที่ยวที่บันทึกแล้ว ตัวเลขสรุปจากการเช็กอิน การสร้างใบประกาศ และแบบสำรวจที่ผู้ใช้สมัครใจตอบ ไม่ใช่จำนวนผู้เข้าชมเว็บไซต์
            </p>

            {/* 3 Value badges */}
            <div className="mt-8 grid grid-cols-3 gap-3 border-t border-ink/10 pt-6 sm:gap-4">
              <div className="flex flex-col items-center rounded-[8px] bg-cream p-3 text-center sm:p-4">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-coral/10 text-coral">
                  <ShieldCheck aria-hidden="true" size={22} weight="fill" />
                </div>
                <p className="mt-2 text-xs font-black text-ink">แหล่งท่องเที่ยวคุณภาพ</p>
              </div>

              <div className="flex flex-col items-center rounded-[8px] bg-cream p-3 text-center sm:p-4">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-coral/10 text-coral">
                  <Star aria-hidden="true" size={22} weight="fill" />
                </div>
                <p className="mt-2 text-xs font-black text-ink">ปลอดภัยเชื่อถือได้</p>
              </div>

              <div className="flex flex-col items-center rounded-[8px] bg-cream p-3 text-center sm:p-4">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-coral/10 text-coral">
                  <Plant aria-hidden="true" size={22} weight="fill" />
                </div>
                <p className="mt-2 text-xs font-black text-ink">ร่วมอนุรักษ์วัฒนธรรม</p>
              </div>
            </div>

            <div className="mt-6">
              <Link href="/dashboard" className="inline-flex min-h-11 items-center gap-2 text-sm font-black text-teal hover:text-coral focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral">
                ดูสถิติฉบับเต็ม <ArrowRight aria-hidden="true" weight="bold" />
              </Link>
            </div>
          </div>

          {/* Right Column: Evidence Card */}
          <div className="overflow-hidden rounded-[8px] border border-ink/10 bg-cream shadow-card">
            {/* Visual Header Frame */}
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-gradient-to-br from-ink/90 via-ink/75 to-teal/90">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-coral/30 via-transparent to-transparent"></div>
              <div className="relative z-10 flex h-full flex-col justify-end p-6 text-white">
                <p className="text-xs font-bold uppercase tracking-wider text-coral">Southern Border Data &amp; Intelligence</p>
                <p className="mt-1 text-lg font-black sm:text-xl">ข้อมูลจริงเพื่อการวางแผนท่องเที่ยวอย่างยั่งยืน</p>
              </div>
            </div>

            {/* Bottom Coral Evidence Bar with Real KPIs */}
            {analytics ? (
              <dl className="grid grid-cols-2 divide-x divide-y divide-white/15 bg-coral text-white sm:grid-cols-4 sm:divide-y-0">
                {KPI_DEFINITIONS.map(({ key, label, icon: Icon }) => (
                  <div key={key} className="flex flex-col items-center p-4 text-center sm:p-5">
                    <Icon aria-hidden="true" size={24} weight="fill" className="text-white/90" />
                    <dd className="mt-2 text-2xl font-black tracking-tight tabular-nums sm:text-3xl">
                      {values.get(key) ?? (key === "average_satisfaction" ? "0.0" : "0")}
                    </dd>
                    <dt className="mt-1 text-[11px] font-bold text-white/90 sm:text-xs">{label}</dt>
                  </div>
                ))}
              </dl>
            ) : (
              <div className="bg-coral p-6 text-center text-white">
                <p role="status" className="text-sm font-bold text-white/90">
                  ข้อมูลสถิติยังไม่พร้อมใช้งานชั่วคราว กรุณากลับมาดูอีกครั้ง
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
