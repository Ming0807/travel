import Link from "next/link";
import { UsersThree, MapPinLine, Certificate, Star, ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { dashboardPreviewMetrics } from "../homepage-data";

export function HomepageDashboardPreview() {
  return (
    <section id="dashboard" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="mb-12 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-coral">
            Live Tourism Insights
          </p>
          <h2 className="mt-3 text-4xl font-bold leading-tight lg:text-5xl text-ink">
            ข้อมูลอินไซต์สำหรับการวางแผน
          </h2>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted">
            ตัวเลขสถิติสาธารณะแบบเรียลไทม์จากระบบเช็คอิน ช่วยให้ผู้ประกอบการและนักท่องเที่ยว
            เห็นภาพรวมความนิยม รูปแบบการเดินทาง และระดับความพึงพอใจ
          </p>
        </div>
        <Link
          href="/dashboard"
          className="group inline-flex items-center gap-2 rounded-full border-2 border-ink/10 px-6 py-3 text-sm font-bold text-ink hover:border-ink hover:bg-ink hover:text-white transition-all"
        >
          ดูหน้าแดชบอร์ดสถิติ
          <ArrowRight className="transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-ink/5 hover:border-teal/30 hover:shadow-md transition-all group">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cream group-hover:bg-teal group-hover:text-white transition-colors">
            <UsersThree size={24} weight="fill" className="text-teal group-hover:text-white" />
          </div>
          <p className="mt-6 text-sm font-bold text-muted">{dashboardPreviewMetrics[0].label}</p>
          <h3 className="mt-2 text-3xl font-bold text-ink">{dashboardPreviewMetrics[0].value}</h3>
          <p className="mt-2 text-xs leading-relaxed text-muted/70">{dashboardPreviewMetrics[0].note}</p>
        </div>
        
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-ink/5 hover:border-coral/30 hover:shadow-md transition-all group">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cream group-hover:bg-coral group-hover:text-white transition-colors">
            <MapPinLine size={24} weight="fill" className="text-coral group-hover:text-white" />
          </div>
          <p className="mt-6 text-sm font-bold text-muted">{dashboardPreviewMetrics[1].label}</p>
          <h3 className="mt-2 text-3xl font-bold text-ink">{dashboardPreviewMetrics[1].value}</h3>
          <p className="mt-2 text-xs leading-relaxed text-muted/70">{dashboardPreviewMetrics[1].note}</p>
        </div>
        
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-ink/5 hover:border-gold/30 hover:shadow-md transition-all group">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cream group-hover:bg-gold group-hover:text-white transition-colors">
            <Certificate size={24} weight="fill" className="text-gold group-hover:text-white" />
          </div>
          <p className="mt-6 text-sm font-bold text-muted">{dashboardPreviewMetrics[2].label}</p>
          <h3 className="mt-2 text-3xl font-bold text-ink">{dashboardPreviewMetrics[2].value}</h3>
          <p className="mt-2 text-xs leading-relaxed text-muted/70">{dashboardPreviewMetrics[2].note}</p>
        </div>
        
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-ink/5 hover:border-leaf/30 hover:shadow-md transition-all group">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cream group-hover:bg-leaf group-hover:text-white transition-colors">
            <Star size={24} weight="fill" className="text-leaf group-hover:text-white" />
          </div>
          <p className="mt-6 text-sm font-bold text-muted">{dashboardPreviewMetrics[3].label}</p>
          <h3 className="mt-2 text-3xl font-bold text-ink">{dashboardPreviewMetrics[3].value}</h3>
          <p className="mt-2 text-xs leading-relaxed text-muted/70">{dashboardPreviewMetrics[3].note}</p>
        </div>
      </div>
    </section>
  );
}
