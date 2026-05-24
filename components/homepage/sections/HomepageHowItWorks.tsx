import { QrCode, DeviceMobile, Certificate, Stamp, ArrowRight } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

const steps = [
  {
    num: "01",
    icon: QrCode,
    label: "สแกนคิวอาร์ (Scan QR)",
    desc: "สแกน QR ที่จุดถ่ายรูป ระบบรู้ทันทีว่าอยู่จังหวัด สถานที่ และจุดเช็กอินใด",
    accent: "bg-coral text-white",
    iconBg: "bg-white/20",
  },
  {
    num: "02",
    icon: DeviceMobile,
    label: "อัปโหลดรูปภาพ",
    desc: "กรอกชื่อที่ต้องการแสดง จังหวัด/ประเทศ ช่วงอายุ และอัปโหลดรูปสำหรับบัตรที่ระลึก",
    accent: "bg-ink text-white",
    iconBg: "bg-white/20",
  },
  {
    num: "03",
    icon: Certificate,
    label: "รับใบประกาศ",
    desc: "ระบบสร้างใบประกาศดิจิทัลให้ดาวน์โหลดและแชร์ได้ โดยไม่บังคับ Login ก่อน",
    accent: "bg-teal text-white",
    iconBg: "bg-white/20",
  },
  {
    num: "04",
    icon: Stamp,
    label: "สะสมตราประทับ",
    desc: "รับตราประทับในพาสปอร์ต แล้วเลือกตอบแบบสอบถามสั้นๆ เพื่อช่วยพัฒนาพื้นที่",
    accent: "bg-[#D46549] text-white",
    iconBg: "bg-white/20",
  },
];

export function HomepageHowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24 bg-[#FAF8F5] rounded-[3rem] my-8 shadow-sm">

      {/* Header — asymmetric layout */}
      <div className="mb-16 grid lg:grid-cols-[1fr_auto] lg:items-end gap-8">
        <div>
          <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-coral mb-4">
            <span className="block h-px w-8 bg-coral" />
            Digital Passport
          </p>
          <h2 className="text-4xl font-black leading-[1.1] lg:text-5xl text-ink">
            ใช้งานง่ายเหมือนแอป
            <br />
            <span className="text-coral font-['Playfair_Display'] italic font-normal">แต่ไม่ต้องโหลดแอป</span>
          </h2>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-muted font-medium">
            ระบบออกแบบให้เริ่มจากการให้คุณค่าก่อน — นักท่องเที่ยวกรอกน้อยที่สุด รับใบประกาศก่อน แล้วค่อยให้ข้อมูลเพิ่มเติมแบบสมัครใจ
          </p>
        </div>

        <Link 
          href="/checkin/demo-code"
          className="group self-end rounded-full bg-white border border-coral/20 px-8 py-4 text-sm font-bold text-ink shadow-md transition-all hover:shadow-lg hover:border-coral/50 hover:bg-cream hover:text-coral inline-flex items-center gap-2"
        >
          ทดลองใช้งาน
          <ArrowRight className="transition-transform group-hover:translate-x-1" weight="bold" />
        </Link>
      </div>

      {/* Steps — horizontal timeline */}
      <div className="relative">
        <div className="absolute top-8 left-0 right-0 mx-auto hidden h-px lg:block"
          style={{
            left: "12.5%",
            right: "12.5%",
            background: "linear-gradient(to right, var(--color-coral, #E77455), transparent 100%)",
            opacity: 0.3,
          }}
        />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(({ num, icon: Icon, label, desc, accent }) => (
            <div key={num} className="group relative flex flex-col bg-white p-8 rounded-[2rem] shadow-sm border border-ink/5 hover:shadow-md transition-all">
              {/* Icon */}
              <div className="mb-8">
                <div
                  className={`relative z-10 flex h-16 w-16 items-center justify-center rounded-[1.2rem] ${accent} shadow-md transition-transform duration-500 group-hover:scale-110`}
                >
                  <Icon size={32} weight="fill" />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1">
                <h3 className="text-xl font-black text-ink mb-3"><span className="text-coral/50 mr-1">{num}.</span> {label}</h3>
                <p className="text-sm leading-relaxed text-muted">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA strip */}
      <div className="mt-16 flex flex-col md:flex-row items-center justify-between rounded-[2.5rem] border border-coral/20 bg-white px-10 py-8 shadow-sm">
        <div>
          <h4 className="text-xl font-black text-ink mb-1">ครบ 4 จุดเช็กอิน รับรางวัลพิเศษประจำจังหวัด 🎁</h4>
          <p className="text-sm text-muted">สะสมตราประทับให้ครบเพื่อปลดล็อกของรางวัลสุดพิเศษในแต่ละพื้นที่</p>
        </div>
        <Link 
          href="/passport"
          className="mt-6 md:mt-0 rounded-full bg-coral px-8 py-4 text-sm font-bold text-white shadow-md hover:-translate-y-0.5 hover:shadow-lg hover:shadow-coral/30 hover:bg-coral/90 transition-all whitespace-nowrap"
        >
          เปิดสมุดพาสปอร์ต
        </Link>
      </div>
    </section>
  );
}
