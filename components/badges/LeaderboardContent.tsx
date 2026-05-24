"use client";

import { useState } from "react";
import { LeaderboardTable } from "./LeaderboardTable";
import type { LeaderboardEntry } from "@/types/tourism";

type LeaderboardContentProps = {
  allTime: LeaderboardEntry[];
  monthly: LeaderboardEntry[];
  weekly: LeaderboardEntry[];
  currentTouristId?: string;
};

export function LeaderboardContent({ allTime, monthly, weekly, currentTouristId }: LeaderboardContentProps) {
  const [period, setPeriod] = useState("all_time");
  const entries = period === "all_time" ? allTime : period === "monthly" ? monthly : weekly;

  return (
    <LeaderboardTable
      entries={entries}
      period={period}
      onPeriodChange={setPeriod}
      currentTouristId={currentTouristId}
    />
  );
}
