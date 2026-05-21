import { QrCode, Certificate, Stamp, ChartLineUp } from "@phosphor-icons/react/dist/ssr";

export function HomepageDataJourney() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-6 lg:py-14">
      <div className="rounded-[2.4rem] bg-ink p-8 text-white shadow-soft lg:p-12">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-extrabold lg:text-4xl">The Data Journey</h2>
          <p className="body-text mt-3 text-white/70">
            ทุกขั้นตอนออกแบบมาเพื่อให้คุณค่าแก่นักท่องเที่ยวก่อน และสร้างข้อมูลที่เป็นประโยชน์ต่อพื้นที่
          </p>
        </div>
        
        <div className="relative mt-10 grid gap-6 md:grid-cols-4">
          {/* Connecting Line (Desktop) */}
          <div className="absolute top-8 left-[12.5%] hidden h-0.5 w-[75%] bg-white/10 md:block"></div>

          <div className="relative z-10 text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-ink text-tealSoft ring-4 ring-white/10">
              <QrCode size={32} />
            </div>
            <h3 className="mt-4 font-extrabold">1. QR Scan</h3>
            <p className="body-text mt-1 text-sm text-white/70">เข้าถึงง่ายจากจุดท่องเที่ยวจริง ไม่ต้องโหลดแอป</p>
          </div>
          
          <div className="relative z-10 text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-ink text-gold ring-4 ring-white/10">
              <Certificate size={32} />
            </div>
            <h3 className="mt-4 font-extrabold">2. Certificate</h3>
            <p className="body-text mt-1 text-sm text-white/70">ของที่ระลึกดิจิทัลที่แชร์ได้ทันที</p>
          </div>
          
          <div className="relative z-10 text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-ink text-coral ring-4 ring-white/10">
              <Stamp size={32} />
            </div>
            <h3 className="mt-4 font-extrabold">3. Stamp</h3>
            <p className="body-text mt-1 text-sm text-white/70">สะสมในพาสปอร์ตส่วนตัว</p>
          </div>
          
          <div className="relative z-10 text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-ink text-leaf ring-4 ring-white/10">
              <ChartLineUp size={32} />
            </div>
            <h3 className="mt-4 font-extrabold">4. Survey</h3>
            <p className="body-text mt-1 text-sm text-white/70">ตอบแบบสอบถามสั้นๆ ช่วยพัฒนาพื้นที่</p>
          </div>
        </div>
      </div>
    </section>
  );
}
