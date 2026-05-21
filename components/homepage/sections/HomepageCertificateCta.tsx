import Image from "next/image";
import { DownloadSimple, ShareNetwork, Certificate, Stamp } from "@phosphor-icons/react/dist/ssr";

export function HomepageCertificateCta() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-6">
      <div className="grid overflow-hidden rounded-[2rem] bg-teal shadow-soft lg:grid-cols-[1fr_0.8fr] lg:rounded-[2.7rem]">
        <div className="relative p-7 text-white lg:p-12">
          <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl"></div>
          <p className="relative inline-flex rounded-full bg-white/15 px-4 py-2 text-xs font-bold text-[#FFD7B5]">
            Reward-first Experience
          </p>
          <h2 className="relative mt-5 text-3xl font-extrabold leading-tight lg:text-5xl">
            สแกน QR รับใบประกาศ<br className="hidden sm:block" />และเริ่มสะสมตราประทับ
          </h2>
          <p className="body-text relative mt-5 max-w-xl text-base leading-7 text-white/80">
            ผู้ใช้ไม่ต้องโหลดแอป ไม่ต้อง Login ก่อน และไม่ต้องกรอกข้อมูลยาว ๆ เริ่มจากรับคุณค่าก่อน
            แล้วค่อยตอบแบบสอบถามเพิ่มเติมแบบสมัครใจ
          </p>

          <div className="relative mt-7 flex flex-col gap-3 sm:flex-row">
            <button className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-extrabold text-teal shadow-card hover:scale-[1.02]">
              จำลองดาวน์โหลดใบประกาศ
              <DownloadSimple size={20} />
            </button>
            <button className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 bg-white/15 px-6 py-3.5 text-sm font-extrabold text-white backdrop-blur-xl hover:bg-white/25">
              แชร์ความทรงจำ
              <ShareNetwork size={20} />
            </button>
          </div>
        </div>

        <div className="relative grid place-items-center p-7 lg:p-12">
          <div className="relative w-full max-w-[310px] rotate-2 rounded-[2rem] bg-white p-4 shadow-soft transition hover:rotate-0">
            <div className="text-center">
              <Certificate weight="fill" size={36} className="mx-auto text-gold" />
              <p className="mt-1 text-xs font-bold uppercase tracking-[0.25em] text-coral">Travel Memory</p>
              <h3 className="text-xl font-extrabold text-teal">Digital Certificate</h3>
            </div>
            <div className="mt-4 overflow-hidden rounded-3xl">
              <Image
                className="h-44 w-full object-cover"
                src="https://images.unsplash.com/photo-1549880181-56a44cf4a9a1?auto=format&fit=crop&w=600&q=85"
                alt="Certificate image"
                width={600}
                height={200}
                unoptimized
              />
            </div>
            <div className="p-4 text-center">
              <p className="body-text text-xs text-muted">This certifies that</p>
              <p className="mt-1 text-2xl font-extrabold">นักเดินทาง</p>
              <p className="body-text mt-1 text-xs text-muted">has visited</p>
              <p className="mt-1 font-bold text-teal">จุดชมวิวทะเลหมอกอัยเยอร์เวง</p>
              <p className="body-text mt-2 text-xs text-muted">Yala · 20 May 2026</p>
            </div>
            <div className="absolute -bottom-5 -right-5 grid h-20 w-20 place-items-center rounded-full bg-gold text-white shadow-card ring-4 ring-white">
              <div className="text-center">
                <Stamp weight="fill" size={24} className="mx-auto" />
                <p className="text-[10px] font-extrabold">YALA</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
