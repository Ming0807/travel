import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ChartBar,
  CheckCircle,
  Database,
  MapPin,
  QrCode,
  ShieldCheck,
  Sparkle,
} from "@phosphor-icons/react/dist/ssr";

import { SiteFooter } from "@/components/layout/SiteFooter";

export const metadata: Metadata = {
  title: "เกี่ยวกับโครงการ | แพลตฟอร์มข้อมูลท่องเที่ยวยะลา",
  description: "ขอบเขต เป้าหมาย และหลักการทำงานของแพลตฟอร์มข้อมูลท่องเที่ยวยะลารุ่นนำร่อง",
  alternates: { canonical: "/about" },
};

const capabilities = [
  {
    icon: MapPin,
    title: "ข้อมูลสถานที่ที่จัดการได้",
    description: "ผู้ดูแลเผยแพร่และปรับปรุงข้อมูลสถานที่ รูปภาพ เส้นทาง และเนื้อหาที่นักท่องเที่ยวเห็นจากระบบหลังบ้าน",
  },
  {
    icon: QrCode,
    title: "บันทึกการเยี่ยมชมโดยสมัครใจ",
    description: "QR เชื่อมการเยี่ยมชมกับสถานที่จริง ก่อนมอบใบประกาศและตราประทับโดยไม่บังคับเข้าสู่ระบบหรือทำแบบสอบถาม",
  },
  {
    icon: Database,
    title: "ข้อมูลที่มีโครงสร้าง",
    description: "ข้อมูลพื้นฐาน พฤติกรรมการเดินทาง ค่าใช้จ่ายช่วงประมาณ และความพึงพอใจถูกแยกตามวัตถุประสงค์และการยินยอม",
  },
  {
    icon: ChartBar,
    title: "สารสนเทศเพื่อการตัดสินใจ",
    description: "Dashboard สรุปแนวโน้มและข้อเสนอแนะจากข้อมูลที่มีจริง พร้อมแสดงฐานข้อมูลและข้อจำกัดเมื่อกลุ่มตัวอย่างยังน้อย",
  },
] as const;

const principles = [
  "ให้คุณค่าก่อน แล้วจึงขอข้อมูลเพิ่มเติมแบบไม่บังคับ",
  "ไม่เก็บเลขบัตรประชาชน ที่อยู่ละเอียด หรือข้อมูลอ่อนไหวที่ไม่จำเป็น",
  "แยกข้อมูลท่องเที่ยว ข้อมูลการใช้งาน และข้อมูลวิจัยตามวัตถุประสงค์",
  "ไม่ใช้จำนวนตัวอย่างน้อยเพื่อสรุปแทนประชากรทั้งจังหวัด",
] as const;

