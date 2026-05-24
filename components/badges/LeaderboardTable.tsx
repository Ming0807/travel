"use client";

import type { LeaderboardEntry } from "@/types/tourism";
import { Trophy, Medal, Star, Crown } from "@phosphor-icons/react/dist/ssr";

type LeaderboardTableProps = {
  entries: LeaderboardEntry[];
  period: string;
  onPeriodChange: (period: string) => void;
  currentTouristId?: string;
};

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return (
    <div className="relative">
      <Trophy size={24} weight="fill" className="text-amber-400 drop-shadow-sm animate-in zoom-in-95 duration-300" />
      <Crown size={12} weight="fill" className="absolute -top-2 -right-2 text-amber-500" />
    </div>
  );
  if (rank === 2) return <Medal size={24} weight="fill" className="text-slate-400 animate-in zoom-in-95 duration-300 delay-75" />;
  if (rank === 3) return <Medal size={24} weight="fill" className="text-amber-700 animate-in zoom-in-95 duration-300 delay-150" />;
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-500">
      {rank}
    </span>
  );
}

const PERIODS = [
  { value: "all_time", label: "ตลอดกาล" },
  { value: "monthly", label: "รายเดือน" },
  { value: "weekly", label: "รายสัปดาห์" },
];

export function LeaderboardTable({
  entries,
  period,
  onPeriodChange,
  currentTouristId,
}: LeaderboardTableProps) {
  return (
    <div className="space-y-4">
      {/* Period filter */}
      <div className="flex gap-2">
        {PERIODS.map((p) => (
          <button
            key={p.value}
            onClick={() => onPeriodChange(p.value)}
            className={`rounded-full px-5 py-2.5 text-xs font-bold transition-all duration-300 ${
              period === p.value
                ? "bg-coral text-white shadow-md shadow-coral/20 scale-105"
                : "bg-white text-slate-600 hover:bg-cream border border-slate-200 hover:border-coral/30 hover:text-coral"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-[2rem] bg-white shadow-card border border-ink/5">
        {/* Header */}
        <div className="grid grid-cols-12 gap-2 border-b border-slate-100 bg-cream/50 px-5 py-4 text-xs font-black uppercase tracking-wide text-slate-500">
          <div className="col-span-1 text-center">#</div>
          <div className="col-span-4">นักเดินทาง</div>
          <div className="col-span-2 text-right">เลเวล</div>
          <div className="col-span-2 text-right">XP</div>
          <div className="col-span-1 text-center hidden sm:block"><Trophy size={16} weight="bold" className="mx-auto" /></div>
          <div className="col-span-1 text-center hidden sm:block"><Star size={16} weight="bold" className="mx-auto" /></div>
        </div>

        {/* Rows */}
        {entries.length === 0 ? (
          <div className="px-4 py-12 text-center text-sm text-muted">
            ยังไม่มีข้อมูลในช่วงเวลานี้
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {entries.map((entry, index) => (
              <div
                key={entry.touristId}
                className={`grid grid-cols-12 gap-2 px-5 py-4 text-sm items-center transition-all duration-300 ${
                  entry.touristId === currentTouristId
                    ? "bg-coral/5 ring-1 ring-coral/20"
                    : "hover:bg-slate-50"
                } ${entry.rank <= 3 && entry.touristId !== currentTouristId ? "bg-amber-50/20" : ""}`}
                style={{
                  animation: `leaderboard-fade-in 0.4s ease-out ${index * 0.05}s both`,
                }}
              >
                <div className="col-span-1 flex justify-center">
                  <RankBadge rank={entry.rank} />
                </div>
                <div className="col-span-4 flex items-center gap-3">
                  <div className="hidden sm:flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-black text-slate-500">
                    {entry.touristName.substring(0, 2)}
                  </div>
                  <span className="font-bold text-ink truncate text-base">{entry.touristName}</span>
                  {entry.touristId === currentTouristId && (
                    <span className="rounded-full bg-coral px-2.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
                      คุณ
                    </span>
                  )}
                </div>
                <div className="col-span-2 text-right font-black text-slate-700">
                  {entry.level}
                </div>
                <div className="col-span-2 text-right font-black text-coral">
                  {entry.totalXp.toLocaleString()}
                </div>
                <div className="col-span-1 text-center hidden sm:block text-slate-500 font-semibold text-xs">
                  {entry.badgeCount}
                </div>
                <div className="col-span-1 text-center hidden sm:block text-slate-500 font-semibold text-xs">
                  {entry.stampCount}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      <p className="text-center text-xs text-muted">
        มีนักท่องเที่ยวร่วม Leaderboard ทั้งหมด {entries.length} คน
      </p>

      {/* Keyframes for row entrance animation */}
      <style jsx>{`
        @keyframes leaderboard-fade-in {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
