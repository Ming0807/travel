import "server-only";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import type { BadgeDefinition, TouristBadge, XPLevelInfo, LeaderboardEntry } from "@/types/tourism";

// ==========================================
// XP Constants
// ==========================================

export const XP_AWARD_AMOUNTS: Record<string, number> = {
  qr_checkin: 50,
  photo_upload: 30,
  certificate_generated: 100,
  survey_completed: 75,
  stamp_earned: 150,
  review_submitted: 40,
  restaurant_visit: 50,
  badge_earned: 200,
  admin_award: 0, // dynamic, set in metadata.amount
} as const;

export const XP_SOURCES = [
  "qr_checkin",
  "photo_upload",
  "certificate_generated",
  "survey_completed",
  "stamp_earned",
  "review_submitted",
  "restaurant_visit",
  "badge_earned",
  "admin_award",
] as const;

export type XPSource = (typeof XP_SOURCES)[number];

// ==========================================
// Level Calculation
// ==========================================

export function calculateLevel(xp: number): { level: number; xpForCurrent: number; xpForNext: number; progress: number } {
  if (xp < 0) return { level: 1, xpForCurrent: 0, xpForNext: 100, progress: 0 };

  const thresholds = [0, 100, 250, 500, 800, 1200, 1700, 2300, 3000, 4000];

  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (xp >= thresholds[i]) {
      const xpForCurrent = thresholds[i];
      const nextThresholdIdx = i + 1;
      const xpForNext = nextThresholdIdx < thresholds.length ? thresholds[nextThresholdIdx] : thresholds[i] + 1000 * (nextThresholdIdx - thresholds.length + 1);
      const range = xpForNext - xpForCurrent;
      const progress = range > 0 ? Math.min(1, (xp - xpForCurrent) / range) : 1;
      return { level: i + 1, xpForCurrent, xpForNext, progress };
    }
  }

  return { level: 1, xpForCurrent: 0, xpForNext: 100, progress: 0 };
}

// ==========================================
// Core XP Functions
// ==========================================

export async function awardXP(
  touristId: string,
  source: XPSource,
  metadata?: Record<string, unknown>,
  visitId?: string
): Promise<{ xpEventId: string; amount: number }> {
  const supabase = createSupabaseServiceRoleClient();

  let amount = XP_AWARD_AMOUNTS[source] ?? 0;

  if (source === "admin_award" && metadata?.amount) {
    amount = Number(metadata.amount);
  }

  if (amount <= 0) {
    throw new Error(`Invalid XP amount for source: ${source}`);
  }

  const { data, error } = await supabase
    .from("xp_events")
    .insert({
      tourist_id: touristId,
      visit_id: visitId ?? null,
      xp_source: source,
      xp_amount: amount,
      metadata: metadata ?? null,
    })
    .select("xp_event_id, xp_amount")
    .single();

  if (error) {
    throw new Error(`Failed to award XP: ${error.message}`);
  }

  return { xpEventId: data.xp_event_id, amount: data.xp_amount };
}

// ==========================================
// Badge Evaluation
// ==========================================

interface TouristStats {
  totalXp: number;
  stampCount: number;
  visitCount: number;
  surveyCount: number;
  reviewCount: number;
  restaurantVisitCount: number;
  provinceCount: number;
  culturalCount: number;
  earnedBadgeIds: Set<number>;
}

async function fetchTouristStats(touristId: string): Promise<TouristStats> {
  const supabase = createSupabaseServiceRoleClient();

  const responses = await Promise.all([
    supabase.from("tourist_xp_summary").select("total_xp").eq("tourist_id", touristId).maybeSingle(),
    supabase.from("tourist_badges").select("badge_id").eq("tourist_id", touristId),
    supabase.from("visits").select("*", { count: "exact", head: true }).eq("tourist_id", touristId),
    supabase.from("satisfaction_surveys").select("*", { count: "exact", head: true }).eq("tourist_id", touristId),
    supabase.from("reviews").select("*", { count: "exact", head: true }).eq("tourist_id", touristId).eq("status", "approved"),
    supabase.from("tourist_stamps").select("*", { count: "exact", head: true }).eq("tourist_id", touristId),
    supabase.from("visits").select("*", { count: "exact", head: true }).eq("tourist_id", touristId).not("restaurant_id", "is", null),
    supabase.from("visits").select("attractions!inner(province_id)").eq("tourist_id", touristId).not("attraction_id", "is", null),
    supabase.from("visits").select("*", { count: "exact", head: true }).eq("tourist_id", touristId).filter("attractions.category", "eq", "cultural_religious"),
  ]);

  const [xpSummaryRes, earnedBadgesRes, visitCountRes, surveyCountRes, reviewCountRes, stampCountRes, restaurantVisitRes, provinceRes, culturalRes] = responses;

  const totalXp = xpSummaryRes.data?.total_xp ?? 0;
  const earnedBadgeIds = new Set<number>((earnedBadgesRes.data ?? []).map((b: any) => b.badge_id));
  const visitCount = visitCountRes.count ?? 0;
  const surveyCount = surveyCountRes.count ?? 0;
  const reviewCount = reviewCountRes.count ?? 0;
  const stampCount = stampCountRes.count ?? 0;
  const restaurantVisitCount = restaurantVisitRes.count ?? 0;
  const uniqueProvinces = new Set<number>((provinceRes.data ?? []).map((r: any) => r.attractions?.province_id).filter(Boolean));
  const culturalCount = culturalRes.count ?? 0;

  return {
    totalXp,
    stampCount,
    visitCount,
    surveyCount,
    reviewCount,
    restaurantVisitCount,
    provinceCount: uniqueProvinces.size,
    culturalCount,
    earnedBadgeIds,
  };
}