export default function AboutPage() {
  return (
    <>
      <main className="bg-white text-ink">
        <section className="border-b border-ink/10 bg-[#F7F8F6]">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.9fr)] lg:px-8 lg:py-20">
            <div className="self-center">
              <p className="text-xs font-black uppercase text-coral">Yala smart tourism pilot</p>
              <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight sm:text-5xl">
                แพลตฟอร์มข้อมูลท่องเที่ยวยะลา
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-700">
                โครงการระบบสารสนเทศต้นแบบที่เชื่อมข้อมูลสถานที่ การเยี่ยมชมโดยสมัครใจ
                ประสบการณ์นักท่องเที่ยว และการวิเคราะห์ข้อมูล เพื่อช่วยให้การพัฒนาการท่องเที่ยวมีหลักฐานประกอบมากขึ้น
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link href="/attractions" className="inline-flex min-h-12 items-center justify-center gap-2 bg-coral px-6 font-black text-white transition-colors hover:bg-[#C8553A]">
                  สำรวจสถานที่ในยะลา <ArrowRight aria-hidden="true" weight="bold" />
                </Link>
                <Link href="/contact" className="inline-flex min-h-12 items-center justify-center border border-ink/20 bg-white px-6 font-black text-ink transition-colors hover:border-ink">
                  ติดต่อโครงการ
                </Link>
              </div>
            </div>

            <figure className="relative aspect-[4/3] overflow-hidden border border-ink/10 bg-slate-100">
              <Image
                src="/certificate-templates/yala-mist-heritage-v2.webp"
                alt="ตัวอย่างงานภาพสำหรับใบประกาศดิจิทัลในโครงการนำร่องยะลา"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 46vw"
                className="object-cover"
              />
              <figcaption className="absolute inset-x-0 bottom-0 bg-ink/85 px-5 py-4 text-sm font-semibold text-white">
                ใบประกาศและตราประทับเป็นแรงจูงใจหลังบันทึกการเยี่ยมชม ไม่ใช่เงื่อนไขบังคับให้ตอบแบบสอบถาม
              </figcaption>
            </figure>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr]">
            <div>
              <p className="text-xs font-black uppercase text-teal">สิ่งที่ระบบทำจริง</p>
              <h2 className="mt-3 text-3xl font-black">จากการเดินทาง สู่ข้อมูลที่นำไปใช้ได้</h2>
              <p className="mt-4 text-sm leading-7 text-slate-700">
                ระบบนี้ไม่ใช่เพียงเว็บไซต์ประชาสัมพันธ์ แต่เป็น Web Application ที่จัดเก็บข้อมูลอย่างมีโครงสร้าง
                เชื่อมกับการทำงานของผู้ดูแล และนำผลรวมมาใช้ติดตามคุณภาพประสบการณ์ท่องเที่ยว
              </p>
            </div>
            <div className="grid border-t border-ink/15 sm:grid-cols-2">
              {capabilities.map(({ icon: Icon, title, description }) => (
                <article key={title} className="border-b border-ink/15 p-5 sm:border-x sm:p-6">
                  <Icon aria-hidden="true" className="text-coral" size={30} weight="duotone" />
                  <h3 className="mt-4 text-lg font-black">{title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-700">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-ink/10 bg-[#FFF7F3]">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-20">
            <div>
              <ShieldCheck aria-hidden="true" className="text-teal" size={38} weight="fill" />
              <h2 className="mt-4 text-3xl font-black">ข้อมูลต้องมีประโยชน์ โดยไม่เพิ่มภาระเกินจำเป็น</h2>
              <p className="mt-4 text-sm leading-7 text-slate-700">
                นักท่องเที่ยวได้รับใบประกาศและตราประทับก่อน แบบสอบถามหลังจากนั้นเป็นทางเลือก
                การปฏิเสธหรือข้ามจะไม่ทำให้สิทธิ์ที่ได้รับแล้วหายไป
              </p>
            </div>
            <ul className="divide-y divide-ink/15 border-y border-ink/15">
              {principles.map((principle) => (
                <li key={principle} className="flex gap-3 py-4 text-sm font-semibold leading-7 text-ink">
                  <CheckCircle aria-hidden="true" className="mt-1 shrink-0 text-teal" size={20} weight="fill" />
                  {principle}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[1fr_0.9fr]">
            <div>
              <Sparkle aria-hidden="true" className="text-coral" size={34} weight="fill" />
              <h2 className="mt-4 text-3xl font-black">ขอบเขตปัจจุบัน: โครงการนำร่องในยะลา</h2>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-700">
                ระบบยังอยู่ระหว่างพัฒนาและประเมินผล เนื้อหา จำนวนข้อมูล และข้อสรุปเชิงวิเคราะห์จึงเพิ่มขึ้นตามการใช้งานจริง
                สถิติที่แสดงต้องอ่านพร้อมช่วงเวลา ฐานตัวอย่าง และข้อจำกัด ไม่ใช่ตัวเลขทางการของทั้งจังหวัด
              </p>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-700">
                สถาปัตยกรรมรองรับการขยายพื้นที่ในอนาคต แต่การขยายจะทำหลังจากตรวจคุณภาพข้อมูล กระบวนการดูแลเนื้อหา
                และความพร้อมของหน่วยงานที่เกี่ยวข้องในระยะนำร่องแล้ว
              </p>
            </div>
            <aside className="border border-ink/15 bg-[#F7F8F6] p-6">
              <h2 className="text-lg font-black">พบข้อมูลไม่ถูกต้องหรืออยากร่วมทดสอบ?</h2>
              <p className="mt-2 text-sm leading-7 text-slate-700">
                ส่งรายละเอียดผ่านแบบฟอร์มติดต่อ ข้อความจะเข้าสู่ระบบหลังบ้านเพื่อให้ผู้ดูแลติดตามได้
              </p>
              <Link href="/contact" className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 bg-teal px-5 font-black text-white transition-colors hover:bg-ink">
                ติดต่อโครงการ <ArrowRight aria-hidden="true" weight="bold" />
              </Link>
            </aside>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
