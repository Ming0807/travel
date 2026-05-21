import { QrCode, DeviceMobile, Certificate, Stamp } from "@phosphor-icons/react/dist/ssr";

const steps = [
  {
    num: "01",
    icon: QrCode,
    label: "Scan QR",
    desc: "สแกน QR ที่จุดถ่ายรูป ระบบรู้ทันทีว่าอยู่จังหวัด สถานที่ และจุดเช็กอินใด",
    accent: "bg-teal text-white",
    iconBg: "bg-white/20",
  },
  {
    num: "02",
    icon: DeviceMobile,
    label: "Upload Photo",
    desc: "กรอกชื่อที่ต้องการแสดง จังหวัด/ประเทศ ช่วงอายุ และอัปโหลดรูปสำหรับบัตรที่ระลึก",
    accent: "bg-coral text-white",
    iconBg: "bg-white/20",
  },
  {
    num: "03",
    icon: Certificate,
    label: "Get Certificate",
    desc: "ระบบสร้างใบประกาศดิจิทัลให้ดาวน์โหลดและแชร์ได้ โดยไม่บังคับ Login ก่อน",
    accent: "bg-gold text-white",
    iconBg: "bg-white/20",
  },
  {
    num: "04",
    icon: Stamp,
    label: "Collect Stamp",
    desc: "รับตราประทับในพาสปอร์ต แล้วเลือกตอบ Micro Survey เพิ่มเติมเพื่อช่วยพัฒนาพื้นที่",
    accent: "bg-sky-500 text-white",
    iconBg: "bg-white/20",
  },
];

export function HomepageHowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">

      {/* Header — asymmetric layout */}
      <div className="mb-14 grid lg:grid-cols-[1fr_auto] lg:items-end gap-8">
        <div>
          <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-teal">
            <span className="block h-px w-6 bg-teal" />
            How it works
          </p>
          <h2 className="mt-5 font-['Sarabun'] text-4xl font-extrabold leading-[1.15] lg:text-5xl">
            ใช้งานง่ายเหมือนแอป
            <br />
            <span className="text-teal">แต่ไม่ต้องโหลดแอป</span>
          </h2>
          <p className="mt-4 max-w-lg text-[15px] leading-7 text-muted">
            ระบบออกแบบให้เริ่มจากการให้คุณค่าก่อน — นักท่องเที่ยวกรอกน้อยที่สุด
            รับใบประกาศก่อน แล้วค่อยตอบข้อมูลเพิ่มเติมแบบสมัครใจ
          </p>
        </div>

        <button className="group self-end rounded-full border border-teal px-6 py-3 text-sm font-semibold text-teal transition-all hover:bg-teal hover:text-white">
          ดูตัวอย่าง Flow
          <span className="ml-1 inline-block transition-transform group-hover:translate-x-0.5">→</span>
        </button>
      </div>

      {/* Steps — horizontal timeline with connector lines */}
      <div className="relative">
        {/* connector line (desktop) */}
        <div
          className="absolute top-10 left-0 right-0 mx-auto hidden h-px lg:block"
          style={{
            left: "calc(12.5% + 28px)",
            right: "calc(12.5% + 28px)",
            background: "linear-gradient(to right, var(--color-teal, #0d9488), transparent 100%)",
            opacity: 0.2,
          }}
        />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(({ num, icon: Icon, label, desc, accent }) => (
            <div key={num} className="group relative flex flex-col">
              {/* Step number badge + icon row */}
              <div className="mb-5 flex items-center gap-4">
                <div
                  className={`relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${accent} transition-transform duration-300 group-hover:-translate-y-1`}
                >
                  <Icon size={26} weight="duotone" />
                </div>
                <span
                  className="font-['Roboto_Mono',monospace] text-[40px] font-bold leading-none tracking-tight text-black/[0.06] select-none"
                  aria-hidden="true"
                >
                  {num}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1 border-l-2 border-dashed border-black/10 pl-4">
                <h3 className="text-base font-extrabold tracking-tight">{label}</h3>
                <p className="mt-1.5 text-[13.5px] leading-[1.65] text-muted">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA strip */}
      <div className="mt-14 flex items-center justify-between rounded-2xl border border-dashed border-teal/30 bg-tealSoft/40 px-6 py-4">
        <p className="text-sm font-medium text-teal">
          ครบ 4 จุดเช็กอิน รับรางวัลพิเศษ 🎁
        </p>
        <button className="rounded-full bg-teal px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-opacity hover:opacity-80">
          เริ่มต้นเลย
        </button>
      </div>
    </section>
  );
}
