import Link from "next/link";
import { UsersThree, MapPinLine, Certificate, Star, ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { getPublicDashboardAnalytics } from "@/lib/services/dashboard.service";

export async function HomepageDashboardPreview() {
  const analytics = await getPublicDashboardAnalytics({});
  
  const touristKpi = analytics.kpis.find(k => k.key === "tourist_profiles")?.value || "0";
  const visitsKpi = analytics.kpis.find(k => k.key === "total_visits")?.value || "0";
  const certKpi = analytics.kpis.find(k => k.key === "certificates_generated")?.value || "0";
  const satisfactionKpi = analytics.kpis.find(k => k.key === "average_satisfaction")?.value || "0.0";

  return (
    <section id="dashboard" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="mb-12 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
        <div>
          <div className="flex items-center gap-3">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-coral">
              ข้อมูลเชิงลึกการท่องเที่ยวแบบเรียลไทม์
            </p>
            <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Live Data
            </span>
          </div>
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
        <div className="rounded-2xl bg-white p-6 border border-ink/5 hover:border-teal/30 hover:shadow-md transition-all group">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 group-hover:bg-teal group-hover:text-white transition-colors">
            <UsersThree size={24} weight="fill" className="text-teal group-hover:text-white" />
          </div>
          <p className="mt-6 text-sm font-bold text-muted">นักท่องเที่ยวที่ลงทะเบียน</p>
          <h3 className="mt-2 text-3xl font-black text-ink">{touristKpi}</h3>
          <p className="mt-2 text-xs font-medium text-muted/70 uppercase tracking-wider">โปรไฟล์ทั้งหมด</p>
        </div>
        
        <div className="rounded-2xl bg-white p-6 border border-ink/5 hover:border-coral/30 hover:shadow-md transition-all group">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 group-hover:bg-coral group-hover:text-white transition-colors">
            <MapPinLine size={24} weight="fill" className="text-coral group-hover:text-white" />
          </div>
          <p className="mt-6 text-sm font-bold text-muted">จำนวนการเช็คอินทั้งหมด</p>
          <h3 className="mt-2 text-3xl font-black text-ink">{visitsKpi}</h3>
          <p className="mt-2 text-xs font-medium text-muted/70 uppercase tracking-wider">จุดเช็คอินที่บันทึกแล้ว</p>
        </div>
        
        <div className="rounded-2xl bg-white p-6 border border-ink/5 hover:border-gold/30 hover:shadow-md transition-all group">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 group-hover:bg-gold group-hover:text-white transition-colors">
            <Certificate size={24} weight="fill" className="text-gold group-hover:text-white" />
          </div>
          <p className="mt-6 text-sm font-bold text-muted">ใบประกาศที่ถูกสร้าง</p>
          <h3 className="mt-2 text-3xl font-black text-ink">{certKpi}</h3>
          <p className="mt-2 text-xs font-medium text-muted/70 uppercase tracking-wider">รางวัลแห่งการเดินทาง</p>
        </div>
        
        <div className="rounded-2xl bg-white p-6 border border-ink/5 hover:border-leaf/30 hover:shadow-md transition-all group">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 group-hover:bg-leaf group-hover:text-white transition-colors">
            <Star size={24} weight="fill" className="text-leaf group-hover:text-white" />
          </div>
          <p className="mt-6 text-sm font-bold text-muted">ความพึงพอใจเฉลี่ย</p>
          <h3 className="mt-2 text-3xl font-black text-ink">{satisfactionKpi}</h3>
          <p className="mt-2 text-xs font-medium text-muted/70 uppercase tracking-wider">จากแบบประเมินผู้ใช้จริง</p>
        </div>
      </div>
    </section>
  );
}
