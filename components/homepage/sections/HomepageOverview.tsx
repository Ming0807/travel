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

        <div className="rounded-[2.4rem] border border-ink/5 bg-cream p-6 shadow-sm lg:p-9">
          <span className="inline-flex items-center gap-2 rounded-full bg-teal/10 px-4 py-2 text-xs font-bold text-teal">
            <GlobeHemisphereEast size={16} /> ทำไมต้องแพลตฟอร์มนี้?
          </span>
          <h2 className="mt-5 text-3xl font-bold leading-tight lg:text-5xl text-ink">
            เว็บท่องเที่ยวที่ไม่ได้แค่สวย<br className="hidden lg:block" />
            แต่สร้างฐานข้อมูลได้จริง
          </h2>
          <p className="mt-5 text-base leading-relaxed text-muted">
            จุดแข็งของระบบคือเปลี่ยนการเก็บข้อมูลจาก “แบบสอบถามที่ผู้ใช้ไม่อยากกรอก”
            ให้กลายเป็นประสบการณ์ท่องเที่ยวที่นักท่องเที่ยวอยากทำ
            เพราะเขาได้รับใบประกาศและตราประทับเป็นของที่ระลึก
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-white p-5 border border-ink/5">
              <Gift size={24} className="text-gold" />
              <h4 className="mt-3 font-bold text-ink">Reward-first</h4>
              <p className="mt-1 text-sm text-muted">ให้คุณค่าก่อน แล้วค่อยชวนตอบข้อมูลเพิ่มเติม</p>
            </div>
            <div className="rounded-3xl bg-white p-5 border border-ink/5">
              <ShieldCheck size={24} className="text-teal" />
              <h4 className="mt-3 font-bold text-ink">Privacy-aware</h4>
              <p className="mt-1 text-sm text-muted">ไม่ขอชื่อจริง เบอร์โทร หรือข้อมูลอ่อนไหวโดยไม่จำเป็น</p>
            </div>
            <div className="rounded-3xl bg-white p-5 border border-ink/5">
              <ChartLineUp size={24} className="text-coral" />
              <h4 className="mt-3 font-bold text-ink">Planning Data</h4>
              <p className="mt-1 text-sm text-muted">ข้อมูลต่อยอดเป็น Dashboard และรายงานเชิงนโยบาย</p>
            </div>
            <div className="rounded-3xl bg-white p-5 border border-ink/5">
              <DeviceMobile size={24} className="text-blue-600" />
              <h4 className="mt-3 font-bold text-ink">No App Install</h4>
              <p className="mt-1 text-sm text-muted">ใช้ผ่านเว็บ/PWA เหมือนแอปบนมือถือ</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
