import { ArrowLeft, CheckCircle, PenNib } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { listLiveDestinationProvinces } from "@/lib/repositories/destination-scope.repository";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { ShareStoryForm } from "@/components/stories/ShareStoryForm";
import { TouristAuthGate } from "@/components/auth/TouristAuthGate";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "แบ่งปันเรื่องราวของคุณ | ท่องเที่ยวชายแดนใต้",
};

export const dynamic = "force-dynamic";

export default async function ShareStoryPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const isAuthenticated = !!session?.user;

  const liveProvinces = await listLiveDestinationProvinces();
  const formattedProvinces = liveProvinces.map((province) => ({
    id: province.provinceId,
    name: province.nameTh || province.nameEn,
  }));

  return (
    <div className="min-h-screen bg-white text-ink selection:bg-ink selection:text-white">
      <main className="mx-auto max-w-5xl px-4 pb-24 pt-10 sm:px-6 sm:pt-14 lg:px-8">
        <Link
          href="/stories"
          className="mb-10 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-muted transition-colors hover:text-ink"
        >
          <ArrowLeft size={16} weight="bold" />
          <span>กลับไปหน้าเรื่องราวทั้งหมด</span>
        </Link>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:gap-16">
          <header>
            <div className="mb-5 flex h-12 w-12 items-center justify-center bg-coral text-white">
              <PenNib size={24} weight="fill" aria-hidden="true" />
            </div>
            <p className="mb-3 text-xs font-bold uppercase text-coral">เรื่องราวจากนักเดินทาง</p>
            <h1 className="mb-5 text-4xl font-black leading-tight text-ink md:text-5xl">
              แบ่งปันสิ่งที่คุณพบในยะลา
            </h1>
            <p className="max-w-xl text-lg leading-8 text-muted">
              เล่าประสบการณ์จริงเพื่อช่วยให้คนถัดไปเข้าใจสถานที่ ผู้ส่งยังคงเป็นเจ้าของเนื้อหา และทุกเรื่องผ่านการตรวจสอบก่อนเผยแพร่
            </p>
            <ol className="mt-8 space-y-4 border-t border-ink/10 pt-6" aria-label="ขั้นตอนการส่งเรื่องราว">
              {["เข้าสู่ระบบเพื่อป้องกันสแปม", "เขียนเรื่องและยืนยันสิทธิ", "ทีมงานตรวจสอบก่อนเผยแพร่"].map((step, index) => (
                <li key={step} className="flex items-center gap-3 text-sm font-semibold text-ink">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center border border-ink/15 text-xs">{index + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
            <div className="mt-6 flex items-start gap-3 bg-teal/5 p-4 text-sm leading-6 text-ink">
              <CheckCircle size={20} weight="fill" className="mt-0.5 shrink-0 text-teal" />
              การเข้าสู่ระบบใช้ยืนยันผู้ส่งในขั้นตอนตรวจสอบเท่านั้น ชื่อบัญชีจะไม่แสดงเป็นชื่อผู้เขียนสาธารณะ
            </div>
          </header>

          <section className="border-t-2 border-ink pt-8 lg:border-l lg:border-t-0 lg:pl-12 lg:pt-0" aria-label="แบบฟอร์มส่งเรื่องราว">
          {!isAuthenticated ? (
            <TouristAuthGate
              title="เข้าสู่ระบบก่อนส่งเรื่องราว"
              description="เราใช้บัญชีเพื่อป้องกันสแปมและเชื่อมเรื่องราวกับผู้ส่งสำหรับขั้นตอนตรวจสอบ โดยไม่เปิดเผยชื่อบัญชีต่อผู้อ่าน"
            />
          ) : (
            <ShareStoryForm provinces={formattedProvinces} />
          )}
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
