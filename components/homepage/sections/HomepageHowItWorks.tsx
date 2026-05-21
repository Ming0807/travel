import { QrCode, DeviceMobile, Certificate, Stamp, ArrowRight } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

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
    desc: "รับตราประทับในพาสปอร์ต แล้วเลือกตอบแบบสอบถามสั้นๆ เพื่อช่วยพัฒนาพื้นที่",
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
          <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-coral">
            <span className="block h-px w-6 bg-coral" />
            Digital Passport Flow
          </p>
          <h2 className="mt-5 text-4xl font-bold leading-tight lg:text-5xl text-ink">
            ใช้งานง่ายเหมือนแอป
            <br />
            <span className="text-teal">แต่ไม่ต้องโหลดแอป</span>
          </h2>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-muted">
            ระบบออกแบบให้เริ่มจากการให้คุณค่าก่อน — นักท่องเที่ยวกรอกน้อยที่สุด รับใบประกาศก่อน แล้วค่อยให้ข้อมูลเพิ่มเติมแบบสมัครใจ
          </p>
        </div>

        <Link 
          href="/checkin/demo-code"
          className="group self-end rounded-full border-2 border-teal px-6 py-3 text-sm font-bold text-teal transition-all hover:bg-teal hover:text-white inline-flex items-center gap-2"
        >
          ทดลองจำลองการเช็คอิน
          <ArrowRight className="transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* Steps — horizontal timeline */}
      <div className="relative">
        <div
          className="absolute top-7 left-0 right-0 mx-auto hidden h-px lg:block"
          style={{
            left: "12.5%",
            right: "12.5%",
            background: "linear-gradient(to right, var(--color-teal, #0d9488), transparent 100%)",
            opacity: 0.2,
          }}
        />

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(({ num, icon: Icon, label, desc, accent }) => (
            <div key={num} className="group relative flex flex-col">
              {/* Icon */}
              <div className="mb-6">
                <div
                  className={`relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl ${accent} shadow-sm transition-transform duration-500 group-hover:-translate-y-2`}
                >
                  <Icon size={26} weight="fill" />
                </div>
              </div>

              {/* Content */}
              <div>
                <h3 className="text-lg font-bold text-ink">{num}. {label}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA strip */}
      <div className="mt-16 flex flex-col md:flex-row items-center justify-between rounded-3xl border border-ink/5 bg-cream px-8 py-6 shadow-sm">
        <p className="text-sm font-bold text-ink mb-4 md:mb-0">
          ครบ 4 จุดเช็กอิน รับรางวัลพิเศษประจำจังหวัด 🎁
        </p>
        <Link 
          href="/passport"
          className="rounded-full bg-teal px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-teal/90 transition-colors"
        >
          เปิดสมุดพาสปอร์ต
        </Link>
      </div>
    </section>
  );
}