export async function evaluateBadges(touristId: string): Promise<TouristBadge[]> {
  const supabase = createSupabaseServiceRoleClient();
  const newBadges: TouristBadge[] = [];

  const { data: definitions, error: defError } = await supabase
    .from("badge_definitions")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (defError) throw new Error(`Failed to fetch badge definitions: ${defError.message}`);

  const stats = await fetchTouristStats(touristId);

  for (const def of definitions ?? []) {
    if (stats.earnedBadgeIds.has(def.badge_id)) continue;

    let qualifies = false;

    switch (def.requirement_type) {
      case "xp_total":
        qualifies = stats.totalXp >= def.requirement_value;
        break;
      case "stamp_count":
        qualifies = stats.stampCount >= def.requirement_value;
        break;
      case "visit_count":
        qualifies = stats.visitCount >= def.requirement_value;
        break;
      case "survey_count":
        qualifies = stats.surveyCount >= def.requirement_value;
        break;
      case "review_count":
        qualifies = stats.reviewCount >= def.requirement_value;
        break;
      case "restaurant_count":
        qualifies = stats.restaurantVisitCount >= def.requirement_value;
        break;
      case "province_count":
        qualifies = stats.provinceCount >= def.requirement_value;
        break;
      case "attraction_category":
        qualifies = stats.culturalCount >= def.requirement_value;
        break;
      case "attractions_in_province":
        qualifies = false; // requires extra logic; handled as needed
        break;
    }

    if (qualifies) {
      const { data: award, error: awardError } = await supabase
        .from("tourist_badges")
        .insert({ tourist_id: touristId, badge_id: def.badge_id })
        .select("badge_award_id, earned_at")
        .single();

      if (!awardError && award) {
        await awardXP(touristId, "badge_earned", { badge_key: def.badge_key });

        newBadges.push({
          badgeAwardId: award.badge_award_id,
          badge: {
            badgeId: def.badge_id,
            badgeKey: def.badge_key,
            nameTh: def.name_th,
            nameEn: def.name_en,
            descriptionTh: def.description_th,
            descriptionEn: def.description_en,
            iconName: def.icon_name,
            iconColor: def.icon_color ?? "#E18868",
            category: def.category,
            requirementType: def.requirement_type,
            requirementValue: def.requirement_value,
            requirementExtra: def.requirement_extra,
            displayOrder: def.display_order,
            isActive: def.is_active,
          },
          earnedAt: award.earned_at,
        });
      }
    }
  }

  return newBadges;
}

// ==========================================
// Query Functions
// ==========================================

export async function getTouristXP(touristId: string): Promise<XPLevelInfo> {
  const supabase = createSupabaseServiceRoleClient();

  const { data, error } = await supabase
    .from("tourist_xp_summary")
    .select("total_xp")
    .eq("tourist_id", touristId)
    .maybeSingle();

  if (error) throw new Error(`Failed to fetch XP: ${error.message}`);

  const currentXp = data?.total_xp ?? 0;
  const { level, xpForCurrent, xpForNext, progress } = calculateLevel(currentXp);

  return { currentXp, currentLevel: level, xpForCurrentLevel: xpForCurrent, xpForNextLevel: xpForNext, progress };
}

export async function getTouristBadges(touristId: string): Promise<TouristBadge[]> {
  const supabase = createSupabaseServiceRoleClient();

  const { data, error } = await supabase
    .from("tourist_badges")
    .select(`
      badge_award_id,
      earned_at,
      badge_definitions!inner(*)
    `)
    .eq("tourist_id", touristId)
    .order("earned_at", { ascending: false });

  if (error) throw new Error(`Failed to fetch badges: ${error.message}`);

  return (data ?? []).map((row: any) => ({
    badgeAwardId: row.badge_award_id,
    badge: {
      badgeId: row.badge_definitions.badge_id,
      badgeKey: row.badge_definitions.badge_key,
      nameTh: row.badge_definitions.name_th,
      nameEn: row.badge_definitions.name_en,
      descriptionTh: row.badge_definitions.description_th,
      descriptionEn: row.badge_definitions.description_en,
      iconName: row.badge_definitions.icon_name,
      iconColor: row.badge_definitions.icon_color ?? "#E18868",
      category: row.badge_definitions.category,
      requirementType: row.badge_definitions.requirement_type,
      requirementValue: row.badge_definitions.requirement_value,
      requirementExtra: row.badge_definitions.requirement_extra,
      displayOrder: row.badge_definitions.display_order,
      isActive: row.badge_definitions.is_active,
    },
    earnedAt: row.earned_at,
  }));
}

