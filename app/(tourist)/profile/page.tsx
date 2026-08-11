export const dynamic = "force-dynamic";

import { SiteFooter } from "@/components/layout/SiteFooter";
import { ProfileAccessState } from "@/components/profile/ProfileAccessState";
import { TouristProfileView } from "@/components/profile/TouristProfileView";
import { TouristAccessError, resolveCurrentTouristId } from "@/lib/auth/guards";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { getCurrentTouristProfileSummary } from "@/lib/services/profile.service";
import { getTouristBadges, getTouristXP } from "@/lib/services/xp.service";

type BadgeDefinitionRow = {
  badge_id: number | string;
  badge_key: string;
  name_th: string;
  name_en: string;
  description_th: string | null;
  description_en: string | null;
  icon_name: string | null;
  icon_color: string | null;
  category: "exploration" | "engagement" | "milestone" | "social";
  requirement_type: string;
  requirement_value: number | string;
  requirement_extra: string | null;
  display_order: number | string;
  is_active: boolean;
};

async function getAllBadges() {
  const supabase = createSupabaseServiceRoleClient();
  const { data } = await supabase
    .from("badge_definitions")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  return ((data ?? []) as BadgeDefinitionRow[]).map((row) => ({
    badgeId: Number(row.badge_id),
    badgeKey: row.badge_key,
    nameTh: row.name_th,
    nameEn: row.name_en,
    descriptionTh: row.description_th,
    descriptionEn: row.description_en,
    iconName: row.icon_name,
    iconColor: row.icon_color ?? "#D6A13D",
    category: row.category,
    requirementType: row.requirement_type,
    requirementValue: Number(row.requirement_value),
    requirementExtra: row.requirement_extra,
    displayOrder: Number(row.display_order),
    isActive: row.is_active,
  }));
}

async function loadProfile() {
  try {
    const touristId = await resolveCurrentTouristId();
    const [profile, xp, badges, allBadges] = await Promise.all([
      getCurrentTouristProfileSummary(),
      getTouristXP(touristId),
      getTouristBadges(touristId),
      getAllBadges(),
    ]);
    return { kind: "ready" as const, profile, xp, badges, allBadges };
  } catch (error) {
    if (error instanceof TouristAccessError && error.code === "TOURIST_IDENTITY_NOT_FOUND") {
      return { kind: "no_identity" as const };
    }
    return { kind: "error" as const };
  }
}

export default async function ProfilePage() {
  const result = await loadProfile();

  if (result.kind === "no_identity") {
    return <ProfileAccessState kind="no_identity" />;
  }

  if (result.kind === "error") {
    return <ProfileAccessState kind="error" />;
  }

  return (
    <div className="min-h-screen bg-[var(--public-canvas)]">
      <TouristProfileView
        profile={result.profile}
        xp={result.xp}
        badges={result.badges}
        allBadges={result.allBadges}
      />
      <SiteFooter />
    </div>
  );
}
