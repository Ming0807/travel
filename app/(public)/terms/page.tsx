import type { Metadata } from "next";
import Link from "next/link";
import { FileText, ShieldCheck, Scales, Warning, Users, Globe, Gavel } from "@phosphor-icons/react/dist/ssr";
import { SiteFooter } from "@/components/layout/SiteFooter";

export const metadata: Metadata = {
  title: "ข้อตกลงการใช้งาน | Southern Border Tourism",
  description: "ข้อตกลงและเงื่อนไขการใช้งานแพลตฟอร์มท่องเที่ยวชายแดนใต้",
};

const sections = [
  {
    id: "acceptance",
    title: "การยอมรับข้อตกลง",
    icon: FileText,
    content: (
      <>
        <p className="leading-relaxed mb-4">
          การเข้าใช้หรือใช้งานแพลตฟอร์มท่องเที่ยวชายแดนใต้ (Southern Border Tourism Data & Intelligence Platform) 
          แสดงว่าคุณตกลงที่จะผูกพันตามข้อตกลงการใช้งานฉบับนี้ หากคุณไม่ยอมรับข้อกำหนดใด ๆ กรุณาอย่าใช้บริการของเรา
        </p>
        <p className="leading-relaxed">
          แพลตฟอร์มนี้ดำเนินการโดยหน่วยงานส่งเสริมการท่องเที่ยวจังหวัดชายแดนใต้ เพื่อวัตถุประสงค์ในการส่งเสริมการท่องเที่ยว 
          การเก็บรวบรวมข้อมูล และการวิเคราะห์เพื่อการวางแผนอย่างยั่งยืน
        </p>
      </>
    ),
  },
  {
    id: "service-desc",
    title: "คำอธิบายบริการ",
    icon: Globe,
    content: (
      <>
        <p className="leading-relaxed mb-4">
          แพลตฟอร์มของเราให้บริการดังต่อไปนี้:
        </p>
        <ul className="space-y-3">
          <li className="flex items-start gap-3">
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-teal/60" />
            <span><strong>ข้อมูลสถานที่ท่องเที่ยว</strong> — ข้อมูลแหล่งท่องเที่ยว ร้านอาหาร เรื่องราว และเส้นทางใน 3 จังหวัดชายแดนใต้</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-teal/60" />
            <span><strong>ระบบ QR Check-in</strong> — สแกน QR Code เพื่อบันทึกการเยี่ยมชมสถานที่ท่องเที่ยว</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-teal/60" />
            <span><strong>ใบประกาศดิจิทัล</strong> — รับใบประกาศอิเล็กทรอนิกส์หลังจากเยี่ยมชมสถานที่</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-teal/60" />
            <span><strong>ตราประทับดิจิทัล</strong> — สะสมตราประทับประจำสถานที่ท่องเที่ยว</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-teal/60" />
            <span><strong>พาสปอร์ตนักท่องเที่ยว</strong> — บันทึกการเดินทางและตราประทับส่วนตัว</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-teal/60" />
            <span><strong>แบบสำรวจ</strong> — แบบสำรวจค่าใช้จ่ายและความพึงพอใจโดยสมัครใจ</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-teal/60" />
            <span><strong>แดชบอร์ด analytics</strong> — ข้อมูลสรุปและวิเคราะห์สำหรับผู้ดูแลระบบและหน่วยงานที่เกี่ยวข้อง</span>
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "user-obligations",
    title: "ข้อผูกพันของผู้ใช้",
    icon: Users,
    content: (
      <>
        <p className="leading-relaxed mb-4">คุณตกลงที่จะ:</p>
        <ul className="space-y-3">
          <li className="flex items-start gap-3">
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-coral/60" />
            <span>ให้ข้อมูลที่เป็นความจริงและถูกต้องเมื่อใช้บริการของเรา</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-coral/60" />
            <span>ไม่ใช้แพลตฟอร์มเพื่อวัตถุประสงค์ที่ผิดกฎหมาย</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-coral/60" />
            <span>ไม่ละเมิดสิทธิ์ในทรัพย์สินทางปัญญาของผู้อื่น</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-coral/60" />
            <span>ไม่พยายามเข้าถึงระบบโดยไม่ได้รับอนุญาต</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-coral/60" />
            <span>ไม่อัปโหลดเนื้อหาที่ไม่เหมาะสม ละเมิดกฎหมาย หรือละเมิดสิทธิ์ของผู้อื่น</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-coral/60" />
            <span>ไม่ใช้ bots, crawlers, หรือเครื่องมืออัตโนมัติอื่น ๆ โดยไม่ได้รับอนุญาตเป็นลายลักษณ์อักษร</span>
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "content-rights",
    title: "สิทธิ์ในเนื้อหา",
    icon: Scales,
    content: (
      <>
        <p className="leading-relaxed mb-4">
          เนื้อหาทั้งหมดบนแพลตฟอร์มนี้ รวมถึงข้อความ รูปภาพ กราฟิก โลโก้ และข้อมูล 
          เป็นทรัพย์สินของผู้ให้บริการแพลตฟอร์มหรือได้รับอนุญาตให้ใช้อย่างถูกต้อง
        </p>
        <h3 className="font-black text-ink text-lg mt-6 mb-3">เนื้อหาที่คุณอัปโหลด</h3>
        <p className="leading-relaxed mb-4">
          เมื่อคุณอัปโหลดรูปถ่ายหรือเนื้อหาอื่น ๆ ไปยังแพลตฟอร์ม:
        </p>
        <ul className="space-y-2">
          <li className="flex items-start gap-3">
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-teal/60" />
            <span>คุณยังคงเป็นเจ้าของสิทธิ์ในเนื้อหาของคุณ</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-teal/60" />
            <span>คุณให้สิทธิ์เราในการใช้เนื้อหาดังกล่าวเพื่อวัตถุประสงค์ในการให้บริการเท่านั้น</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-teal/60" />
            <span>เราจะไม่นำรูปถ่ายของคุณไปใช้ในเชิงพาณิชย์โดยไม่ได้รับความยินยอมเพิ่มเติม</span>
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "disclaimer",
    title: "ข้อจำกัดความรับผิดชอบ",
    icon: Warning,
    content: (
      <>
        <p className="leading-relaxed mb-4">
          ข้อมูลเกี่ยวกับสถานที่ท่องเที่ยว ร้านอาหาร และบริการต่าง ๆ บนแพลตฟอร์มมีไว้เพื่อเป็นข้อมูลทั่วไปเท่านั้น
        </p>
        <ul className="space-y-3">
          <li className="flex items-start gap-3">
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-amber-500/60" />
            <span>เราไม่รับประกันว่าข้อมูลจะถูกต้อง ครบถ้วน หรือเป็นปัจจุบันเสมอไป</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-amber-500/60" />
            <span>การตัดสินใจเดินทางและใช้บริการต่าง ๆ เป็นความรับผิดชอบของคุณเอง</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-amber-500/60" />
            <span>เราไม่รับผิดชอบต่อความเสียหายที่เกิดขึ้นจากการใช้หรือไม่สามารถใช้บริการของเรา</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-amber-500/60" />
            <span>ลิงก์ไปยังเว็บไซต์ภายนอกมีไว้เพื่อความสะดวกเท่านั้น เราไม่รับผิดชอบต่อเนื้อหาของเว็บไซต์เหล่านั้น</span>
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "governing-law",
    title: "กฎหมายที่ใช้บังคับ",
    icon: Gavel,
    content: (
      <>
        <p className="leading-relaxed">
          ข้อตกลงการใช้งานนี้อยู่ภายใต้และตีความตามกฎหมายไทย 
          ข้อพิพาทใด ๆ ที่เกิดขึ้นจากข้อตกลงนี้จะอยู่ในเขตอำนาจศาลไทย
        </p>
      </>
    ),
  },
  {
    id: "changes",
    title: "การเปลี่ยนแปลงข้อตกลง",
    icon: ShieldCheck,
    content: (
      <>
        <p className="leading-relaxed mb-4">
          เราอาจปรับปรุงข้อตกลงการใช้งานนี้เป็นครั้งคราว การเปลี่ยนแปลงที่มีนัยสำคัญจะแจ้งให้คุณทราบผ่านทางแพลตฟอร์ม
        </p>
        <p className="leading-relaxed">
          การใช้บริการอย่างต่อเนื่องหลังจากมีการเปลี่ยนแปลงถือว่าคุณยอมรับข้อตกลงที่แก้ไขแล้ว
        </p>
      </>
    ),
  },
];

export default function TermsPage() {
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
              <FileText size={14} weight="fill" />
              Terms of Service
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-ink tracking-tight mb-6 leading-[1.1]">
              ข้อตกลงการใช้งาน
            </h1>
            <p className="text-base md:text-lg leading-relaxed text-muted max-w-2xl mx-auto font-medium">
              ข้อกำหนดและเงื่อนไขในการใช้แพลตฟอร์มท่องเที่ยวชายแดนใต้
            </p>
          </div>

          {/* Quick Navigation */}
          <nav className="bg-white rounded-2xl border border-ink/5 p-6 mb-12">
            <h2 className="text-sm font-black text-ink mb-4 uppercase tracking-wider">สารบัญ</h2>
            <div className="flex flex-wrap gap-2">
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

          {/* Terms Sections */}
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

          {/* Back to Privacy */}
          <div className="mt-8 text-center">
            <Link
              href="/privacy"
              className="inline-flex items-center gap-2 text-sm font-bold text-coral hover:underline"
            >
              <ShieldCheck size={16} weight="bold" />
              ดูนโยบายความเป็นส่วนตัว
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
