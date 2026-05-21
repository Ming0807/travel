import { PageShell } from "@/components/layout/page-shell";
import { UsersThree, MapPinLine, Certificate, Star, ChartLineUp, Storefront, Backpack } from "@phosphor-icons/react/dist/ssr";

export const metadata = {
  title: "สถิติการท่องเที่ยว | Southern Border Tourism",
  description: "ข้อมูลเชิงสถิติและการวางแผนการท่องเที่ยวชายแดนใต้",
};

export default function PublicDashboardPage() {
  return (
    <PageShell
      title="สถิติการท่องเที่ยวสาธารณะ"
      description="ภาพรวมการเดินทางและความพึงพอใจของนักท่องเที่ยวในพื้นที่ชายแดนใต้"
    >
      <div className="space-y-8">
        {/* Top KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-3xl bg-white p-6 shadow-sm border border-ink/5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal/10">
              <UsersThree size={24} weight="fill" className="text-teal" />
            </div>
            <p className="mt-4 text-sm font-bold text-muted">นักท่องเที่ยวที่ลงทะเบียน</p>
            <h3 className="mt-1 text-3xl font-bold text-ink">5,240</h3>
            <p className="mt-2 text-xs leading-relaxed text-muted/70">+12% จากเดือนที่แล้ว</p>
          </div>
          
          <div className="rounded-3xl bg-white p-6 shadow-sm border border-ink/5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-coral/10">
              <MapPinLine size={24} weight="fill" className="text-coral" />
            </div>
            <p className="mt-4 text-sm font-bold text-muted">จำนวนการเช็คอินทั้งหมด</p>
            <h3 className="mt-1 text-3xl font-bold text-ink">8,942</h3>
            <p className="mt-2 text-xs leading-relaxed text-muted/70">+18% จากเดือนที่แล้ว</p>
          </div>
          
          <div className="rounded-3xl bg-white p-6 shadow-sm border border-ink/5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/10">
              <Certificate size={24} weight="fill" className="text-gold" />
            </div>
            <p className="mt-4 text-sm font-bold text-muted">ใบประกาศที่ถูกสร้าง</p>
            <h3 className="mt-1 text-3xl font-bold text-ink">7,880</h3>
            <p className="mt-2 text-xs leading-relaxed text-muted/70">88% ของการเช็คอินทั้งหมด</p>
          </div>
          
          <div className="rounded-3xl bg-white p-6 shadow-sm border border-ink/5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-leaf/10">
              <Star size={24} weight="fill" className="text-leaf" />
            </div>
            <p className="mt-4 text-sm font-bold text-muted">ความพึงพอใจเฉลี่ย</p>
            <h3 className="mt-1 text-3xl font-bold text-ink">4.6/5</h3>
            <p className="mt-2 text-xs leading-relaxed text-muted/70">จากแบบประเมิน 3,200 ชุด</p>
          </div>
        </div>

        {/* Charts / Details Area (Mockup for now) */}
        <div className="grid gap-6 lg:grid-cols-3">
          
          <div className="rounded-3xl bg-white p-6 shadow-sm border border-ink/5 lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-ink">แนวโน้มการเช็คอิน (รายเดือน)</h3>
              <ChartLineUp size={24} className="text-muted" />
            </div>
            
            <div className="h-64 w-full rounded-xl bg-cream flex items-center justify-center border border-ink/5 relative overflow-hidden">
              {/* Mock Bar Chart using CSS */}
              <div className="absolute inset-x-0 bottom-0 flex h-4/5 items-end justify-between px-8 pb-4">
                {[40, 55, 45, 70, 65, 85, 100].map((height, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 w-full mx-1">
                    <div 
                      className="w-full max-w-[48px] rounded-t-lg bg-teal/40 hover:bg-teal transition-colors" 
                      style={{ height: `${height}%` }}
                    ></div>
                    <span className="text-xs font-bold text-muted">M{i+1}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="rounded-3xl bg-white p-6 shadow-sm border border-ink/5 flex flex-col">
            <h3 className="text-lg font-bold text-ink mb-6">จังหวัดยอดนิยม</h3>
            <div className="flex-1 flex flex-col justify-center space-y-6">
              <div>
                <div className="flex justify-between text-sm font-bold mb-2">
                  <span className="text-ink">ยะลา</span>
                  <span className="text-teal">45%</span>
                </div>
                <div className="h-3 w-full rounded-full bg-cream overflow-hidden">
                  <div className="h-full rounded-full bg-teal w-[45%]"></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm font-bold mb-2">
                  <span className="text-ink">ปัตตานี</span>
                  <span className="text-coral">35%</span>
                </div>
                <div className="h-3 w-full rounded-full bg-cream overflow-hidden">
                  <div className="h-full rounded-full bg-coral w-[35%]"></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm font-bold mb-2">
                  <span className="text-ink">นราธิวาส</span>
                  <span className="text-blue-600">20%</span>
                </div>
                <div className="h-3 w-full rounded-full bg-cream overflow-hidden">
                  <div className="h-full rounded-full bg-blue-600 w-[20%]"></div>
                </div>
              </div>
            </div>
          </div>
          
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-3xl bg-teal/5 p-6 border border-teal/10">
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
          
          <div className="rounded-3xl bg-coral/5 p-6 border border-coral/10">
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
