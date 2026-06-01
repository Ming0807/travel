export const dynamic = "force-dynamic";

import Link from "next/link";
import { Compass, QrCode, Warning } from "@phosphor-icons/react/dist/ssr";
import { PassportSummary } from "@/components/passport/PassportSummary";
import { ProvinceProgress } from "@/components/passport/ProvinceProgress";
import { StampGrid } from "@/components/passport/StampGrid";
import { AccountLinkingTeaser } from "@/components/passport/AccountLinkingTeaser";
import { LineRecoveryPanel } from "@/components/account/LineRecoveryPanel";
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
      <main className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
        <div className="max-w-md w-full rounded-2xl bg-white p-8 md:p-10 text-center border border-ink/5">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-cream text-coral">
            <Compass size={40} weight="fill" />
          </div>
          <h1 className="text-3xl font-black text-ink">เริ่มต้นการเดินทาง</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            สแกน QR Code ที่สถานที่ท่องเที่ยวเพื่อเริ่มสะสมตราประทับดิจิทัลของคุณ
          </p>
          <div className="mt-8 grid gap-4">
            <Link
              href="/attractions"
              className="flex items-center justify-center gap-2 rounded-full bg-coral px-6 py-4 font-bold text-white shadow-sm transition-colors hover:bg-coral/90"
            >
              <QrCode weight="fill" size={20} /> สำรวจสถานที่ท่องเที่ยว
            </Link>
            <Link
              href="/"
              className="rounded-full bg-background border border-ink/5 px-6 py-4 text-center font-bold text-ink transition-colors hover:bg-white"
            >
              กลับหน้าหลัก
            </Link>
          </div>
          
          <LineRecoveryPanel />
        </div>
      </main>
    );
  }

  if (result.kind === "error") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-md w-full rounded-2xl bg-white p-8 text-center border border-ink/5">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500">
            <Warning size={32} weight="fill" />
          </div>
          <h1 className="text-2xl font-black text-ink">เกิดข้อผิดพลาด</h1>
          <p className="mt-3 text-sm leading-6 text-muted">
            ไม่สามารถโหลดพาสปอร์ตได้ กรุณาลองใหม่อีกครั้ง
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex w-full justify-center rounded-full bg-ink px-6 py-4 font-bold text-white transition-colors hover:bg-ink/80"
          >
            กลับหน้าหลัก
          </Link>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="min-h-[calc(100vh-200px)] bg-background px-4 pb-28 pt-12 md:pt-20 relative overflow-hidden text-ink">
        {/* Premium Background Elements */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-coral/5 rounded-full blur-[120px] -z-10 translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-teal/5 rounded-full blur-[150px] -z-10 -translate-x-1/3 translate-y-1/3 pointer-events-none"></div>
        
        <div className="mx-auto max-w-xl space-y-8 relative z-10">
          <div className="mb-4">
            <h1 className="text-4xl md:text-5xl font-black text-ink tracking-tight">My Passport</h1>
            <p className="text-muted text-base mt-3 max-w-sm">สะสมตราประทับและบันทึกการเดินทางของคุณในดินแดนใต้</p>
          </div>
          <PassportSummary passport={result.passport} />
          <ProvinceProgress progress={result.passport.provinceProgress} />
          <StampGrid passport={result.passport} />
          <AccountLinkingTeaser isGuest={result.passport.isGuest} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
