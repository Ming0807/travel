export const dynamic = "force-dynamic";

import Link from "next/link";
import {
  Compass,
  GlobeHemisphereEast,
  IdentificationCard,
  MapPin,
  Stamp,
  Certificate,
  Warning,
  Trophy,
} from "@phosphor-icons/react/dist/ssr";
import { AccountLinkingTeaser } from "@/components/passport/AccountLinkingTeaser";
import { getCurrentTouristProfileSummary } from "@/lib/services/profile.service";
import { TouristAccessError, resolveCurrentTouristId } from "@/lib/auth/guards";
import { getTouristXP, getTouristBadges } from "@/lib/services/xp.service";
import { XPProgressBar } from "@/components/badges/XPProgressBar";
import { BadgeGrid } from "@/components/badges/BadgeGrid";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";

type ProfileSummary = Awaited<ReturnType<typeof getCurrentTouristProfileSummary>>;

type AllBadgeDef = Awaited<ReturnType<typeof getAllBadges>>;

type ProfileResult =
  | { kind: "ready"; profile: ProfileSummary; xp: Awaited<ReturnType<typeof getTouristXP>>; badges: Awaited<ReturnType<typeof getTouristBadges>>; allBadges: AllBadgeDef }
  | { kind: "no_identity" }
  | { kind: "error" };

async function getAllBadges() {
  const supabase = createSupabaseServiceRoleClient();
  const { data } = await supabase
    .from("badge_definitions")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  return (data ?? []).map((row: any) => ({
    badgeId: Number(row.badge_id),
    badgeKey: row.badge_key,
    nameTh: row.name_th,
    nameEn: row.name_en,
    descriptionTh: row.description_th || null,
    descriptionEn: row.description_en || null,
    iconName: row.icon_name || null,
    iconColor: row.icon_color ?? "#E18868",
    category: row.category,
    requirementType: row.requirement_type,
    requirementValue: Number(row.requirement_value),
    requirementExtra: row.requirement_extra || null,
    displayOrder: Number(row.display_order),
    isActive: row.is_active,
  }));
}

async function loadProfile(): Promise<ProfileResult> {
  try {
    const touristId = await resolveCurrentTouristId();
    const [profile, xp, badges, allBadges] = await Promise.all([
      getCurrentTouristProfileSummary(),
      getTouristXP(touristId),
      getTouristBadges(touristId),
      getAllBadges(),
    ]);
    return { kind: "ready", profile, xp, badges, allBadges };
  } catch (error) {
    if (error instanceof TouristAccessError && error.code === "TOURIST_IDENTITY_NOT_FOUND") {
      return { kind: "no_identity" };
    }
    return { kind: "error" };
  }
}

function formatAgeGroup(ageGroup: string): string {
  const map: Record<string, string> = {
    under_18: "ต่ำกว่า 18",
    "18_24": "18–24 ปี",
    "25_34": "25–34 ปี",
    "35_44": "35–44 ปี",
    "45_54": "45–54 ปี",
    "55_64": "55–64 ปี",
    "65_plus": "65 ปีขึ้นไป",
    prefer_not_to_answer: "ไม่ระบุ",
  };
  return map[ageGroup] || ageGroup;
}

