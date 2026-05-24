import type { BadgeDefinition, TouristBadge } from "@/types/tourism";
import { BadgeCard } from "./BadgeCard";

type BadgeGridProps = {
  allBadges: BadgeDefinition[];
  earnedBadges: TouristBadge[];
  compact?: boolean;
};

export function BadgeGrid({ allBadges, earnedBadges, compact = false }: BadgeGridProps) {
  const earnedMap = new Map(earnedBadges.map((b) => [b.badge.badgeId, b]));

  // Sort: earned first, then by display order
  const sorted = [...allBadges].sort((a, b) => {
    const aEarned = earnedMap.has(a.badgeId) ? 0 : 1;
    const bEarned = earnedMap.has(b.badgeId) ? 0 : 1;
    if (aEarned !== bEarned) return aEarned - bEarned;
    return a.displayOrder - b.displayOrder;
  });

  const earnedCount = earnedBadges.length;
  const totalCount = allBadges.length;

  return (
    <div className="space-y-4">
      {/* Progress summary */}
      <div className="rounded-2xl bg-tealSoft p-4 text-center">
        <p className="text-2xl font-black text-teal">
          {earnedCount} / {totalCount}
        </p>
        <p className="text-xs font-bold uppercase tracking-wide text-muted">Badges ที่สะสม</p>
      </div>

      {/* Grid */}
      <div
        className={
          compact
            ? "grid grid-cols-3 gap-3 sm:grid-cols-4"
            : "grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4"
        }
      >
        {sorted.map((badge, index) => {
          const earned = earnedMap.get(badge.badgeId);
          return (
            <BadgeCard
              key={badge.badgeId}
              badge={badge}
              earned={!!earned}
              earnedAt={earned?.earnedAt}
              compact={compact}
              index={index}
            />
          );
        })}
      </div>
    </div>
  );
}
