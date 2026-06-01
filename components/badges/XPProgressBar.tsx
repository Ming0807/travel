"use client";

import { useEffect, useState } from "react";
import type { XPLevelInfo } from "@/types/tourism";

type XPProgressBarProps = {
  xp: XPLevelInfo;
  compact?: boolean;
};

export function XPProgressBar({ xp, compact = false }: XPProgressBarProps) {
  const progressPercent = Math.round(xp.progress * 100);
  const [animWidth, setAnimWidth] = useState(0);

  useEffect(() => {
    // Reset to 0 then animate to target width
    setAnimWidth(0);
    const timer = setTimeout(() => {
      setAnimWidth(progressPercent);
    }, 200);
    return () => clearTimeout(timer);
  }, [progressPercent]);

  return (
    <div className={`rounded-xl bg-white shadow-card transition-shadow duration-300 hover:shadow-lg ${compact ? "p-4" : "p-6"}`}>
      {/* Header */}
      <div className={`flex items-center justify-between ${compact ? "mb-2" : "mb-4"}`}>
        <div>
          <span className="text-xs font-bold uppercase tracking-wide text-muted">Level</span>
          <p className={`font-black text-ink ${compact ? "text-2xl" : "text-4xl"}`}>
            {xp.currentLevel}
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold uppercase tracking-wide text-muted">XP</span>
          <p className={`font-black text-teal ${compact ? "text-xl" : "text-3xl"}`}>
            {xp.currentXp.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-muted">
            {xp.xpForCurrentLevel.toLocaleString()} XP
          </span>
          <span className="font-bold text-ink">{progressPercent}%</span>
          <span className="font-semibold text-muted">
            {xp.xpForNextLevel.toLocaleString()} XP
          </span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-tealSoft">
          <div
            className="h-full rounded-full bg-gradient-to-r from-teal to-gold transition-all duration-1000 ease-out"
            style={{ width: `${animWidth}%` }}
          />
        </div>
        {!compact && (
          <p className="pt-2 text-xs text-muted">
            {xp.xpForNextLevel - xp.currentXp > 0
              ? `อีก ${(xp.xpForNextLevel - xp.currentXp).toLocaleString()} XP ถึงเลเวลถัดไป`
              : "ถึงเลเวลสูงสุดแล้ว! 🎉"}
          </p>
        )}
      </div>
    </div>
  );
}