export async function getLeaderboard(
  period: "weekly" | "monthly" | "all_time" = "all_time",
  limit: number = 50
): Promise<LeaderboardEntry[]> {
  const supabase = createSupabaseServiceRoleClient();

  if (period !== "all_time") {
    const today = new Date().toISOString().split("T")[0];
    const { data: snapshot } = await supabase
      .from("leaderboard_snapshots")
      .select("ranking")
      .eq("period", period)
      .eq("snapshot_date", today)
      .maybeSingle();

    if (snapshot?.ranking) {
      return (snapshot.ranking as any[]).slice(0, limit).map((entry, index) => ({
        rank: entry.rank ?? index + 1,
        touristId: entry.tourist_id,
        touristName: entry.tourist_name,
        totalXp: entry.total_xp,
        badgeCount: entry.badge_count,
        stampCount: entry.stamp_count,
        visitCount: entry.visit_count,
        level: calculateLevel(entry.total_xp).level,
      }));
    }
  }

  // Compute leaderboard from live data using proper Date objects
  let query = supabase
    .from("xp_events")
    .select(`
      tourist_id,
      tourists!inner(display_name),
      xp_amount
    `);

  if (period === "weekly") {
    const cutoff = new Date(Date.now() - 7 * 86400000).toISOString();
    query = query.gte("created_at", cutoff);
  } else if (period === "monthly") {
    const cutoff = new Date(Date.now() - 30 * 86400000).toISOString();
    query = query.gte("created_at", cutoff);
  }

  const { data, error } = await query;

  if (error) throw new Error(`Failed to fetch leaderboard: ${error.message}`);

  // Aggregate XP per tourist
  const xpMap = new Map<string, number>();
  const nameMap = new Map<string, string>();

  for (const row of data ?? []) {
    const tid = row.tourist_id as string;
    const tourists = row.tourists as any;
    const name = Array.isArray(tourists) ? (tourists[0]?.display_name ?? "Unknown") : (tourists?.display_name ?? "Unknown");
    const amount = Number(row.xp_amount) || 0;
    xpMap.set(tid, (xpMap.get(tid) ?? 0) + amount);
    nameMap.set(tid, name);
  }

  // Sort by XP descending
  const sorted = Array.from(xpMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);

  if (sorted.length === 0) return [];

  // Batch queries: one query per statistic for ALL leaderboard tourist IDs
  const touristIds = sorted.map(([id]) => id);

  const [badgeCountsRes, stampCountsRes, visitCountsRes] = await Promise.all([
    supabase.from("tourist_badges").select("tourist_id", { count: "exact" }).in("tourist_id", touristIds),
    supabase.from("tourist_stamps").select("tourist_id", { count: "exact" }).in("tourist_id", touristIds),
    supabase.from("visits").select("tourist_id", { count: "exact" }).in("tourist_id", touristIds),
  ]);

  // Count occurrences per tourist
  function countByTourist(rows: any[]): Map<string, number> {
    const map = new Map<string, number>();
    for (const row of rows) {
      const tid = row.tourist_id as string;
      map.set(tid, (map.get(tid) ?? 0) + 1);
    }
    return map;
  }

  const badgeCountMap = countByTourist(badgeCountsRes.data ?? []);
  const stampCountMap = countByTourist(stampCountsRes.data ?? []);
  const visitCountMap = countByTourist(visitCountsRes.data ?? []);

  const entries: LeaderboardEntry[] = sorted.map(([touristId, totalXp], index) => {
    const name = nameMap.get(touristId) ?? "Unknown";

    return {
      rank: index + 1,
      touristId,
      touristName: name,
      totalXp,
      badgeCount: badgeCountMap.get(touristId) ?? 0,
      stampCount: stampCountMap.get(touristId) ?? 0,
      visitCount: visitCountMap.get(touristId) ?? 0,
      level: calculateLevel(totalXp).level,
    };
  });

  return entries;
}

/**
 * Find a tourist ID by their anonymous device identifier.
 */
export async function findTouristByDeviceId(deviceId: string): Promise<string | null> {
  const supabase = createSupabaseServiceRoleClient();

  const { data, error } = await supabase
    .from("tourist_identities")
    .select("tourist_id")
    .eq("identity_provider", "anonymous_device")
    .eq("identity_id", deviceId)
    .maybeSingle();

  if (error) return null;
  return data?.tourist_id ?? null;
}
