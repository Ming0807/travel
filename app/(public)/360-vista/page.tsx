import type { Metadata } from "next";
import Link from "next/link";
import { Compass, ShieldCheck } from "@phosphor-icons/react/dist/ssr";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { PublicButton } from "@/components/public/PublicButton";
import { PublicPageFrame } from "@/components/public/PublicPageFrame";
import { PublicErrorState } from "@/components/public/PublicStates";
import { PublicVistaGrid } from "@/components/vista/PublicVistaGrid";
import { VISTA_360_EXTERNAL_URL } from "@/constants/product";
import { listPublicVirtualTours } from "@/lib/repositories/public-content.repository";
import { safeExternalTourUrl } from "@/lib/routes/public-route";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "ทัวร์เสมือนจริง 360° ในยะลา",
  description: "เปิดสื่อพาโนรามาและทัวร์เสมือนจริง 360° ที่เชื่อมกับสถานที่ท่องเที่ยวซึ่งเผยแพร่แล้วในจังหวัดยะลา",
  alternates: { canonical: "/360-vista" },
};

export default async function Vista360Page() {
  const tourState = await listPublicVirtualTours(12)
    .then((items) => ({ items, loadError: false }))
    .catch(() => ({ items: [], loadError: true }));
  const items = tourState.items;
  const externalProviderUrl = safeExternalTourUrl(VISTA_360_EXTERNAL_URL);

  return (
    <div className="min-h-screen bg-[var(--public-canvas)] text-[var(--public-ink)]">
      <PublicPageFrame variant="listing" className="pb-16 pt-8 sm:pt-10">
        <nav aria-label="เส้นทางนำทาง" className="flex items-center gap-2 text-sm text-black/65">
          <Link href="/" className="hover:text-[var(--public-teal)]">หน้าแรก</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page" className="font-semibold text-[var(--public-ink)]">ทัวร์เสมือนจริง 360°</span>
        </nav>

        <header className="mt-7 grid gap-6 border-b border-black/10 pb-7 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--public-coral-strong)]">
              <Compass size={19} weight="fill" aria-hidden="true" />
              สำรวจก่อนออกเดินทาง
            </p>
            <h1 className="mt-3 max-w-4xl text-3xl font-bold leading-tight text-balance sm:text-4xl lg:text-5xl">
              ทัวร์เสมือนจริง 360° ในยะลา
            </h1>
            <p className="mt-4 max-w-[70ch] text-base leading-7 text-black/65 sm:text-lg">
              รายการด้านล่างมาจากสื่อที่ผู้ดูแลเผยแพร่กับสถานที่จริง หากเป็นผู้ให้บริการภายนอก ระบบจะแจ้งให้ทราบก่อนเปิดลิงก์
            </p>
          </div>
          <div className="border border-black/10 bg-white p-4">
            <p className="flex items-start gap-2 text-sm font-semibold leading-6 text-[var(--public-teal)]">
              <ShieldCheck size={20} weight="fill" className="mt-0.5 shrink-0" aria-hidden="true" />
              เราไม่ส่งชื่อ โปรไฟล์ หรือรหัสนักท่องเที่ยวไปกับลิงก์ 360° ภายนอก
            </p>
          </div>
        </header>

        <section aria-labelledby="vista-list-heading" className="mt-10">
          <div className="border-b border-black/10 pb-4">
            <h2 id="vista-list-heading" className="text-2xl font-bold">ประสบการณ์ที่พร้อมใช้งาน</h2>
            <p className="mt-1 text-sm leading-6 text-black/65">
              {items.length > 0
                ? `พบ ${items.length.toLocaleString("th-TH")} สถานที่จากข้อมูลที่เผยแพร่แล้ว`
                : "ยังไม่มีสื่อ 360° จาก CMS ที่พร้อมเผยแพร่"}
            </p>
          </div>
          <div className="mt-6">
            {tourState.loadError ? (
              <PublicErrorState
                title="โหลดรายการ 360° ไม่สำเร็จ"
                description="ระบบยังตรวจสอบสื่อที่เผยแพร่ไม่ได้ในขณะนี้ ข้อมูลจึงไม่ถูกแสดงเป็นรายการว่าง"
                action={<PublicButton href="/360-vista">ลองโหลดอีกครั้ง</PublicButton>}
              />
            ) : (
              <PublicVistaGrid items={items} externalProviderUrl={externalProviderUrl} />
            )}
          </div>
        </section>
      </PublicPageFrame>
      <SiteFooter />
    </div>
  );
}
