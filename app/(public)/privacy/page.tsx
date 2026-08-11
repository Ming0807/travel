import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, LockKey, Eye, Trash, Cookie, EnvelopeSimple, FileText } from "@phosphor-icons/react/dist/ssr";
import { SiteFooter } from "@/components/layout/SiteFooter";

export const metadata: Metadata = {
  title: "นโยบายความเป็นส่วนตัว | Southern Border Tourism",
  description: "นโยบายความเป็นส่วนตัวของแพลตฟอร์มท่องเที่ยวชายแดนใต้ — วิธีการเก็บรวบรวม ใช้ และปกป้องข้อมูลของคุณ",
};

const sections = [
  {
    id: "overview",
    title: "ภาพรวม",
    icon: ShieldCheck,
    content: (
      <>
        <p className="leading-relaxed mb-4">
          แพลตฟอร์มท่องเที่ยวชายแดนใต้ (Southern Border Tourism Data & Intelligence Platform) ให้ความสำคัญกับความเป็นส่วนตัวของคุณ 
          นโยบายนี้อธิบายวิธีที่เราเก็บรวบรวม ใช้ เปิดเผย และปกป้องข้อมูลส่วนบุคคลของคุณ เมื่อคุณใช้เว็บไซต์และบริการของเรา
        </p>
        <p className="leading-relaxed mb-4">
          เราดำเนินงานภายใต้พระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA) และมาตรฐานสากลด้านความเป็นส่วนตัว 
          กรุณาอ่านนโยบายนี้อย่างละเอียดเพื่อทำความเข้าใจแนวปฏิบัติของเรา
        </p>
        <p className="text-sm font-bold text-muted">
          ประกาศล่าสุด: พฤษภาคม 2569
        </p>
      </>
    ),
  },
  {
    id: "data-collected",
    title: "ข้อมูลที่เราเก็บรวบรวม",
    icon: Eye,
    content: (
      <>
        <p className="leading-relaxed mb-4">
          เราเก็บรวบรวมข้อมูลเท่าที่จำเป็นสำหรับการให้บริการและการวิเคราะห์การท่องเที่ยวเท่านั้น
        </p>

        <h3 className="font-black text-ink text-lg mt-6 mb-3">ข้อมูลที่ให้โดยสมัครใจ</h3>
        <ul className="space-y-2 mb-6">
          <li className="flex items-start gap-3">
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-coral/60" />
            <span><strong>ชื่อที่แสดง</strong> — สำหรับแสดงบนใบประกาศดิจิทัลและตราประทับ</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-coral/60" />
            <span><strong>ประเทศและจังหวัดต้นทาง</strong> — สำหรับวิเคราะห์พฤติกรรมนักท่องเที่ยว</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-coral/60" />
            <span><strong>ช่วงอายุ</strong> — สำหรับวิเคราะห์กลุ่มนักท่องเที่ยวตามช่วงวัย</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-coral/60" />
            <span><strong>รูปถ่าย</strong> — สำหรับแนบกับบันทึกการเยี่ยมชมสถานที่</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-coral/60" />
            <span><strong>ข้อมูลจากผู้ให้บริการบัญชี</strong> — ใช้รหัสผู้ใช้จาก Google หรือ LINE เพื่อเชื่อมบัญชี โดยไม่คัดลอกรหัสผ่านมาเก็บในฐานข้อมูลนักท่องเที่ยว</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-coral/60" />
            <span><strong>ข้อมูล LINE</strong> — เฉพาะเมื่อคุณเลือกเชื่อมต่อบัญชี LINE</span>
          </li>
        </ul>

        <h3 className="font-black text-ink text-lg mt-6 mb-3">ข้อมูลที่เก็บรวบรวมโดยอัตโนมัติ</h3>
        <ul className="space-y-2 mb-6">
          <li className="flex items-start gap-3">
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-teal/60" />
            <span><strong>รหัสอุปกรณ์นิรนาม</strong> — ตัวระบุที่ไม่ระบุตัวตนสำหรับการใช้งานในฐานะแขก (cookie อายุ 1 ปี)</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-teal/60" />
            <span><strong>บันทึกการเยี่ยมชม</strong> — สถานที่ท่องเที่ยวที่คุณสแกน QR เข้าเยี่ยมชม</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-teal/60" />
            <span><strong>ข้อมูลการสำรวจ</strong> — ค่าใช้จ่าย ความพึงพอใจ และความคิดเห็นเพิ่มเติม (เฉพาะเมื่อตอบแบบสำรวจ)</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-teal/60" />
            <span><strong>ข้อมูลการใช้งาน</strong> — หน้าเว็บที่เข้าชม เวลา และการโต้ตอบ เพื่อปรับปรุงบริการ</span>
          </li>
        </ul>

        <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 mt-4">
          <p className="text-sm font-bold text-amber-800 flex items-center gap-2">
            <Cookie size={18} weight="fill" />
            เราไม่เก็บรวบรวม
          </p>
          <p className="text-sm text-amber-700 mt-1">
            หมายเลขบัตรประจำตัวประชาชน ที่อยู่ตามทะเบียนบ้าน ข้อมูลพิกัด GPS แบบเรียลไทม์ 
            หรือข้อมูลอ่อนไหวตามมาตรา 26 แห่ง PDPA
          </p>
        </div>
      </>
    ),
  },
  {
    id: "usage",
    title: "วิธีการใช้ข้อมูล",
    icon: FileText,
    content: (
      <>
        <p className="leading-relaxed mb-4">
          เราใช้ข้อมูลของคุณเพื่อวัตถุประสงค์ดังต่อไปนี้:
        </p>
        <div className="grid gap-3 md:grid-cols-2">
          {[
            { title: "การให้บริการ", desc: "สร้างใบประกาศดิจิทัล ตราประทับ และบันทึกการเยี่ยมชม" },
            { title: "การวิเคราะห์", desc: "วิเคราะห์พฤติกรรมนักท่องเที่ยว การใช้จ่าย และความพึงพอใจเพื่อการวางแผนการท่องเที่ยวอย่างยั่งยืน" },
            { title: "การปรับปรุง", desc: "ปรับปรุงประสบการณ์ผู้ใช้และพัฒนาแพลตฟอร์มให้ดียิ่งขึ้น" },
            { title: "การวิจัย", desc: "สนับสนุนการวิจัยด้านการท่องเที่ยวของภาครัฐและสถาบันการศึกษาในรูปแบบข้อมูลสรุปที่ไม่ระบุตัวตน" },
          ].map((item) => (
            <div key={item.title} className="rounded-xl bg-white border border-ink/5 p-4 shadow-sm">
              <h4 className="font-bold text-ink text-sm mb-1">{item.title}</h4>
              <p className="text-xs text-muted leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </>
    ),
  },
  {
    id: "legal-basis",
    title: "ฐานทางกฎหมาย",
    icon: LockKey,
    content: (
      <>
        <p className="leading-relaxed mb-4">
          การประมวลผลข้อมูลส่วนบุคคลของคุณอยู่ภายใต้ฐานทางกฎหมายตาม PDPA ดังนี้:
        </p>
        <ul className="space-y-3">
          <li className="flex items-start gap-3">
            <span className="mt-1 h-5 w-5 shrink-0 rounded-full bg-teal/10 flex items-center justify-center text-teal font-black text-xs">1</span>
            <div>
              <strong className="text-ink">ความยินยอม (Consent)</strong>
              <p className="text-sm text-muted">สำหรับการเก็บรวบรวมรูปถ่าย ข้อมูลการสำรวจ และการเชื่อมต่อบัญชี LINE เมื่อผู้ใช้เลือกดำเนินการ</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-1 h-5 w-5 shrink-0 rounded-full bg-teal/10 flex items-center justify-center text-teal font-black text-xs">2</span>
            <div>
              <strong className="text-ink">ประโยชน์โดยชอบด้วยกฎหมาย (Legitimate Interest)</strong>
              <p className="text-sm text-muted">สำหรับการวิเคราะห์การท่องเที่ยวและการปรับปรุงบริการ โดยไม่ส่งผลกระทบต่อสิทธิของคุณ</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-1 h-5 w-5 shrink-0 rounded-full bg-teal/10 flex items-center justify-center text-teal font-black text-xs">3</span>
            <div>
              <strong className="text-ink">ภาระตามสัญญา (Contractual Necessity)</strong>
              <p className="text-sm text-muted">สำหรับการให้บริการใบประกาศดิจิทัลและการบันทึกการเยี่ยมชม</p>
            </div>
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "retention",
    title: "ระยะเวลาการเก็บรักษา",
    icon: Trash,
    content: (
      <>
        <p className="leading-relaxed mb-4">
          เราจะเก็บรักษาข้อมูลส่วนบุคคลของคุณตามระยะเวลาที่จำเป็นสำหรับวัตถุประสงค์ที่ได้แจ้งไว้:
        </p>
        <div className="overflow-x-auto rounded-xl border border-ink/5">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-ink/5">
                <th className="text-left px-4 py-3 font-bold text-ink">ประเภทข้อมูล</th>
                <th className="text-left px-4 py-3 font-bold text-ink">ระยะเวลาเก็บรักษา</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              <tr>
                <td className="px-4 py-3 text-muted">รหัสอุปกรณ์นิรนาม</td>
                <td className="px-4 py-3 font-medium">1 ปี หลังจากใช้งานครั้งล่าสุด</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-muted">บันทึกการเยี่ยมชม</td>
                <td className="px-4 py-3 font-medium">5 ปี เพื่อการวิเคราะห์แนวโน้ม</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-muted">รูปถ่าย</td>
                <td className="px-4 py-3 font-medium">5 ปี หรือจนกว่าคุณจะร้องขอให้ลบ</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-muted">ข้อมูลการสำรวจ</td>
                <td className="px-4 py-3 font-medium">5 ปี ในรูปแบบสรุปที่ไม่ระบุตัวตน</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-muted">ข้อมูลบัญชี (LINE/อีเมล)</td>
                <td className="px-4 py-3 font-medium">จนกว่าคุณจะยกเลิกการเชื่อมต่อ</td>
              </tr>
            </tbody>
          </table>
        </div>
      </>
    ),
  },
  {
    id: "your-rights",
    title: "สิทธิของคุณ",
    icon: LockKey,
    content: (
      <>
        <p className="leading-relaxed mb-4">
          ตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 คุณมีสิทธิ์ดังต่อไปนี้:
        </p>
        <div className="grid gap-3 md:grid-cols-2">
          {[
            { title: "สิทธิในการรับทราบ", desc: "ทราบวัตถุประสงค์ วิธีการเก็บรวบรวม และการใช้ข้อมูล" },
            { title: "สิทธิในการเข้าถึง", desc: "ขอเข้าถึงข้อมูลส่วนบุคคลที่เราเก็บไว้" },
            { title: "สิทธิในการแก้ไข", desc: "ขอแก้ไขข้อมูลที่ไม่ถูกต้องหรือไม่สมบูรณ์" },
            { title: "สิทธิในการลบ", desc: "ขอให้ลบข้อมูลส่วนบุคคลของคุณ" },
            { title: "สิทธิในการระงับ", desc: "ขอให้ระงับการใช้ข้อมูลของคุณชั่วคราว" },
            { title: "สิทธิในการคัดค้าน", desc: "คัดค้านการเก็บรวบรวม ใช้ หรือเปิดเผยข้อมูล" },
            { title: "สิทธิในการโอนย้าย", desc: "ขอรับข้อมูลในรูปแบบที่อ่านได้ทั่วไป" },
            { title: "สิทธิในการเพิกถอน", desc: "เพิกถอนความยินยอมเมื่อใดก็ได้" },
          ].map((right) => (
            <div key={right.title} className="rounded-xl bg-white border border-ink/5 p-4 shadow-sm">
              <h4 className="font-bold text-ink text-sm mb-1">{right.title}</h4>
              <p className="text-xs text-muted leading-relaxed">{right.desc}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-sm text-muted leading-relaxed bg-ink/5 rounded-xl p-4">
          การใช้สิทธิ์ของคุณสามารถทำได้โดยไม่มีค่าใช้จ่าย เราจะดำเนินการตามคำขอของคุณภายใน 30 วันตามที่กฎหมายกำหนด
        </p>
      </>
    ),
  },
  {
    id: "cookies",
    title: "คุกกี้",
    icon: Cookie,
    content: (
      <>
        <p className="leading-relaxed mb-4">
          เราใช้คุกกี้และเทคโนโลยีที่คล้ายคลึงกันเพื่อให้บริการและปรับปรุงประสบการณ์ของคุณ:
        </p>
        <div className="space-y-3">
          <div className="rounded-xl bg-white border border-ink/5 p-4 shadow-sm">
            <h4 className="font-bold text-ink text-sm mb-1">คุกกี้ที่จำเป็น (Essential)</h4>
            <p className="text-xs text-muted leading-relaxed">ใช้สำหรับการทำงานพื้นฐานของแพลตฟอร์ม เช่น การระบุตัวตนแบบนิรนาม การคงสถานะการเข้าชม ไม่สามารถปิดการทำงานได้</p>
          </div>
          <div className="rounded-xl bg-white border border-ink/5 p-4 shadow-sm">
            <h4 className="font-bold text-ink text-sm mb-1">คุกกี้เพื่อการวิเคราะห์ (Analytics)</h4>
            <p className="text-xs text-muted leading-relaxed">ใช้เพื่อทำความเข้าใจวิธีการใช้งานแพลตฟอร์มของนักท่องเที่ยว เพื่อปรับปรุงเนื้อหาและประสบการณ์</p>
          </div>
          <div className="rounded-xl bg-white border border-ink/5 p-4 shadow-sm">
            <h4 className="font-bold text-ink text-sm mb-1">คุกกี้ของบุคคลที่สาม (Third-party)</h4>
            <p className="text-xs text-muted leading-relaxed">เราใช้ LINE SDK สำหรับการเชื่อมต่อบัญชี LINE และ Google Analytics สำหรับการวิเคราะห์การใช้งาน</p>
          </div>
        </div>
        <p className="mt-4 text-sm text-muted">
          คุณสามารถจัดการการตั้งค่าคุกกี้ได้ผ่านการตั้งค่าเบราว์เซอร์ของคุณ
        </p>
      </>
    ),
  },
  {
    id: "security",
    title: "มาตรการรักษาความปลอดภัย",
    icon: ShieldCheck,
    content: (
      <>
        <p className="leading-relaxed mb-4">
          เราใช้มาตรการรักษาความปลอดภัยที่เหมาะสมเพื่อปกป้องข้อมูลของคุณ:
        </p>
        <div className="grid gap-3 md:grid-cols-2">
          {[
            { title: "การเข้ารหัส", desc: "ข้อมูลถูกเข้ารหัสระหว่างการส่ง (SSL/TLS) และขณะจัดเก็บ" },
            { title: "การควบคุมการเข้าถึง", desc: "จำกัดการเข้าถึงข้อมูลเฉพาะผู้ที่ได้รับอนุญาตเท่านั้น" },
            { title: "การตรวจสอบ", desc: "บันทึกการเข้าถึงระบบเพื่อตรวจจับการเข้าถึงโดยไม่ได้รับอนุญาต" },
            { title: "การสำรองข้อมูล", desc: "สำรองข้อมูลอย่างสม่ำเสมอเพื่อป้องกันการสูญหาย" },
          ].map((item) => (
            <div key={item.title} className="rounded-xl bg-white border border-ink/5 p-4 shadow-sm">
              <h4 className="font-bold text-ink text-sm mb-1">{item.title}</h4>
              <p className="text-xs text-muted leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </>
    ),
  },
  {
    id: "contact",
    title: "ติดต่อเรา",
    icon: EnvelopeSimple,
    content: (
      <>
        <p className="leading-relaxed mb-4">
          หากคุณมีคำถาม ข้อกังวล หรือต้องการใช้สิทธิ์เกี่ยวกับข้อมูลส่วนบุคคล กรุณาติดต่อเรา:
        </p>
        <div className="rounded-2xl bg-white border border-ink/5 p-6 shadow-sm space-y-4">
          <div>
            <h4 className="font-bold text-ink text-sm">เจ้าหน้าที่คุ้มครองข้อมูลส่วนบุคคล (DPO)</h4>
            <p className="text-sm text-muted mt-1">อีเมล: dpo@southernborder.tourism.go.th</p>
          </div>
          <div>
            <h4 className="font-bold text-ink text-sm">ติดต่อทั่วไป</h4>
            <p className="text-sm text-muted mt-1">อีเมล: support@southernborder.tourism.go.th</p>
          </div>
          <div>
            <h4 className="font-bold text-ink text-sm">ช่องทางการร้องเรียน</h4>
            <p className="text-sm text-muted mt-1">
              คุณสามารถร้องเรียนต่อคณะกรรมการผู้เชี่ยวชาญตาม PDPA ได้ หากคุณเห็นว่าเราละเมิดสิทธิของคุณ
            </p>
          </div>
        </div>
        <p className="mt-6 text-sm text-muted">
          <Link href="/contact" className="text-coral font-bold hover:underline">
            หรือส่งข้อความถึงเราผ่านแบบฟอร์มติดต่อ →
          </Link>
        </p>
      </>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <>
      <main className="min-h-screen bg-background px-4 pb-24 pt-12 md:pt-20 relative overflow-hidden text-ink">
        {/* Premium Background Elements */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-teal/5 rounded-full blur-[120px] -z-10 translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-coral/5 rounded-full blur-[150px] -z-10 -translate-x-1/3 translate-y-1/3 pointer-events-none" />
        
        <div className="mx-auto max-w-4xl relative z-10">
          {/* Header */}
          <div className="text-center bg-white/40 backdrop-blur-sm rounded-2xl py-12 px-6 border border-white shadow-sm relative overflow-hidden mb-12">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200px] h-[4px] bg-gradient-to-r from-transparent via-teal to-transparent" />
            
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white text-teal text-xs font-black uppercase tracking-widest mb-6 shadow-sm border border-teal/10">
              <LockKey size={14} weight="fill" />
              Privacy by Design
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-ink tracking-tight mb-6 leading-[1.1]">
              นโยบายความเป็นส่วนตัว
            </h1>
            <p className="text-base md:text-lg leading-relaxed text-muted max-w-2xl mx-auto font-medium">
              เราให้ความสำคัญกับความเป็นส่วนตัวของคุณ อ่านนโยบายนี้เพื่อทำความเข้าใจวิธีที่เราเก็บรวบรวม ใช้ และปกป้องข้อมูลของคุณ
            </p>
          </div>

          {/* Quick Navigation */}
          <nav className="bg-white rounded-2xl border border-ink/5 p-6 mb-12">
            <h2 className="text-sm font-black text-ink mb-4 uppercase tracking-wider">สารบัญ</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-muted hover:text-coral hover:bg-coral/5 transition-colors"
                >
                  <section.icon size={14} weight="bold" />
                  <span>{section.title}</span>
                </a>
              ))}
            </div>
          </nav>

          {/* Privacy Sections */}
          <div className="space-y-8">
            {sections.map((section) => (
              <section
                key={section.id}
                id={section.id}
                className="bg-white rounded-2xl border border-ink/5 p-6 md:p-8 scroll-mt-24"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal/10 text-teal shrink-0">
                    <section.icon size={22} weight="fill" />
                  </div>
                  <h2 className="text-2xl font-black text-ink">{section.title}</h2>
                </div>
                <div className="text-sm text-muted leading-relaxed">
                  {section.content}
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
