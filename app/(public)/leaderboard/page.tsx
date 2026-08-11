export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, LockKey, Sparkle, Trophy } from "@phosphor-icons/react/dist/ssr";
import { getLeaderboardResult } from "@/lib/services/xp.service";
import { getTouristLeaderboardPreference } from "@/lib/repositories/tourist.repository";
import { resolveCurrentTouristId, TouristAccessError } from "@/lib/auth/guards";
import { LeaderboardContent } from "@/components/badges/LeaderboardContent";
import { PublicPageFrame } from "@/components/public/PublicPageFrame";
import { SiteFooter } from "@/components/layout/SiteFooter";

export const metadata: Metadata = {
  title: "กระดานผู้นำนักเดินทาง",
  description: "อันดับ XP สำหรับนักเดินทางที่เลือกเข้าร่วมแบบสาธารณะ พร้อมตัวเลือกใช้นามแฝงและถอนการแสดงผลได้ทุกเมื่อ",
  alternates: { canonical: "/leaderboard" },
};

async function resolveOptionalTouristId() {
  try {
    return await resolveCurrentTouristId();
  } catch (error) {
    if (error instanceof TouristAccessError && error.code === "TOURIST_IDENTITY_NOT_FOUND") return undefined;
    throw error;
  }
}

async function LeaderboardData() {
  const currentTouristId = await resolveOptionalTouristId();
  const [allTime, monthly, weekly, preference] = await Promise.all([
    getLeaderboardResult("all_time", 100, currentTouristId),
    getLeaderboardResult("monthly", 100, currentTouristId),
    getLeaderboardResult("weekly", 100, currentTouristId),
    currentTouristId
      ? getTouristLeaderboardPreference(currentTouristId).catch(() => ({ visibility: "private" as const, alias: null }))
      : Promise.resolve(null),
  ]);

  const unavailable = [allTime, monthly, weekly].find((result) => result.kind === "unavailable");

  return (
    <LeaderboardContent
      allTime={allTime.kind === "ready" ? allTime.entries : []}
      monthly={monthly.kind === "ready" ? monthly.entries : []}
      weekly={weekly.kind === "ready" ? weekly.entries : []}
      currentVisibility={preference?.visibility}
      availability={unavailable?.kind === "unavailable" ? unavailable.reason : "ready"}
    />
  );
}

export default function LeaderboardPage() {
  return (
    <>
      <main className="bg-background pb-20 pt-8 text-ink sm:pt-12">
        <PublicPageFrame variant="detail">
          <Link href="/" className="inline-flex min-h-11 items-center gap-2 rounded-md border border-ink/15 bg-white px-4 py-2 text-sm font-bold text-ink hover:border-coral hover:text-coral">
            <ArrowLeft size={16} weight="bold" aria-hidden="true" /> กลับหน้าหลัก
          </Link>

          <header className="mt-7 grid gap-6 rounded-lg border border-ink/10 bg-white p-6 sm:p-8 lg:grid-cols-3 lg:items-end">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 text-xs font-bold text-coral">
                <Trophy size={17} weight="fill" aria-hidden="true" /> แรงบันดาลใจในการเดินทาง
              </div>
              <h1 className="mt-3 text-3xl font-black leading-tight text-ink sm:text-4xl">กระดานผู้นำนักเดินทาง</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
                สะสม XP จากกิจกรรมท่องเที่ยว ตราประทับ และการแบ่งปันข้อมูลโดยสมัครใจ เพื่อขยับอันดับของคุณ
              </p>
            </div>
            <div className="rounded-lg border border-coral/20 bg-coral/[0.06] p-4">
              <Sparkle size={22} className="text-coral" weight="fill" aria-hidden="true" />
              <p className="mt-3 text-sm font-black text-ink">คะแนนมีไว้สร้างแรงจูงใจ</p>
              <p className="mt-1 text-xs leading-5 text-muted">ไม่ใช่การจัดอันดับคุณค่าของนักท่องเที่ยว และไม่มีผลต่อสิทธิ์การใช้งานระบบ</p>
            </div>
          </header>

          <div className="mt-6 rounded-lg border border-ink/10 bg-white p-5 sm:p-6">
            <div className="mb-5 flex items-start gap-3 rounded-md border border-teal/20 bg-teal/[0.05] p-4">
              <LockKey size={20} className="mt-0.5 shrink-0 text-teal" weight="fill" aria-hidden="true" />
              <p className="text-xs leading-5 text-ink/75">
                รายชื่อนี้แสดงเฉพาะผู้ที่เลือกเข้าร่วมแบบสาธารณะ คุณเลือกใช้นามแฝงหรือถอนการแสดงผลได้ทุกเมื่อจากหน้าโปรไฟล์
              </p>
            </div>
            <Suspense fallback={<div className="h-72 animate-pulse rounded-lg bg-background" aria-label="กำลังโหลดกระดานผู้นำ" />}>
              <LeaderboardData />
            </Suspense>
          </div>
        </PublicPageFrame>
      </main>
      <SiteFooter />
    </>
  );
}
