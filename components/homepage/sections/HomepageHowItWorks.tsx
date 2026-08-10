import {
  ArrowRight,
  Camera,
  QrCode,
  Stamp,
} from "@phosphor-icons/react/dist/ssr";
import { PublicCheckinEntryLink } from "@/components/checkin/PublicCheckinEntryLink";

const STEPS = [
  {
    number: "01",
    title: "สแกน QR ที่สถานที่",
    description: "เปิดหน้าเช็กอินและกรอกข้อมูลสั้น ๆ เท่าที่จำเป็น ไม่ต้องติดตั้งแอป",
    icon: QrCode,
  },
  {
    number: "02",
    title: "ถ่ายหรือเลือกรูป",
    description: "เลือกรูปความทรงจำ ปรับใบประกาศ แล้วดาวน์โหลดเก็บไว้ได้ทันที",
    icon: Camera,
  },
  {
    number: "03",
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
    <section id="how-it-works" aria-labelledby="homepage-journey-heading" className="border-y border-ink/10 bg-cream px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.65fr)] lg:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-coral">Digital Passport</p>
            <h2 id="homepage-journey-heading" className="mt-2 text-2xl font-black leading-tight text-ink sm:text-3xl">
              {title}
            </h2>
            {subtitle ? <p className="mt-2 text-base font-black text-teal">{subtitle}</p> : null}
            <p className="mt-4 max-w-xl text-sm leading-6 text-muted">{description}</p>
            <PublicCheckinEntryLink className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-[6px] bg-coral px-5 text-sm font-black text-white transition-colors hover:bg-coral/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2">
              เริ่มเช็กอิน <ArrowRight aria-hidden="true" weight="bold" />
            </PublicCheckinEntryLink>
          </div>

          <ol className="grid overflow-hidden rounded-[8px] border border-ink/10 bg-white sm:grid-cols-3">
            {STEPS.map(({ number, title: stepTitle, description: stepDescription, icon: Icon }, index) => (
              <li key={number} className={`relative p-5 sm:p-6 ${index > 0 ? "border-t border-ink/10 sm:border-l sm:border-t-0" : ""}`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-coral">{number}</span>
                  <Icon aria-hidden="true" size={24} weight="duotone" className="text-teal" />
                </div>
                <h3 className="mt-6 text-base font-black text-ink">{stepTitle}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{stepDescription}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
