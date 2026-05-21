export const dynamic = "force-dynamic";

import Link from "next/link";
import { Compass, QrCode, Warning } from "@phosphor-icons/react/dist/ssr";
import { PassportSummary } from "@/components/passport/PassportSummary";
import { ProvinceProgress } from "@/components/passport/ProvinceProgress";
import { StampGrid } from "@/components/passport/StampGrid";
import { AccountLinkingTeaser } from "@/components/passport/AccountLinkingTeaser";
import { getCurrentTouristPassport, type PassportViewModel } from "@/lib/services/passport.service";
import { TouristAccessError } from "@/lib/auth/guards";

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
      <main className="flex min-h-screen items-center justify-center bg-cream px-4">
        <div className="max-w-sm rounded-[2rem] bg-white p-8 text-center shadow-card">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gold/20 text-gold">
            <Compass size={36} weight="fill" />
          </div>
          <h1 className="text-2xl font-black text-ink">เริ่มต้นการเดินทาง</h1>
          <p className="mt-3 text-sm leading-6 text-muted">
            สแกน QR Code ที่สถานที่ท่องเที่ยวเพื่อเริ่มสะสมตราประทับดิจิทัลของคุณ
          </p>
          <div className="mt-6 grid gap-3">
            <Link
              href="/attractions"
              className="flex items-center justify-center gap-2 rounded-full bg-teal px-5 py-4 font-black text-white shadow-lg shadow-teal/20"
            >
              <QrCode weight="fill" /> สำรวจสถานที่ท่องเที่ยว
            </Link>
            <Link
              href="/"
              className="rounded-full bg-tealSoft px-5 py-3 text-center font-bold text-teal"
            >
              กลับหน้าหลัก
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (result.kind === "error") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-cream px-4">
        <div className="max-w-sm rounded-[2rem] bg-white p-8 text-center shadow-card">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-coral/15 text-coral">
            <Warning size={28} weight="fill" />
          </div>
          <h1 className="text-xl font-black text-ink">เกิดข้อผิดพลาด</h1>
          <p className="mt-3 text-sm leading-6 text-muted">
            ไม่สามารถโหลดพาสปอร์ตได้ กรุณาลองใหม่อีกครั้ง
          </p>
          <Link
            href="/"
            className="mt-5 inline-flex rounded-full bg-teal px-5 py-3 font-bold text-white"
          >
            กลับหน้าหลัก
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cream px-4 pb-28 pt-8">
      <div className="mx-auto max-w-lg space-y-5">
        <PassportSummary passport={result.passport} />
        <ProvinceProgress progress={result.passport.provinceProgress} />
        <StampGrid passport={result.passport} />
        <AccountLinkingTeaser isGuest={result.passport.isGuest} />
      </div>
    </main>
  );
}
