import {
  ArrowRight,
  CaretRight,
  Camera,
  QrCode,
  Stamp,
} from "@phosphor-icons/react/dist/ssr";
import { PublicCheckinEntryLink } from "@/components/checkin/PublicCheckinEntryLink";

const STEPS = [
  {
    number: "1",
    title: "สแกน QR ที่สถานที่",
    description: "เปิดหน้าเช็กอินและกรอกข้อมูลสั้น ๆ เท่าที่จำเป็น ไม่ต้องติดตั้งแอป",
    icon: QrCode,
  },
  {
    number: "2",
    title: "ถ่ายหรือเลือกรูป",
    description: "เลือกรูปความทรงจำ ปรับใบประกาศ แล้วดาวน์โหลดเก็บไว้ได้ทันที",
    icon: Camera,
  },
  {
    number: "3",
    title: "สะสมตราและคะแนน",
    description: "รับตราประจำสถานที่ ดู Digital Passport และเลือกให้ข้อมูลเพิ่มเติมได้โดยสมัครใจ",
    icon: Stamp,
  },
] as const;

type HomepageHowItWorksProps = {
  title?: string;
  subtitle?: string;
  description?: string;
};

export function HomepageHowItWorks({
  title = "เริ่มบันทึกการเดินทางได้ใน 3 ขั้นตอน",
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
            <span>❖ วิธีการใช้งาน ❖</span>
            <span className="h-px w-6 bg-coral/40"></span>
          </div>
          <h2 id="homepage-journey-heading" className="mt-2 text-2xl font-black text-ink sm:text-3xl lg:text-4xl">
            {title}
          </h2>
          {subtitle ? <p className="mt-1 text-sm font-bold text-teal sm:text-base">{subtitle}</p> : null}
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">{description}</p>
        </div>

        {/* 3-Step Horizontal Sequence on Desktop */}
        <ol className="mt-10 grid gap-4 sm:grid-cols-3 sm:gap-6 lg:mt-12">
          {STEPS.map(({ number, title: stepTitle, description: stepDescription, icon: Icon }, index) => (
            <li
              key={number}
              className="relative flex flex-col items-center rounded-[8px] border border-ink/10 bg-white p-6 text-center shadow-xs transition-all hover:border-coral/40 hover:shadow-card sm:p-7"
            >
              {/* Connector arrow on desktop */}
              {index < STEPS.length - 1 ? (
                <div className="pointer-events-none absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-ink/10 bg-white p-1 text-coral sm:block lg:-right-4">
                  <CaretRight size={14} weight="bold" />
                </div>
              ) : null}

              {/* Circular Step Badge & Icon */}
              <div className="relative">
                <div className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-b from-orange-400 to-coral text-white shadow-xs">
                  <Icon aria-hidden="true" size={30} weight="fill" />
                </div>
                <span className="absolute -top-1 -right-1 grid h-6 w-6 place-items-center rounded-full bg-ink text-xs font-black text-white shadow-xs">
                  {number}
                </span>
              </div>

              <h3 className="mt-5 text-base font-black text-ink sm:text-lg">{stepTitle}</h3>
              <p className="mt-2 text-xs leading-relaxed text-muted sm:text-sm">{stepDescription}</p>
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
