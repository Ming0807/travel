import type { BadgeDefinition } from "@/types/tourism";
import {
  Trophy,
  Star,
  MapPin,
  Footprints,
  SealCheck,
  GlobeHemisphereEast,
  ClipboardText,
  ChatCircleText,
  ForkKnife,
  Building,
} from "@phosphor-icons/react/dist/ssr";

const ICON_MAP: Record<string, any> = {
  Trophy,
  Star,
  MapPin,
  Footprints,
  SealCheck,
  GlobeHemisphereEast,
  ClipboardText,
  ChatCircleText,
  ForkKnife,
  Building,
};

// Rarity colors based on display order (lower = rarer)
const RARITY_COLORS = [
  { ring: "ring-amber-400/30", border: "border-amber-400/50", glow: "shadow-amber-400/20" },   // Gold - 1st
  { ring: "ring-slate-400/30", border: "border-slate-400/50", glow: "shadow-slate-400/20" },   // Silver - 2nd
  { ring: "ring-amber-700/30", border: "border-amber-700/50", glow: "shadow-amber-700/20" },   // Bronze - 3rd
  { ring: "ring-teal-300/20",  border: "border-teal-300/30", glow: "shadow-teal-300/10" },     // Teal - 4th+
];

type BadgeCardProps = {
  badge: BadgeDefinition;
  earned?: boolean;
  earnedAt?: string;
  compact?: boolean;
  index?: number; // for rarity color assignment
};

export function BadgeCard({ badge, earned = false, earnedAt, compact = false, index = 0 }: BadgeCardProps) {
  const IconComponent = badge.iconName ? ICON_MAP[badge.iconName] : null;
  const rarity = RARITY_COLORS[Math.min(index, RARITY_COLORS.length - 1)];

  return (
    <div
      className={`relative rounded-2xl border bg-white p-4 transition-all duration-300 group ${
        earned
          ? `${rarity.border} ${rarity.glow} hover:shadow-lg hover:-translate-y-1 ${rarity.ring}`
          : "border-slate-200 opacity-60 grayscale hover:opacity-80 hover:grayscale-[50%]"
      }`}
    >
      {/* Hover glow effect */}
      {earned && (
        <div className="absolute -inset-1 bg-gradient-to-r from-transparent via-current/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl pointer-events-none rounded-2xl text-teal" />
      )}

      {/* Badge Icon */}
      <div
        className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-300 ${
          earned ? "shadow-sm group-hover:scale-110 group-hover:rotate-3" : ""
        }`}
        style={{
          backgroundColor: earned ? `${badge.iconColor}20` : "#f1f5f9",
          color: earned ? badge.iconColor : "#94a3b8",
        }}
      >
        {IconComponent ? (
          <IconComponent size={compact ? 24 : 28} weight={earned ? "fill" : "regular"} />
        ) : (
          <span className="text-xl font-black">{badge.nameTh[0]}</span>
        )}
      </div>

      {/* Badge Info */}
      <div className="mt-3 text-center">
        <h3
          className={`font-black ${compact ? "text-sm" : "text-base"} transition-colors duration-300 ${
            earned ? "text-ink group-hover:text-teal" : "text-slate-500"
          }`}
        >
          {badge.nameTh}
        </h3>
        {!compact && (
          <p className="mt-1 text-xs leading-relaxed text-muted">
            {badge.descriptionTh ?? badge.descriptionEn ?? ""}
          </p>
        )}
        {earned && earnedAt && (
          <p className="mt-2 text-[10px] font-semibold text-teal">
            ปลดล็อคแล้ว! {new Date(earnedAt).toLocaleDateString("th-TH")}
          </p>
        )}
        {!earned && (
          <p className="mt-2 text-[10px] font-semibold text-slate-400">
            ยังไม่ได้ปลดล็อค
          </p>
        )}
      </div>
    </div>
  );
}
