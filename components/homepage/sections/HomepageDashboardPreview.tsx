import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Certificate,
  CheckCircle,
  ChartLineUp,
  MapPinLine,
  Star,
  UserCheck,
  UsersThree,
} from "@phosphor-icons/react/dist/ssr";
import { getPublicDashboardAnalytics } from "@/lib/services/dashboard.service";
import { siteMediaImageUrl } from "@/lib/media/storage-paths";

const KPI_DEFINITIONS = [
  { key: "tourist_profiles", label: "โปรไฟล์นักท่องเที่ยว", hint: "ผู้ใช้ที่ระบบบันทึกแล้ว", icon: UsersThree },
  { key: "total_visits", label: "รายการเช็กอิน", hint: "การเข้าชมสถานที่", icon: MapPinLine },
  { key: "certificates_generated", label: "ใบประกาศดิจิทัล", hint: "สร้างสำเร็จ", icon: Certificate },
  { key: "average_satisfaction", label: "ความพึงพอใจเฉลี่ย", hint: "จากแบบสำรวจ", icon: Star },
] as const;

export async function HomepageDashboardPreview({
  previewImage = "general/hero.webp",
}: {
  previewImage?: string;
} = {}) {
  const analytics = await getPublicDashboardAnalytics({}).catch(() => null);
  const values = new Map(analytics?.kpis.map((kpi) => [kpi.key, kpi.value]) ?? []);
  const imageUrl = siteMediaImageUrl(previewImage);

  return (
    <section id="dashboard" aria-labelledby="homepage-statistics-heading" className="border-t border-ink/10 bg-white px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.15fr] lg:items-center lg:gap-14">
          {/* Left Column: Mission & Purpose */}
          <div className="flex flex-col justify-center">
            <h2 id="homepage-statistics-heading" className="text-3xl font-black leading-tight text-ink sm:text-4xl">
              เที่ยวยะลา เรียนรู้ สืบสาน <br />
              <span className="text-coral">
                วัฒนธรรมท้องถิ่น
              </span>
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base">
              โครงการนี้จัดทำขึ้นเพื่อส่งเสริมการท่องเที่ยวเชิงวัฒนธรรม และอนุรักษ์มรดกทางศิลปวัฒนธรรมของยะลา ผ่านการใช้เทคโนโลยีดิจิทัลที่ทันสมัย
            </p>

            {/* 3 Factual Purpose Points */}
            <div className="mt-8 grid grid-cols-3 gap-3 border-t border-ink/10 pt-6 sm:gap-4">
              <div className="flex flex-col items-center rounded-xl border border-orange-200/60 bg-[#FFFDF9] p-3.5 text-center shadow-2xs sm:p-4">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-orange-50 text-coral">
                  <CheckCircle aria-hidden="true" size={22} weight="fill" />
                </div>
                <p className="mt-2.5 text-xs font-black text-ink">ข้อมูลจากกิจกรรมจริง</p>
              </div>

              <div className="flex flex-col items-center rounded-xl border border-orange-200/60 bg-[#FFFDF9] p-3.5 text-center shadow-2xs sm:p-4">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-orange-50 text-coral">
                  <UserCheck aria-hidden="true" size={22} weight="fill" />
                </div>
                <p className="mt-2.5 text-xs font-black text-ink">เลือกตอบข้อมูลเพิ่มเติม</p>
              </div>

              <div className="flex flex-col items-center rounded-xl border border-orange-200/60 bg-[#FFFDF9] p-3.5 text-center shadow-2xs sm:p-4">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-orange-50 text-coral">
                  <ChartLineUp aria-hidden="true" size={22} weight="fill" />
                </div>
                <p className="mt-2.5 text-xs font-black text-ink">นำเสนอข้อมูลเป็นภาพรวม</p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <p className="text-[11px] font-medium text-muted">
                *ตัวเลขสรุปจากการเช็กอินจริง ไม่ใช่จำนวนผู้เข้าชมเว็บไซต์
              </p>
              <Link href="/dashboard" className="inline-flex min-h-10 items-center gap-1.5 text-xs font-black text-coral hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral">
                ดูสถิติฉบับเต็ม <ArrowRight aria-hidden="true" weight="bold" />
              </Link>
            </div>
          </div>

          {/* Right Column: Evidence Card */}
          <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-xl shadow-orange-500/10">
            {/* Visual Header Frame */}
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-ink">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt="ภาพบรรยากาศการท่องเที่ยวและข้อมูลยะลา"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 550px"
                />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/30 to-transparent" />
              <div className="relative z-10 flex h-full flex-col justify-end p-6 text-white">
                <p className="text-xs font-bold uppercase tracking-wider text-amber-300">Southern Border Data &amp; Intelligence</p>
                <p className="mt-1 text-lg font-black sm:text-xl">ข้อมูลจริงเพื่อการวางแผนท่องเที่ยวอย่างยั่งยืน</p>
              </div>
            </div>

            {/* Bottom Coral Evidence Bar with Real KPIs */}
            {analytics ? (
              <dl className="grid grid-cols-2 divide-x divide-y divide-white/15 bg-gradient-to-r from-orange-600 via-coral to-amber-600 text-white sm:grid-cols-4 sm:divide-y-0">
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
              <div className="bg-gradient-to-r from-orange-600 via-coral to-amber-600 p-6 text-center text-white">
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
