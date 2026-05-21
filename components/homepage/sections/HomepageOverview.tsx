import Image from "next/image";
import { GlobeHemisphereEast, Gift, ShieldCheck, ChartLineUp, DeviceMobile } from "@phosphor-icons/react/dist/ssr";

export function HomepageOverview() {
  return (
    <section id="overview" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-6 lg:py-14">
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div className="relative overflow-hidden rounded-[2.4rem] bg-ink shadow-soft">
          <Image
            className="h-[420px] w-full object-cover opacity-80"
            src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1200&q=85"
            alt="Map concept"
            width={1200}
            height={420}
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent"></div>

          <div className="absolute bottom-6 left-6 right-6 rounded-[1.6rem] border border-white/20 bg-white/15 p-5 text-white backdrop-blur-xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#FFD7B5]">Project Area</p>
            <h3 className="mt-1 text-2xl font-extrabold">Yala · Pattani · Narathiwat</h3>
            <p className="body-text mt-2 text-sm leading-6 text-white/80">
              เชื่อมโยงข้อมูลจากจุดท่องเที่ยวจริง เพื่อใช้วางแผนพัฒนาการท่องเที่ยวชายแดนใต้อย่างยั่งยืน
            </p>
          </div>
        </div>

        <div className="rounded-[2.4rem] border border-white bg-white/80 p-6 shadow-card backdrop-blur-xl lg:p-9">
          <span className="section-label">
            <GlobeHemisphereEast size={16} /> Why this platform matters
          </span>
          <h2 className="mt-5 text-3xl font-extrabold leading-tight lg:text-5xl">
            เว็บท่องเที่ยวที่ไม่ได้แค่สวย<br className="hidden lg:block" />
            แต่สร้างฐานข้อมูลได้จริง
          </h2>
          <p className="body-text mt-5 text-base leading-8 text-muted">
            จุดแข็งของระบบคือเปลี่ยนการเก็บข้อมูลจาก “แบบสอบถามที่ผู้ใช้ไม่อยากกรอก”
            ให้กลายเป็นประสบการณ์ท่องเที่ยวที่นักท่องเที่ยวอยากทำ
            เพราะเขาได้รับใบประกาศและตราประทับเป็นของที่ระลึก
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-3xl bg-cream p-4">
              <Gift size={24} className="text-gold" />
              <h4 className="mt-2 font-extrabold">Reward-first</h4>
              <p className="body-text mt-1 text-sm text-muted">ให้คุณค่าก่อน แล้วค่อยชวนตอบข้อมูลเพิ่มเติม</p>
            </div>
            <div className="rounded-3xl bg-tealSoft p-4">
              <ShieldCheck size={24} className="text-teal" />
              <h4 className="mt-2 font-extrabold">Privacy-aware</h4>
              <p className="body-text mt-1 text-sm text-muted">ไม่ขอชื่อจริง เบอร์โทร หรือข้อมูลอ่อนไหวโดยไม่จำเป็น</p>
            </div>
            <div className="rounded-3xl bg-[#FFF0E8] p-4">
              <ChartLineUp size={24} className="text-coral" />
              <h4 className="mt-2 font-extrabold">Planning Data</h4>
              <p className="body-text mt-1 text-sm text-muted">ข้อมูลต่อยอดเป็น Dashboard และรายงานเชิงนโยบาย</p>
            </div>
            <div className="rounded-3xl bg-skySoft p-4">
              <DeviceMobile size={24} className="text-blue-600" />
              <h4 className="mt-2 font-extrabold">No App Install</h4>
              <p className="body-text mt-1 text-sm text-muted">ใช้ผ่านเว็บ/PWA เหมือนแอปบนมือถือ</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
