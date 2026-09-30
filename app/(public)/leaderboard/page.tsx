export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { Suspense } from "react";
import { getLeaderboardResult } from "@/lib/services/xp.service";
import { getTouristLeaderboardPreference } from "@/lib/repositories/tourist.repository";
import { resolveCurrentTouristId, TouristAccessError } from "@/lib/auth/guards";
import { LeaderboardContent } from "@/components/badges/LeaderboardContent";
import { LeaderboardLoading, LeaderboardPageShell } from "@/components/badges/LeaderboardPageShell";
import { SiteFooter } from "@/components/layout/SiteFooter";

export const metadata: Metadata = {
  title: "กระดานอันดับนักเดินทาง",
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
  return <>
    <LeaderboardPageShell><Suspense fallback={<LeaderboardLoading />}><LeaderboardData /></Suspense></LeaderboardPageShell>
    <SiteFooter />
  </>;
}
