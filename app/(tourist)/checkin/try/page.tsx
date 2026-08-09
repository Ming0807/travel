import Link from "next/link";
import { ArrowRight, QrCode } from "@phosphor-icons/react/dist/ssr";
import { redirect } from "next/navigation";
import { resolvePublicDemoCheckinCode } from "@/lib/services/checkin.service";

export const dynamic = "force-dynamic";

export default async function TryCheckinPage() {
  let demoCode: string | null = null;

  try {
    demoCode = await resolvePublicDemoCheckinCode();
  } catch {
    demoCode = null;
  }

  if (demoCode) {
    redirect(`/c/${encodeURIComponent(demoCode)}`);
  }

  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-[#F7F8F8] px-4 py-12">
      <section className="w-full max-w-lg border border-slate-200 bg-white p-6 shadow-[0_4px_8px_rgba(15,23,42,0.06)] sm:p-8">
        <span className="flex h-12 w-12 items-center justify-center rounded-[5px] bg-[#FFF0EA] text-[#B94727]">
          <QrCode aria-hidden="true" size={26} weight="bold" />
        </span>
        <h1 className="mt-5 text-2xl font-black text-slate-950">เริ่มรับใบประกาศที่จุดท่องเที่ยว</h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          ขณะนี้ยังไม่มี QR สำหรับทดลองใช้งาน กรุณาสแกน QR ที่ติดตั้ง ณ จุดเช็กอินของสถานที่ท่องเที่ยว
          เพื่อยืนยันสถานที่และเริ่มขั้นตอนจริงอย่างถูกต้อง
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
