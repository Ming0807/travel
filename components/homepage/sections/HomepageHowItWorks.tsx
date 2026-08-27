import {
  CaretRight,
  Camera,
  Certificate,
  ChatTeardropText,
  QrCode,
  Stamp,
  User,
} from "@phosphor-icons/react/dist/ssr";
import { PublicCheckinEntryLink } from "@/components/checkin/PublicCheckinEntryLink";

const STEPS = [
  {
    number: "1",
    title: "สแกน QR Code",
    altTitle: "สแกน QR ที่สถานที่",
    description: "สแกน QR Code ณ สถานที่ท่องเที่ยว",
    icon: QrCode,
  },
  {
    number: "2",
    title: "กรอกข้อมูล",
    altTitle: "กรอกข้อมูลจำเป็น",
    description: "กรอกข้อมูลนักท่องเที่ยวและยืนยันตัวตน",
    icon: User,
  },
  {
    number: "3",
    title: "อัปโหลดรูปภาพ",
    altTitle: "ถ่ายหรือเลือกรูป",
    description: "ถ่ายหรือเลือกรูปภาพภายในสถานที่",
    icon: Camera,
  },
  {
    number: "4",
    title: "รับตราประทับ",
    altTitle: "รับใบประกาศดิจิทัล",
    description: "รับตราประทับดิจิทัลเข้าสู่พาสปอร์ต",
    icon: Stamp,
  },
  {
    number: "5",
    title: "รับใบประกาศนียบัตร",
    altTitle: "สะสมตราและคะแนน",
    description: "เมื่อเช็กอินครบตามเงื่อนไขรับใบประกาศ",
    icon: Certificate,
  },
  {
    number: "6",
    title: "ประเมินความพึงพอใจ",
    altTitle: "แบบสำรวจตามความสมัครใจ",
    description: "ร่วมประเมินความพึงพอใจในการเยี่ยมชม",
    icon: ChatTeardropText,
  },
] as const;

type HomepageHowItWorksProps = {
  title?: string;
  subtitle?: string;
  description?: string;
};

export function HomepageHowItWorks({
  title = "วิธีการใช้งาน",
  subtitle = "ใช้งานง่ายเหมือนแอป แต่ไม่ต้องโหลดแอป",
  description = "ระบบออกแบบให้คุณได้รับคุณค่าก่อน แล้วจึงเลือกแบ่งปันข้อมูลเพื่อการท่องเที่ยวอย่างยั่งยืน",
}: HomepageHowItWorksProps) {
  return (
    <section id="how-it-works" aria-labelledby="homepage-journey-heading" className="border-t border-ink/10 bg-[#FFFDF9] px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-7xl">
        {/* Centered Thai Ornamental Heading */}
        <div className="text-center">
          <div className="inline-flex items-center gap-3 text-xs font-black uppercase tracking-widest text-coral">
            <span className="text-amber-500">❖ ───</span>
            <span>วิธีการใช้งาน</span>
            <span className="text-amber-500">─── ❖</span>
          </div>
          <h2 id="homepage-journey-heading" className="mt-3 text-2xl font-black text-ink sm:text-3xl lg:text-4xl">
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-1 text-sm font-bold text-coral sm:text-base">
              {subtitle}
            </p>
          ) : null}
          <p className="mx-auto mt-2 max-w-2xl text-xs leading-relaxed text-muted sm:text-sm">{description}</p>
        </div>

        {/* 6-Step Horizontal Sequence with Connecting Arrows */}
        <div className="relative mt-12">
          <ol className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6 lg:gap-3">
            {STEPS.map(({ number, title: stepTitle, altTitle, description: stepDescription, icon: Icon }, index) => (
              <li
                key={number}
                className="relative flex flex-col items-center text-center p-2"
              >
                {/* Connecting arrow for desktop between steps */}
                {index < STEPS.length - 1 ? (
                  <div className="pointer-events-none absolute -right-2 top-8 z-0 hidden -translate-y-1/2 text-orange-300 lg:block">
                    <span className="text-xs font-bold tracking-widest">---▶</span>
                  </div>
                ) : null}

                {/* Step Circle with Number Badge */}
                <div className="relative z-10">
                  <div className="grid h-16 w-16 place-items-center rounded-2xl border-2 border-orange-200/80 bg-white p-3 shadow-md shadow-orange-500/10 transition-transform duration-300 hover:scale-105 sm:h-18 sm:w-18">
                    <Icon aria-hidden="true" size={30} weight="duotone" className="text-coral" />
                  </div>
                  <span className="absolute -top-2 -left-2 grid h-6 w-6 place-items-center rounded-full bg-gradient-to-b from-amber-400 to-orange-500 text-xs font-black text-white shadow-sm">
                    {number}
                  </span>
                </div>

                <h3 className="mt-4 text-xs font-black text-ink sm:text-sm">{stepTitle}</h3>
                {altTitle ? <span className="sr-only">{altTitle}</span> : null}
                <p className="mt-1 text-[11px] leading-relaxed text-muted sm:text-xs">{stepDescription}</p>
              </li>
            ))}
          </ol>
        </div>

        {/* Centered Orange CTA Button */}
        <div className="mt-10 text-center">
          <PublicCheckinEntryLink
            aria-label="ทดลองใช้งานเช็กอิน"
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-8 text-sm font-black text-white shadow-md shadow-orange-500/25 transition-all hover:scale-105 hover:shadow-orange-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2"
          >
            เริ่มเช็กอิน <CaretRight aria-hidden="true" weight="bold" />
          </PublicCheckinEntryLink>
        </div>
      </div>
    </section>
  );
}
