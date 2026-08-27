import {
  ArrowRight,
  Camera,
  Certificate,
  ChatTeardropText,
  NotePencil,
  QrCode,
  Stamp,
} from "@phosphor-icons/react/dist/ssr";
import { PublicCheckinEntryLink } from "@/components/checkin/PublicCheckinEntryLink";

const STEPS = [
  {
    number: "1",
    title: "สแกน QR ที่สถานที่",
    description: "สแกน QR ณ จุดท่องเที่ยวเพื่อเปิดหน้าบันทึกการเดินทาง",
    icon: QrCode,
  },
  {
    number: "2",
    title: "กรอกข้อมูลจำเป็น",
    description: "ระบุชื่อและข้อมูลพื้นฐานสั้น ๆ ไม่ต้องโหลดแอป",
    icon: NotePencil,
  },
  {
    number: "3",
    title: "ถ่ายหรือเลือกรูป",
    description: "เลือกรูปความทรงจำ เพื่อประกอบบนใบประกาศดิจิทัล",
    icon: Camera,
  },
  {
    number: "4",
    title: "รับใบประกาศดิจิทัล",
    description: "ดาวน์โหลดเกียรติบัตรการเดินทางเฉพาะคุณเก็บไว้ทันที",
    icon: Certificate,
  },
  {
    number: "5",
    title: "สะสมตราและคะแนน",
    description: "รับตราประจำสถานที่ลงใน Digital Passport ของคุณ",
    icon: Stamp,
  },
  {
    number: "6",
    title: "แบบสำรวจตามความสมัครใจ",
    description: "ร่วมสะท้อนความคิดเห็นเพื่อพัฒนาการท่องเที่ยวยะลา",
    icon: ChatTeardropText,
  },
] as const;

type HomepageHowItWorksProps = {
  title?: string;
  subtitle?: string;
  description?: string;
};

export function HomepageHowItWorks({
  title = "ขั้นตอนการบันทึกการเดินทาง",
  subtitle,
  description = "รับคุณค่าก่อน แล้วค่อยเลือกแบ่งปันข้อมูลเพื่อช่วยพัฒนาการท่องเที่ยวยะลา",
}: HomepageHowItWorksProps) {
  return (
    <section id="how-it-works" aria-labelledby="homepage-journey-heading" className="border-t border-ink/10 bg-cream px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div className="mx-auto max-w-7xl">
        {/* Centered Thai Ornamental Heading */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-coral">
            <span className="h-px w-6 bg-coral/40"></span>
            <span>❖ ขั้นตอนการใช้งาน ❖</span>
            <span className="h-px w-6 bg-coral/40"></span>
          </div>
          <h2 id="homepage-journey-heading" className="mt-2 text-2xl font-black text-ink sm:text-3xl lg:text-4xl">
            {title}
          </h2>
          {subtitle ? <p className="mt-1 text-sm font-bold text-teal sm:text-base">{subtitle}</p> : null}
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">{description}</p>
        </div>

        {/* 6-Step Horizontal Sequence */}
        <ol className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 lg:gap-3.5">
          {STEPS.map(({ number, title: stepTitle, description: stepDescription, icon: Icon }) => (
            <li
              key={number}
              className="relative flex flex-col items-center rounded-[8px] border border-ink/10 bg-white p-4 text-center shadow-xs transition-all hover:border-coral/40 hover:shadow-card sm:p-5"
            >
              {/* Circular Step Badge & Icon */}
              <div className="relative">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-b from-orange-400 to-coral text-white shadow-xs sm:h-14 sm:w-14">
                  <Icon aria-hidden="true" size={24} weight="fill" />
                </div>
                <span className="absolute -top-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-ink text-[10px] font-black text-white shadow-xs sm:h-6 sm:w-6 sm:text-xs">
                  {number}
                </span>
              </div>

              <h3 className="mt-3 text-xs font-black text-ink sm:text-sm">{stepTitle}</h3>
              <p className="mt-1.5 text-[11px] leading-relaxed text-muted sm:text-xs">{stepDescription}</p>
            </li>
          ))}
        </ol>

        {/* Bottom CTA */}
        <div className="mt-8 text-center">
          <PublicCheckinEntryLink
            aria-label="ทดลองใช้งานเช็กอิน"
            className="inline-flex min-h-11 items-center gap-2 rounded-[6px] bg-coral px-6 text-sm font-black text-white shadow-xs transition-all hover:bg-[#C95C3F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2"
          >
            เริ่มเช็กอิน <ArrowRight aria-hidden="true" weight="bold" />
          </PublicCheckinEntryLink>
        </div>
      </div>
    </section>
  );
}
