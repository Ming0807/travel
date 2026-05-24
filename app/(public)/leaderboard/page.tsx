export const dynamic = "force-dynamic";

import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, Trophy } from "@phosphor-icons/react/dist/ssr";
import { getLeaderboard, findTouristByDeviceId } from "@/lib/services/xp.service";
import { getGuestIdentity } from "@/lib/auth/guest";
import { LeaderboardContent } from "@/components/badges/LeaderboardContent";
import { SiteFooter } from "@/components/layout/SiteFooter";

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
        <div className="relative mt-12 mb-8 flex items-end justify-center gap-2 sm:gap-4 px-2">
          {/* 2nd Place */}
          <div className="relative flex w-1/3 flex-col items-center pb-2">
            <div className="absolute -top-10 flex h-14 w-14 items-center justify-center rounded-full border-4 border-white bg-slate-200 text-lg font-black text-slate-500 shadow-md">
              {allTime[1].touristName.substring(0, 2)}
            </div>
            <div className="flex h-32 w-full flex-col items-center justify-center rounded-t-2xl bg-gradient-to-t from-slate-200 to-slate-100 shadow-inner">
              <span className="text-3xl font-black text-slate-400">2</span>
              <span className="mt-2 text-xs font-bold text-slate-600 truncate w-full px-2 text-center">{allTime[1].touristName}</span>
              <span className="text-[10px] font-black text-slate-500">{allTime[1].totalXp.toLocaleString()} XP</span>
            </div>
          </div>

          {/* 1st Place */}
          <div className="relative flex w-1/3 flex-col items-center z-10">
            <Trophy size={32} weight="fill" className="absolute -top-20 text-gold drop-shadow-md animate-bounce" />
            <div className="absolute -top-10 flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-gold to-yellow-500 text-xl font-black text-white shadow-xl ring-4 ring-gold/20">
              {allTime[0].touristName.substring(0, 2)}
            </div>
            <div className="flex h-40 w-full flex-col items-center justify-center rounded-t-2xl bg-gradient-to-t from-coral to-coral/80 shadow-lg shadow-coral/20">
              <span className="text-4xl font-black text-white/90">1</span>
              <span className="mt-2 text-sm font-bold text-white truncate w-full px-2 text-center">{allTime[0].touristName}</span>
              <span className="text-xs font-black text-white/90">{allTime[0].totalXp.toLocaleString()} XP</span>
            </div>
          </div>

          {/* 3rd Place */}
          <div className="relative flex w-1/3 flex-col items-center pb-4">
            <div className="absolute -top-10 flex h-14 w-14 items-center justify-center rounded-full border-4 border-white bg-amber-700/80 text-lg font-black text-white shadow-md">
              {allTime[2].touristName.substring(0, 2)}
            </div>
            <div className="flex h-28 w-full flex-col items-center justify-center rounded-t-2xl bg-gradient-to-t from-amber-100 to-amber-50 shadow-inner">
              <span className="text-3xl font-black text-amber-800/50">3</span>
              <span className="mt-2 text-xs font-bold text-amber-900 truncate w-full px-2 text-center">{allTime[2].touristName}</span>
              <span className="text-[10px] font-black text-amber-800">{allTime[2].totalXp.toLocaleString()} XP</span>
            </div>
          </div>
        </div>
      )}

      {/* My Rank */}
      {currentTouristId && (
        <div className="rounded-2xl bg-white p-4 shadow-card border border-coral/10 flex justify-between items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-muted">อันดับของคุณ</p>
            <p className="mt-1 text-2xl font-black text-ink">
              #{allTime.findIndex((e) => e.touristId === currentTouristId) + 1}
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-coral bg-coral/10 px-3 py-1 rounded-full">เก็บ XP เพื่อไต่อันดับ</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default async function LeaderboardPage() {
  return (
    <>
      <main className="min-h-screen bg-[#FAF8F5] px-4 pb-24 pt-12 md:pt-20 relative overflow-hidden text-ink">
        {/* Premium Background Elements */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-coral/5 rounded-full blur-[120px] -z-10 translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-teal/5 rounded-full blur-[150px] -z-10 -translate-x-1/3 translate-y-1/3 pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 w-full h-[400px] -translate-x-1/2 -translate-y-1/2 bg-[url('/noise.png')] opacity-20 mix-blend-overlay -z-10 pointer-events-none"></div>
        
        <div className="mx-auto max-w-4xl space-y-12 relative z-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-ink/5 text-sm font-bold text-ink hover:bg-cream hover:text-coral transition-colors shadow-sm w-fit group"
          >
            <ArrowLeft size={16} weight="bold" className="transition-transform group-hover:-translate-x-1" />
            กลับหน้าหลัก
          </Link>

          <div className="text-center bg-white/40 backdrop-blur-md rounded-[3rem] py-12 px-6 border border-white shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200px] h-[4px] bg-gradient-to-r from-transparent via-coral to-transparent"></div>
            
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white text-coral text-xs font-black uppercase tracking-widest mb-6 shadow-sm border border-coral/10">
              <span className="w-2 h-2 rounded-full bg-coral animate-pulse"></span>
              Hall of Fame
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-ink tracking-tight mb-6 leading-[1.1]">
              กระดานผู้นำ <br className="hidden sm:block"/>
              <span className="font-['Playfair_Display'] italic font-light text-coral">Leaderboard</span>
            </h1>
            <p className="text-base md:text-lg leading-relaxed text-muted max-w-xl mx-auto font-medium">
              เชิดชูเกียรตินักเดินทางที่ร่วมสำรวจและสะสมประสบการณ์มากที่สุดในดินแดนใต้ ร่วมผจญภัยและไต่อันดับไปด้วยกัน
            </p>
          </div>

          <Suspense
            fallback={
              <div className="flex flex-col items-center justify-center py-32 space-y-4">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-coral" />
                <p className="text-sm font-bold text-muted animate-pulse">กำลังโหลดข้อมูลกระดานผู้นำ...</p>
              </div>
            }
          >
            <div className="bg-white rounded-[2rem] shadow-sm border border-ink/5 p-4 md:p-8">
              <LeaderboardData />
            </div>
          </Suspense>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
