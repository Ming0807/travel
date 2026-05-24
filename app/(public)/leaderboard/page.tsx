export const dynamic = "force-dynamic";

import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, Trophy } from "@phosphor-icons/react/dist/ssr";
import { getLeaderboard, findTouristByDeviceId } from "@/lib/services/xp.service";
import { getGuestIdentity } from "@/lib/auth/guest";
import { LeaderboardContent } from "@/components/badges/LeaderboardContent";

async function LeaderboardData() {
  const [allTime, monthly, weekly, guestToken] = await Promise.all([
    getLeaderboard("all_time", 100),
    getLeaderboard("monthly", 100),
    getLeaderboard("weekly", 100),
    getGuestIdentity(),
  ]);

  let currentTouristId: string | undefined;
  if (guestToken) {
    currentTouristId = (await findTouristByDeviceId(guestToken)) ?? undefined;
  }

  return (
    <div className="space-y-6">
      <LeaderboardContent
        allTime={allTime}
        monthly={monthly}
        weekly={weekly}
        currentTouristId={currentTouristId}
      />

      {/* Podium — top 3 */}
      {allTime.length >= 3 && (
        <div className="rounded-2xl bg-gradient-to-br from-teal to-ink p-6 text-center text-white shadow-glow">
          <Trophy size={32} weight="fill" className="mx-auto text-gold" />
          <p className="mt-1 text-xs font-black uppercase tracking-[0.24em] text-gold">Top Explorer</p>
          <p className="mt-2 text-3xl font-black">{allTime[0].touristName}</p>
          <p className="mt-1 text-sm text-white/75">
            {allTime[0].totalXp.toLocaleString()} XP · Level {allTime[0].level}
          </p>
          <div className="mt-4 flex justify-center gap-6">
            <div className="text-center">
              <p className="text-lg font-black">{allTime[0].badgeCount}</p>
              <p className="text-[10px] font-bold uppercase text-white/60">Badges</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-black">{allTime[0].stampCount}</p>
              <p className="text-[10px] font-bold uppercase text-white/60">Stamps</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-black">{allTime[0].visitCount}</p>
              <p className="text-[10px] font-bold uppercase text-white/60">Visits</p>
            </div>
          </div>
        </div>
      )}

      {/* My Rank */}
      {currentTouristId && (
        <div className="rounded-2xl bg-white p-4 shadow-card">
          <p className="text-xs font-bold uppercase tracking-wide text-muted">อันดับของคุณ</p>
          <p className="mt-1 text-lg font-black text-ink">
            #{allTime.findIndex((e) => e.touristId === currentTouristId) + 1}
          </p>
        </div>
      )}
    </div>
  );
}

export default async function LeaderboardPage() {
  return (
    <main className="min-h-screen bg-cream px-4 pb-28 pt-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm font-bold text-teal hover:underline"
        >
          <ArrowLeft size={16} weight="bold" />
          กลับหน้าหลัก
        </Link>

        <div>
          <h1 className="text-3xl font-black text-ink">Leaderboard</h1>
          <p className="mt-1 text-sm leading-6 text-muted">
            อันดับนักท่องเที่ยวที่สะสม XP มากที่สุด
          </p>
        </div>

        <Suspense
          fallback={
            <div className="flex items-center justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal border-t-transparent" />
            </div>
          }
        >
          <LeaderboardData />
        </Suspense>
      </div>
    </main>
  );
}
