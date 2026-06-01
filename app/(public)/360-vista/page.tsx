import Link from "next/link";
import { ArrowSquareOut, Compass } from "@phosphor-icons/react/dist/ssr";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { VISTA_360_EXTERNAL_URL } from "@/constants/product";

const places = [
  {
    name: "Yala City 360° Virtual Tour",
    description: "สำรวจยะลาแบบ 360 องศา สัมผัสบรรยากาศสถานที่สำคัญในเมืองยะลา ไม่ว่าจะเป็นมัสยิดกลาง ตลาดนัดมะพร้าว สะพานดำ และสถานที่ท่องเที่ยวอื่นๆ เสมือนจริง",
    province: "ยะลา",
    spots: ["มัสยิดกลางยะลา", "ตลาดนัดมะพร้าว", "สะพานดำ", "จุดชมวิวใจกลางเมือง"],
  },
];

export const metadata = {
  title: "360° Virtual Tour | Southern Border Explorer",
  description: "สำรวจสถานที่ท่องเที่ยวในพื้นที่ชายแดนใต้แบบ 360 องศา เสมือนจริง ผ่านระบบ 360 Vista",
};

export default function Vista360Page() {
  return (
    <main className="bg-background min-h-screen text-ink">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 md:pt-24 pb-20">
        
        {/* Breadcrumb */}
        <div className="flex gap-2 text-xs font-bold text-muted uppercase tracking-widest mb-6">
          <Link href="/" className="hover:text-coral transition-colors">หน้าแรก</Link>
          <span>/</span>
          <span className="text-ink">ภาพจำลองเสมือนจริง 360 องศา</span>
        </div>

        {/* Hero Section */}
        <div className="flex flex-col lg:flex-row justify-between gap-12 lg:gap-16 items-start mb-16">
          <div className="lg:w-1/2 pt-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 text-blue-700 px-4 py-1.5 text-xs font-bold mb-6">
              <Compass size={14} weight="fill" />
              ระบบภายนอก - เชื่อมต่อกับ 360 Vista
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-ink mb-6 leading-tight">
              360° <span className="text-coral">Virtual Tour</span>
              <br />ยะลา
            </h1>
            <p className="text-muted leading-relaxed text-base md:text-lg max-w-lg mb-8">
              สัมผัสประสบการณ์เสมือนจริงในการท่องเที่ยวจังหวัดยะลา 
              ผ่านระบบ 360 Vista — โปรเจกต์ระบบภาพเสมือนจริงของสถานที่ท่องเที่ยว 
              ที่จะพาคุณไปชมบรรยากาศสถานที่สำคัญแบบ 360 องศา
            </p>
            <a
              href={VISTA_360_EXTERNAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-coral text-white px-8 py-4 rounded-full text-sm font-bold shadow-lg hover:bg-coral/90 transition-all hover:shadow-xl"
            >
              <Compass size={22} weight="fill" />
              เปิด 360 Vista
              <ArrowSquareOut size={18} weight="bold" />
            </a>
          </div>

          {/* Preview Card */}
          <div className="lg:w-1/2 w-full">
            <a
              href={VISTA_360_EXTERNAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group block relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-lg border border-ink/5 bg-[#EAF2F0]"
            >
              <div className="absolute inset-0 bg-[linear-gradient(135deg,#EAF2F0_0%,#F8EDE7_58%,#173F37_100%)] transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_center,rgba(255,255,255,.8)_1px,transparent_1px)] [background-size:28px_28px]" />
              <div className="absolute inset-8 rounded-xl border border-white/60 bg-white/25 backdrop-blur-sm" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border-2 border-white/40 group-hover:scale-110 transition-transform duration-300">
                  <Compass size={36} className="text-white" weight="fill" />
                </div>
              </div>
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <p className="text-lg font-bold mb-1">คลิกเพื่อเปิด 360° Virtual Tour</p>
                <p className="text-sm text-white/80">Yala City — ยะลา</p>
              </div>
            </a>
          </div>
        </div>

        {/* Info Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-8 border border-ink/5">
              <h2 className="text-2xl font-black text-ink mb-6">เกี่ยวกับ 360 Vista</h2>
              <div className="space-y-4 text-muted leading-relaxed">
                <p>
                  <strong className="text-ink">360 Vista</strong> เป็นโปรเจกต์ระบบภาพเสมือนจริง 
                  (Virtual Tour) ของสถานที่ท่องเที่ยวในพื้นที่จังหวัดชายแดนใต้ 
                  โดยพัฒนาโดยทีมงานอีกกลุ่มหนึ่ง ซึ่งระบบของเรา (Southern Border Explorer) 
                  ได้เชื่อมโยงข้อมูลเพื่อให้นักท่องเที่ยวสามารถเข้าถึงประสบการณ์เสมือนจริงได้
                </p>
                <p>
                  เมื่อผู้ใช้คลิกเข้าไปที่ 360 Vista จะสามารถ:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>ชมบรรยากาศสถานที่ท่องเที่ยวแบบ 360 องศา</li>
                  <li>เลือกสถานที่ต่างๆ ในจังหวัดยะลา</li>
                  <li>สัมผัสประสบการณ์เสมือนจริงผ่านมุมมองรอบทิศทาง</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-ink/5">
            <h3 className="font-black text-ink text-lg mb-4">สถานที่ใน 360 Vista</h3>
            <div className="space-y-3">
              {places[0].spots.map((spot, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-coral" />
                  <span className="text-sm font-semibold text-ink">{spot}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t border-ink/5">
              <p className="text-xs text-muted">
                ระบบ 360 Vista เป็นระบบภายนอกที่พัฒนาโดยโปรเจกต์อื่น 
                ระบบของเราทำหน้าที่เชื่อมโยงและนำทางไปยังระบบดังกล่าวเท่านั้น
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <a
            href={VISTA_360_EXTERNAL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-ink text-white px-10 py-5 rounded-full text-base font-bold shadow-lg hover:bg-[#073F37] transition-all hover:shadow-xl"
          >
            <Compass size={24} weight="fill" />
            เปิด 360 Vista — Yala City Virtual Tour
            <ArrowSquareOut size={20} weight="bold" />
          </a>
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}
