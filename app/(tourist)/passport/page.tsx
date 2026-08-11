export const dynamic = "force-dynamic";

import Link from "next/link";
import { ArrowRight, Compass, QrCode, Warning } from "@phosphor-icons/react/dist/ssr";
import { PassportSummary } from "@/components/passport/PassportSummary";
import { ProvinceProgress } from "@/components/passport/ProvinceProgress";
import { StampGrid } from "@/components/passport/StampGrid";
import { RecentPassportVisits } from "@/components/passport/RecentPassportVisits";
import { AccountLinkingTeaser } from "@/components/passport/AccountLinkingTeaser";
import { LineRecoveryPanel } from "@/components/account/LineRecoveryPanel";
import { PublicPageFrame } from "@/components/public/PublicPageFrame";
import { getCurrentTouristPassport, type PassportViewModel } from "@/lib/services/passport.service";
import { TouristAccessError } from "@/lib/auth/guards";
import { SiteFooter } from "@/components/layout/SiteFooter";

type PassportResult =
  | { kind: "ready"; passport: PassportViewModel }
  | { kind: "no_identity" }
  | { kind: "error" };

async function loadPassport(): Promise<PassportResult> {
  try {
    const passport = await getCurrentTouristPassport();
    return { kind: "ready", passport };
  } catch (error) {
    if (error instanceof TouristAccessError && error.code === "TOURIST_IDENTITY_NOT_FOUND") {
      return { kind: "no_identity" };
    }
    return { kind: "error" };
  }
}

export default async function PassportPage() {
  const result = await loadPassport();

  if (result.kind === "no_identity") {
    return (
      <main className="min-h-[70vh] bg-background pb-32 pt-2 sm:py-10">
        <PublicPageFrame variant="reading">
          <section className="rounded-lg border border-ink/10 bg-white p-6 sm:p-8">
            <span className="grid h-12 w-12 place-items-center rounded-md bg-coral/10 text-coral">
              <Compass size={27} weight="fill" aria-hidden="true" />
            </span>
            <p className="mt-6 text-xs font-bold text-coral">พาสปอร์ตท่องเที่ยวดิจิทัล</p>
            <h1 className="mt-2 text-2xl font-black text-ink sm:text-3xl">เริ่มสะสมความทรงจำจากยะลา</h1>
            <p className="mt-3 text-sm leading-7 text-muted">
              สแกน QR ที่จุดท่องเที่ยวที่เข้าร่วมเพื่อบันทึกการเดินทาง รับตราประทับ และสร้างใบประกาศของคุณ
            </p>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <Link
                href="/attractions"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-coral px-5 py-3 text-sm font-bold text-white hover:bg-coral/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2"
              >
                <QrCode weight="fill" size={19} aria-hidden="true" /> ดูจุดท่องเที่ยว
              </Link>
              <Link
                href="/"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-ink/15 px-5 py-3 text-sm font-bold text-ink hover:border-ink/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2"
              >
                กลับหน้าหลัก <ArrowRight size={17} aria-hidden="true" />
              </Link>
            </div>
            <LineRecoveryPanel />
          </section>
        </PublicPageFrame>
      </main>
    );
  }

  if (result.kind === "error") {
    return (
      <main className="min-h-[70vh] bg-background pb-32 pt-2 sm:py-10">
        <PublicPageFrame variant="reading">
          <section className="rounded-lg border border-ink/10 bg-white p-6 sm:p-8">
            <span className="grid h-12 w-12 place-items-center rounded-md bg-red-50 text-red-600">
              <Warning size={26} weight="fill" aria-hidden="true" />
            </span>
            <h1 className="mt-5 text-2xl font-black text-ink">ยังเปิดพาสปอร์ตไม่ได้</h1>
            <p className="mt-3 text-sm leading-6 text-muted">ระบบอาจขัดข้องชั่วคราว กรุณาลองเปิดหน้านี้ใหม่อีกครั้ง</p>
            <Link
              href="/"
              className="mt-6 inline-flex min-h-12 items-center justify-center rounded-md bg-ink px-5 py-3 text-sm font-bold text-white hover:bg-ink/90"
            >
              กลับหน้าหลัก
            </Link>
          </section>
        </PublicPageFrame>
      </main>
    );
  }

  return (
    <>
      <main className="bg-background pb-20 pt-8 text-ink sm:pt-12">
        <PublicPageFrame variant="detail">
          <header className="mb-7 max-w-2xl">
            <p className="text-xs font-bold text-coral">Digital Passport</p>
            <h1 className="mt-2 text-3xl font-black text-ink sm:text-4xl">พาสปอร์ตการเดินทางของฉัน</h1>
            <p className="mt-3 text-sm leading-7 text-muted">
              ดูตราที่สะสมแล้ว วางแผนจุดหมายถัดไป และย้อนดูการเดินทางที่สร้างใบประกาศสำเร็จ
            </p>
          </header>

          <div className="space-y-7">
            <PassportSummary passport={result.passport} />
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
              <StampGrid passport={result.passport} />
              <aside className="space-y-6">
                <ProvinceProgress progress={result.passport.provinceProgress} />
                <RecentPassportVisits visits={result.passport.recentVisits} />
              </aside>
            </div>
            <AccountLinkingTeaser isGuest={result.passport.isGuest} />
          </div>
        </PublicPageFrame>
      </main>
      <SiteFooter />
    </>
  );
}
