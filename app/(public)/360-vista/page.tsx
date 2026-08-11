import type { Metadata } from "next";
import { ShieldCheck } from "@phosphor-icons/react/dist/ssr";

import { SiteFooter } from "@/components/layout/SiteFooter";
import { PublicButton } from "@/components/public/PublicButton";
import { PublicPageFrame } from "@/components/public/PublicPageFrame";
import { PublicErrorState } from "@/components/public/PublicStates";
import { PublicDirectoryIntro } from "@/components/public/directory/PublicDirectoryIntro";
import { PublicResultSummary } from "@/components/public/directory/PublicResultSummary";
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
      <PublicPageFrame variant="directory">
        <PublicDirectoryIntro
          breadcrumbs={[{ label: "หน้าแรก", href: "/" }, { label: "ทัวร์เสมือนจริง 360°" }]}
          title="ทัวร์เสมือนจริง 360° ในยะลา"
          description="สำรวจบรรยากาศจากสื่อที่ผู้ดูแลเชื่อมกับสถานที่จริงก่อนออกเดินทาง"
          scope="สื่อของแพลตฟอร์มและผู้ให้บริการภายนอกที่ตรวจสอบปลายทางแล้ว"
        />

        <aside className="mt-6 border-l-2 border-[var(--public-teal)] bg-white px-4 py-3" aria-label="ความเป็นส่วนตัวของลิงก์ภายนอก">
          <p className="flex items-start gap-2 text-sm font-semibold leading-6 text-[var(--public-teal)]">
            <ShieldCheck size={20} weight="fill" className="mt-0.5 shrink-0" aria-hidden="true" />
            เราไม่ส่งชื่อ โปรไฟล์ หรือรหัสนักท่องเที่ยวไปกับลิงก์ 360° ของผู้ให้บริการภายนอก
          </p>
        </aside>

        <section aria-labelledby="vista-list-heading" className="mt-9">
          <div className="border-b border-black/10 pb-4">
            <h2 id="vista-list-heading" className="text-2xl font-bold">ประสบการณ์ที่พร้อมใช้งาน</h2>
            {!tourState.loadError ? <PublicResultSummary count={items.length} noun="สถานที่" className="mt-1" /> : null}
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
