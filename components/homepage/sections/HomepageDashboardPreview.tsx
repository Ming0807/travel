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
  previewImage = "",
}: {
  previewImage?: string;
} = {}) {
  const analytics = await getPublicDashboardAnalytics({}).catch(() => null);
  const values = new Map(analytics?.kpis.map((kpi) => [kpi.key, kpi.value]) ?? []);
  const imageUrl = previewImage.startsWith("/") || /^https?:\/\//i.test(previewImage)
    ? previewImage
    : siteMediaImageUrl(previewImage);

  return (
    <section id="dashboard" aria-labelledby="homepage-statistics-heading" className="border-t border-ink/10 bg-white px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.15fr] lg:items-center lg:gap-14">
          {/* Left Column: Mission & Purpose */}
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-3 text-sm font-black text-coral">
              <span className="h-0.5 w-8 bg-coral" aria-hidden="true" />
              <span>ข้อมูลสาธารณะจากระบบ</span>
            </div>

            <h2 id="homepage-statistics-heading" className="mt-4 text-3xl font-black leading-tight text-ink sm:text-4xl">
              เที่ยวยะลา เรียนรู้ สืบสาน <br />
              <span className="text-coral">
                วัฒนธรรมท้องถิ่น
              </span>
            </h2>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted sm:text-base">
              โครงการนี้จัดทำขึ้นเพื่อส่งเสริมการท่องเที่ยวเชิงวัฒนธรรม และอนุรักษ์มรดกทางศิลปวัฒนธรรมของยะลา ผ่านการเชื่อมต่อข้อมูลกิจกรรมท่องเที่ยวจริงเข้ากับการวางแผนพัฒนาอย่างยั่งยืน
            </p>

            {/* 3 Factual Purpose Points */}
            <div className="mt-7 divide-y divide-ink/10 border-y border-ink/10">
              <div className="flex items-start gap-4 py-4">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-orange-50 text-coral">
                  <CheckCircle aria-hidden="true" size={22} weight="fill" />
                </div>
                <div>
                  <p className="text-sm font-black text-ink">ข้อมูลจากกิจกรรมจริง</p>
                  <p className="mt-1 text-sm leading-6 text-muted">
                    บันทึกจากจุดเช็กอินและพาสปอร์ตดิจิทัลที่เกิดขึ้นจริงในพื้นที่
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 py-4">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-orange-50 text-coral">
                  <UserCheck aria-hidden="true" size={22} weight="fill" />
                </div>
                <div>
                  <p className="text-sm font-black text-ink">เลือกตอบข้อมูลเพิ่มเติม</p>
                  <p className="mt-1 text-sm leading-6 text-muted">
                    แบบสำรวจตามความสมัครใจของผู้เดินทาง ไม่บังคับกรอกข้อมูลส่วนบุคคล
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 py-4">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-orange-50 text-coral">
                  <ChartLineUp aria-hidden="true" size={22} weight="fill" />
                </div>
                <div>
                  <p className="text-sm font-black text-ink">นำเสนอข้อมูลเป็นภาพรวม</p>
                  <p className="mt-1 text-sm leading-6 text-muted">
                    ประมวลผลเชิงสถิติเพื่อสนับสนุนการพัฒนาชุมชนและเศรษฐกิจฐานราก
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs font-medium text-muted">
                *ตัวเลขสรุปจากการเช็กอินจริง ไม่ใช่จำนวนผู้เข้าชมเว็บไซต์
              </p>
              <Link href="/dashboard" className="inline-flex min-h-10 items-center gap-1.5 text-xs font-black text-coral hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral">
                ดูสถิติฉบับเต็ม <ArrowRight aria-hidden="true" weight="bold" />
              </Link>
            </div>
          </div>

          {/* Right Column: Evidence Card */}
          <div className="overflow-hidden rounded-xl bg-ink shadow-md">
            {/* Visual Header Frame */}
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-ink">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt="ภาพบรรยากาศการท่องเที่ยวและข้อมูลยะลา"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 550px"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-amber-600/30 via-orange-500/40 to-ink p-6 flex items-center justify-center text-center">
                  <p className="text-sm font-bold text-white/80">ศูนย์ข้อมูลสารสนเทศการท่องเที่ยวชายแดนใต้</p>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/30 to-transparent" />
              <div className="relative z-10 flex h-full flex-col justify-end p-5 sm:p-6 text-white">
                <p className="text-xs font-bold text-amber-300">Southern Border Data &amp; Intelligence</p>
                <p className="mt-1 text-base font-black sm:text-xl">ข้อมูลจริงเพื่อการวางแผนท่องเที่ยวอย่างยั่งยืน</p>
              </div>
            </div>

            {/* Bottom Coral Evidence Bar with Real KPIs */}
            {analytics ? (
              <dl className="grid grid-cols-2 divide-x divide-y divide-white/15 bg-coral text-white sm:grid-cols-4 sm:divide-y-0">
                {KPI_DEFINITIONS.map(({ key, label, icon: Icon }) => (
                  <div key={key} className="flex flex-col items-center p-4 text-center sm:p-5">
                    <Icon aria-hidden="true" size={24} weight="fill" className="text-white/90" />
                    <dd className="mt-2 text-2xl font-black tabular-nums sm:text-3xl">
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