export default async function ProfilePage() {
  const result = await loadProfile();

  if (result.kind === "no_identity") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-cream px-4">
        <div className="max-w-sm rounded-[2rem] bg-white p-8 text-center shadow-card">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gold/20 text-gold">
            <Compass size={36} weight="fill" />
          </div>
          <h1 className="text-2xl font-black text-ink">สร้างโปรไฟล์ของคุณ</h1>
          <p className="mt-3 text-sm leading-6 text-muted">
            สแกน QR Code ที่สถานที่ท่องเที่ยวเพื่อเริ่มต้นโปรไฟล์ดิจิทัลของคุณ
          </p>
          <Link
            href="/attractions"
            className="mt-5 inline-flex rounded-full bg-teal px-5 py-4 font-black text-white shadow-lg shadow-teal/20"
          >
            สำรวจสถานที่ท่องเที่ยว
          </Link>
        </div>
      </main>
    );
  }

  if (result.kind === "error") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-cream px-4">
        <div className="max-w-sm rounded-[2rem] bg-white p-8 text-center shadow-card">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-coral/15 text-coral">
            <Warning size={28} weight="fill" />
          </div>
          <h1 className="text-xl font-black text-ink">เกิดข้อผิดพลาด</h1>
          <p className="mt-3 text-sm leading-6 text-muted">
            ไม่สามารถโหลดโปรไฟล์ได้ กรุณาลองใหม่อีกครั้ง
          </p>
          <Link
            href="/"
            className="mt-5 inline-flex rounded-full bg-teal px-5 py-3 font-bold text-white"
          >
            กลับหน้าหลัก
          </Link>
        </div>
      </main>
    );
  }

  const { profile, xp, badges, allBadges } = result;

  return (
    <main className="min-h-screen bg-cream px-4 pb-28 pt-8">
      <div className="mx-auto max-w-lg space-y-5">
        {/* Profile Header */}
        <section className="rounded-[2rem] bg-gradient-to-br from-teal to-ink p-6 text-white shadow-glow">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-gold">
            Tourist Profile
          </p>
          <h1 className="mt-3 text-3xl font-black">{profile.displayName}</h1>
          <p className="mt-2 text-sm leading-6 text-white/75">
            {profile.isGuest
              ? "Guest profile — link Google or LINE later to recover across devices."
              : `Linked with ${profile.linkedProviders.join(", ")}`}
          </p>
        </section>

        {/* XP Progress */}
        <XPProgressBar xp={xp} />

        {/* Badges */}
        <section className="rounded-[1.75rem] bg-white p-5 shadow-card">
          <h2 className="flex items-center gap-2 text-xl font-black text-ink">
            <Trophy weight="fill" className="text-gold" /> Badges ที่สะสม
          </h2>
          <div className="mt-4">
            <BadgeGrid allBadges={allBadges} earnedBadges={badges} compact />

            {allBadges.length > 0 && badges.length < allBadges.length && (
              <div className="mt-4 text-center">
                <Link
                  href="/leaderboard"
                  className="inline-flex items-center gap-1 text-sm font-bold text-teal hover:underline"
                >
                  ดู Leaderboard →
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Info Cards */}
        <section className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-[1.5rem] bg-white p-4 shadow-card">
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-coral/15 text-coral">
                <GlobeHemisphereEast size={20} weight="fill" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wide text-muted">ภูมิลำเนา</span>
            </div>
            <p className="text-lg font-black text-ink">{profile.origin}</p>
          </div>

          <div className="rounded-[1.5rem] bg-white p-4 shadow-card">
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-skySoft text-blue-600">
                <IdentificationCard size={20} weight="fill" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wide text-muted">กลุ่มอายุ</span>
            </div>
            <p className="text-lg font-black text-ink">{formatAgeGroup(profile.ageGroup)}</p>
          </div>
        </section>

        {/* Passport Summary */}
        <section className="rounded-[1.75rem] bg-white p-5 shadow-card">
          <h2 className="flex items-center gap-2 text-xl font-black text-ink">
            <Stamp weight="fill" className="text-gold" /> ตราประทับที่สะสม
          </h2>
          <div className="mt-4 space-y-3">
            {profile.passportSummary.provinceProgress.map((item) => {
              const percent =
                item.totalCount > 0
                  ? Math.min(100, Math.round((item.earnedCount / item.totalCount) * 100))
                  : 0;
              return (
                <div key={item.provinceName}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-bold text-ink">{item.provinceName}</span>
                    <span className="font-semibold text-muted">
                      {item.earnedCount}
                      {item.totalCount ? ` / ${item.totalCount}` : ""} stamps
                    </span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-tealSoft">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-teal to-gold"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <Link
            href="/passport"
            className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-teal hover:underline"
          >
            ดูพาสปอร์ตฉบับเต็ม →
          </Link>
        </section>

        {/* Certificate History */}
        <section className="rounded-[1.75rem] bg-white p-5 shadow-card">
          <h2 className="flex items-center gap-2 text-xl font-black text-ink">
            <Certificate weight="fill" className="text-coral" /> ประวัติใบประกาศ
          </h2>
          {profile.certificateHistory.length === 0 ? (
            <p className="mt-3 text-sm leading-6 text-muted">
              ยังไม่มีใบประกาศ — ลองสแกน QR Code ที่สถานที่ท่องเที่ยวที่เข้าร่วม
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {profile.certificateHistory.map((cert, index) => (
                <div
                  key={`${cert.attractionName}-${cert.generatedAt}-${index}`}
                  className="rounded-2xl border border-white bg-cream/50 p-4"
                >
                  <p className="font-bold text-ink">{cert.attractionName}</p>
                  <div className="mt-1 flex items-center gap-3 text-xs text-muted">
                    <span className="flex items-center gap-1">
                      <MapPin weight="fill" className="text-coral" />
                      {cert.provinceName}
                    </span>
                    {cert.visitDate && (
                      <span>
                        {new Date(cert.visitDate).toLocaleDateString("th-TH", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Account Linking */}
        <AccountLinkingTeaser isGuest={profile.isGuest} />
      </div>
    </main>
  );
}
