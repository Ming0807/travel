import { PageShell } from "@/components/layout/page-shell";
import { UsersThree, MapPinLine, Certificate, Star, ChartLineUp, Storefront, Backpack } from "@phosphor-icons/react/dist/ssr";
import { getPublicDashboardAnalytics } from "@/lib/services/dashboard.service";

export const metadata = {
  title: "สถิติการท่องเที่ยว | Southern Border Tourism",
  description: "ข้อมูลเชิงสถิติและการวางแผนการท่องเที่ยวชายแดนใต้",
};

export default async function PublicDashboardPage() {
  // Fetch real data without any permission checks
  const analytics = await getPublicDashboardAnalytics({});
  
  // Extract KPIs
  const touristKpi = analytics.kpis.find(k => k.key === "tourist_profiles")?.value || "0";
  const visitsKpi = analytics.kpis.find(k => k.key === "total_visits")?.value || "0";
  const certKpi = analytics.kpis.find(k => k.key === "certificates_generated")?.value || "0";
  const satisfactionKpi = analytics.kpis.find(k => k.key === "average_satisfaction")?.value || "0.0";
  
  // Extract Chart Data (Trend)
  const trend = analytics.executive.visitTrend;
  const maxVisits = trend.length > 0 ? Math.max(...trend.map(t => t.value)) : 1;
  const recentTrend = trend.slice(-7); // Show last 7 periods

  // Province Dist
  const provinces = analytics.executive.visitsByProvince.slice(0, 3); // top 3

  return (
    <PageShell
      title="สถิติการท่องเที่ยวสาธารณะ"
      description="ภาพรวมการเดินทางและความพึงพอใจของนักท่องเที่ยวในพื้นที่ชายแดนใต้"
    >
      <div className="space-y-8">
        {/* Top KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-white p-6 border border-ink/5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal/10">
              <UsersThree size={24} weight="fill" className="text-teal" />
            </div>
            <p className="mt-4 text-sm font-bold text-muted">นักท่องเที่ยวที่ลงทะเบียน</p>
            <h3 className="mt-1 text-3xl font-black text-ink">{touristKpi}</h3>
            <p className="mt-2 text-[11px] font-semibold text-muted/70 uppercase tracking-wider">โปรไฟล์ทั้งหมด</p>
          </div>
          
          <div className="rounded-2xl bg-white p-6 border border-ink/5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-coral/10">
              <MapPinLine size={24} weight="fill" className="text-coral" />
            </div>
            <p className="mt-4 text-sm font-bold text-muted">จำนวนการเช็คอินทั้งหมด</p>
            <h3 className="mt-1 text-3xl font-black text-ink">{visitsKpi}</h3>
            <p className="mt-2 text-[11px] font-semibold text-muted/70 uppercase tracking-wider">จุดเช็คอินที่บันทึกแล้ว</p>
          </div>
          
          <div className="rounded-2xl bg-white p-6 border border-ink/5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10">
              <Certificate size={24} weight="fill" className="text-gold" />
            </div>
            <p className="mt-4 text-sm font-bold text-muted">ใบประกาศที่ถูกสร้าง</p>
            <h3 className="mt-1 text-3xl font-black text-ink">{certKpi}</h3>
            <p className="mt-2 text-[11px] font-semibold text-muted/70 uppercase tracking-wider">รางวัลแห่งการเดินทาง</p>
          </div>
          
          <div className="rounded-2xl bg-white p-6 border border-ink/5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-leaf/10">
              <Star size={24} weight="fill" className="text-leaf" />
            </div>
            <p className="mt-4 text-sm font-bold text-muted">ความพึงพอใจเฉลี่ย</p>
            <h3 className="mt-1 text-3xl font-black text-ink">{satisfactionKpi}</h3>
            <p className="mt-2 text-[11px] font-semibold text-muted/70 uppercase tracking-wider">จากแบบประเมินผู้ใช้จริง</p>
          </div>
        </div>

        {/* Charts / Details Area */}
        <div className="grid gap-6 lg:grid-cols-3">
          
          <div className="rounded-2xl bg-white p-6 border border-ink/5 lg:col-span-2 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-ink">แนวโน้มการเช็คอินล่าสุด</h3>
              <ChartLineUp size={24} className="text-muted" />
            </div>
            
            <div className="h-64 w-full rounded-xl bg-slate-50 flex items-center justify-center border border-ink/5 relative overflow-hidden">
              {recentTrend.length > 0 ? (
                <div className="absolute inset-x-0 bottom-0 flex h-4/5 items-end justify-between px-8 pb-4">
                  {recentTrend.map((pt, i) => {
                    const heightPercent = maxVisits > 0 ? (pt.value / maxVisits) * 100 : 0;
                    return (
                      <div key={pt.label || i} className="flex flex-col items-center justify-end h-full w-full gap-2 group">
                        <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-ink text-white text-xs font-bold py-1 px-2 rounded">
                          {pt.value}
                        </div>
                        <div 
                          className="w-full max-w-[48px] rounded-t-lg bg-teal/40 group-hover:bg-teal transition-colors" 
                          style={{ height: `${heightPercent}%`, minHeight: pt.value > 0 ? '4px' : '0' }}
                        ></div>
                        <span className="text-[10px] font-bold text-muted truncate max-w-full" title={pt.label}>
                          {new Date(pt.label).toLocaleDateString('th-TH', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-muted font-medium text-sm">ยังไม่มีข้อมูลแนวโน้ม</p>
              )}
            </div>
          </div>
          
          <div className="rounded-2xl bg-white p-6 border border-ink/5 shadow-sm flex flex-col">
            <h3 className="text-lg font-bold text-ink mb-6">จังหวัดยอดนิยม</h3>
            <div className="flex-1 flex flex-col justify-center space-y-6">
              {provinces.length > 0 ? provinces.map((prov, i) => {
                const colors = ["bg-teal text-teal", "bg-coral text-coral", "bg-blue-600 text-blue-600"];
                const colorCls = colors[i % colors.length];
                const [bgCls, textCls] = colorCls.split(' ');
                
                return (
                  <div key={prov.label}>
                    <div className="flex justify-between text-sm font-bold mb-2">
                      <span className="text-ink">{prov.label}</span>
                      <span className={textCls}>{prov.percent ? Math.round(prov.percent * 100) : 0}%</span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-slate-50 overflow-hidden">
                      <div className={`h-full rounded-full ${bgCls}`} style={{ width: `${(prov.percent || 0) * 100}%` }}></div>
                    </div>
                  </div>
                );
              }) : (
                <p className="text-muted font-medium text-sm text-center">ยังไม่มีข้อมูลจังหวัด</p>
              )}
            </div>
          </div>
          
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl bg-teal/5 p-6 border border-teal/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-teal/10 rounded-xl text-teal">
                <Storefront size={24} weight="fill" />
              </div>
              <h3 className="font-bold text-ink">กระตุ้นเศรษฐกิจท้องถิ่น</h3>
            </div>
            <p className="text-sm text-muted leading-relaxed">
              ผู้ประกอบการสามารถนำข้อมูลไปใช้วางแผนการตลาดและพัฒนาบริการให้ตรงจุด
              ข้อมูลทั้งหมดแสดงในรูปแบบสถิติภาพรวมเพื่อปกป้องความเป็นส่วนตัวของนักท่องเที่ยว
            </p>
          </div>
          
          <div className="rounded-2xl bg-coral/5 p-6 border border-coral/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-coral/10 rounded-xl text-coral">
                <Backpack size={24} weight="fill" />
              </div>
              <h3 className="font-bold text-ink">พัฒนาแหล่งท่องเที่ยว</h3>
            </div>
            <p className="text-sm text-muted leading-relaxed">
              สถิติการใช้งานช่วยบ่งชี้ถึงจุดที่ได้รับความนิยม และจุดที่ควรได้รับการพัฒนา
              เพื่อยกระดับการท่องเที่ยวในพื้นที่ให้ดียิ่งขึ้นอย่างยั่งยืน
            </p>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
