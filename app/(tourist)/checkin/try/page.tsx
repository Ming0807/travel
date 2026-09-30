import Link from "next/link";
import { ArrowRight, QrCode } from "@phosphor-icons/react/dist/ssr";
export default function TryCheckinPage() {
  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-[#F7F8F8] px-4 py-12">
      <section className="w-full max-w-lg border border-slate-200 bg-white p-6 shadow-[0_4px_8px_rgba(15,23,42,0.06)] sm:p-8">
        <span className="flex h-12 w-12 items-center justify-center rounded-[5px] bg-[#FFF0EA] text-[#B94727]">
          <QrCode aria-hidden="true" size={26} weight="bold" />
        </span>
        <h1 className="mt-5 text-2xl font-black text-slate-950">เริ่มรับใบประกาศที่จุดท่องเที่ยว</h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          กรุณาสแกน QR ที่ติดตั้ง ณ จุดเช็กอินของสถานที่ท่องเที่ยวด้วยกล้องมือถือ
          เพื่อเปิดข้อมูลจุดเช็กอิน แล้วกรอกข้อมูลสั้น ๆ สำหรับใบประกาศ
        </p>
        <ol className="mt-5 space-y-3 text-sm leading-6 text-slate-700">
          <li>1. ไปยังจุดเช็กอินของสถานที่ที่คุณเยี่ยมชม</li>
          <li>2. เปิดกล้องมือถือและสแกน QR ที่จุดนั้น</li>
          <li>3. ตรวจชื่อสถานที่ แล้วเริ่มทำใบประกาศโดยไม่ต้องเข้าสู่ระบบ</li>
        </ol>
        <p className="mt-5 border-t border-slate-100 pt-4 text-xs leading-6 text-slate-500">
          หน้านี้เป็นคำแนะนำ ไม่สร้างข้อมูลการเข้าชม ใบประกาศ หรือสแตมป์จากการทดลอง
        </p>
        <Link
          href="/attractions"
          className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-[5px] bg-[#171717] px-4 text-sm font-bold text-white transition-colors hover:bg-[#B94727]"
        >
          ดูสถานที่ท่องเที่ยว
          <ArrowRight aria-hidden="true" size={16} weight="bold" />
        </Link>
      </section>
    </main>
  );
}
