import Link from "next/link";
import { UsersThree, MapPinLine, Certificate, Star } from "@phosphor-icons/react/dist/ssr";
import { dashboardPreviewMetrics } from "../homepage-data";

export function HomepageDashboardPreview() {
  return (
    <section id="dashboard" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-6 lg:py-16">
      <div className="mb-7 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-bold text-coral">Analytics Preview</p>
          <h2 className="text-3xl font-extrabold lg:text-4xl">ข้อมูลสำหรับวางแผนการท่องเที่ยว</h2>
          <p className="body-text mt-3 max-w-2xl text-muted">
            Dashboard ใช้ข้อมูลแบบรวม ไม่แสดงตัวตนส่วนบุคคล เพื่อช่วยวิเคราะห์นักท่องเที่ยว รูปแบบการเดินทาง
            ค่าใช้จ่าย ความพึงพอใจ และ funnel การใช้งาน
          </p>
        </div>
        <Link
          href="/dashboard"
          className="inline-block rounded-full border border-teal px-5 py-3 text-sm font-bold text-teal hover:bg-teal hover:text-white"
        >
          ดู Dashboard
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        <div className="rounded-[1.7rem] bg-white p-5 shadow-card">
          <UsersThree size={32} className="text-teal" />
          <p className="mt-4 text-sm font-bold text-muted">{dashboardPreviewMetrics[0].label}</p>
          <h3 className="mt-1 text-3xl font-extrabold">{dashboardPreviewMetrics[0].value}</h3>
          <p className="body-text mt-1 text-xs text-muted">{dashboardPreviewMetrics[0].note}</p>
        </div>
        <div className="rounded-[1.7rem] bg-white p-5 shadow-card">
          <MapPinLine size={32} className="text-coral" />
          <p className="mt-4 text-sm font-bold text-muted">{dashboardPreviewMetrics[1].label}</p>
          <h3 className="mt-1 text-3xl font-extrabold">{dashboardPreviewMetrics[1].value}</h3>
          <p className="body-text mt-1 text-xs text-muted">{dashboardPreviewMetrics[1].note}</p>
        </div>
        <div className="rounded-[1.7rem] bg-white p-5 shadow-card">
          <Certificate size={32} className="text-gold" />
          <p className="mt-4 text-sm font-bold text-muted">{dashboardPreviewMetrics[2].label}</p>
          <h3 className="mt-1 text-3xl font-extrabold">{dashboardPreviewMetrics[2].value}</h3>
          <p className="body-text mt-1 text-xs text-muted">{dashboardPreviewMetrics[2].note}</p>
        </div>
        <div className="rounded-[1.7rem] bg-white p-5 shadow-card">
          <Star size={32} className="text-leaf" />
          <p className="mt-4 text-sm font-bold text-muted">{dashboardPreviewMetrics[3].label}</p>
          <h3 className="mt-1 text-3xl font-extrabold">{dashboardPreviewMetrics[3].value}</h3>
          <p className="body-text mt-1 text-xs text-muted">{dashboardPreviewMetrics[3].note}</p>
        </div>
      </div>
    </section>
  );
}
