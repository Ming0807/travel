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
import { SiteFooter } from "@/components/layout/SiteFooter";

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
    iconColor: row.icon_color ?? "var(--coral, #E77455)",
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
        <div className="max-w-sm rounded-2xl bg-white p-8 text-center shadow-card">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gold/20 text-gold">
            <Compass size={36} weight="fill" />
          </div>
          <h1 className="text-2xl font-black text-ink">สร้างโปรไฟล์ของคุณ</h1>
          <p className="mt-3 text-sm leading-6 text-muted">
            สแกน QR Code ที่สถานที่ท่องเที่ยวเพื่อเริ่มต้นโปรไฟล์ดิจิทัลของคุณ
          </p>
          <Link
            href="/attractions"
            className="mt-5 inline-flex rounded-full bg-teal px-5 py-4 font-black text-white shadow-md shadow-teal/20"
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
        <div className="max-w-sm rounded-2xl bg-white p-8 text-center shadow-card">
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
    <>
      <main className="min-h-[calc(100vh-200px)] bg-background px-4 pb-28 pt-8 relative overflow-hidden text-ink">
        {/* Premium Background Elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal/5 rounded-full blur-[100px] -z-10 translate-x-1/4 -translate-y-1/4 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[700px] h-[700px] bg-coral/5 rounded-full blur-[120px] -z-10 -translate-x-1/3 translate-y-1/3 pointer-events-none"></div>

        <div className="mx-auto max-w-lg space-y-5 relative z-10">
          {/* Profile Header */}
          <section className="rounded-2xl bg-gradient-to-br from-teal to-ink p-8 text-white shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4"></div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-gold relative z-10">
              Tourist Profile
            </p>
            <h1 className="mt-4 text-4xl font-black relative z-10 leading-tight">{profile.displayName}</h1>
            <p className="mt-3 text-sm leading-6 text-white/80 relative z-10">
              {profile.isGuest
                ? "Guest profile — link Google or LINE later to recover across devices."
                : `Linked with ${profile.linkedProviders.join(", ")}`}
            </p>
          </section>

          {/* XP Progress */}
          <XPProgressBar xp={xp} />

          {/* Badges */}
          <section className="rounded-2xl bg-white p-6 border border-ink/5">
            <h2 className="flex items-center gap-2 text-xl font-black text-ink">
              <Trophy weight="fill" className="text-gold" /> Badges ที่สะสม
            </h2>
            <div className="mt-5">
              <BadgeGrid allBadges={allBadges} earnedBadges={badges} compact />

              {allBadges.length > 0 && badges.length < allBadges.length && (
                <div className="mt-5 text-center">
                  <Link
                    href="/leaderboard"
                    className="inline-flex items-center gap-2 text-sm font-bold text-ink hover:text-teal transition-colors px-4 py-2 rounded-full bg-cream hover:bg-teal/10"
                  >
                    ดู Leaderboard <span className="text-teal font-black">→</span>
                  </Link>
                </div>
              )}
            </div>
          </section>

          {/* Info Cards */}
          <section className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-white p-5 border border-ink/5">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-coral/10 text-coral">
                  <GlobeHemisphereEast size={22} weight="fill" />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-muted">ภูมิลำเนา</span>
              </div>
              <p className="text-xl font-black text-ink">{profile.origin}</p>
            </div>

            <div className="rounded-2xl bg-white p-5 border border-ink/5">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                  <IdentificationCard size={22} weight="fill" />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-muted">กลุ่มอายุ</span>
              </div>
              <p className="text-xl font-black text-ink">{formatAgeGroup(profile.ageGroup)}</p>
            </div>
          </section>

          {/* Passport Summary */}
          <section className="rounded-2xl bg-white p-6 border border-ink/5">
            <h2 className="flex items-center gap-2 text-xl font-black text-ink">
              <Stamp weight="fill" className="text-gold" /> ตราประทับที่สะสม
            </h2>
            <div className="mt-5 space-y-4">
              {profile.passportSummary.provinceProgress.map((item) => {
                const percent =
                  item.totalCount > 0
                    ? Math.min(100, Math.round((item.earnedCount / item.totalCount) * 100))
                    : 0;
                return (
                  <div key={item.provinceName}>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="font-bold text-ink">{item.provinceName}</span>
                      <span className="font-semibold text-muted bg-cream px-2 py-0.5 rounded-md text-[10px] tracking-wide">
                        {item.earnedCount}
                        {item.totalCount ? ` / ${item.totalCount}` : ""} stamps
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-tealSoft">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-teal to-gold"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-6 text-center">
              <Link
                href="/passport"
                className="inline-flex items-center gap-2 text-sm font-bold text-ink hover:text-teal transition-colors px-4 py-2 rounded-full bg-cream hover:bg-teal/10"
              >
                ดูพาสปอร์ตฉบับเต็ม <span className="text-teal font-black">→</span>
              </Link>
            </div>
          </section>

          {/* Certificate History */}
          <section className="rounded-2xl bg-white p-6 border border-ink/5">
            <h2 className="flex items-center gap-2 text-xl font-black text-ink">
              <Certificate weight="fill" className="text-coral" /> ประวัติใบประกาศ
            </h2>
            {profile.certificateHistory.length === 0 ? (
              <div className="mt-4 p-6 text-center rounded-xl bg-cream/50 border border-ink/5">
                <p className="text-sm leading-6 text-muted">
                  ยังไม่มีใบประกาศ — ลองสแกน QR Code ที่สถานที่ท่องเที่ยวที่เข้าร่วม
                </p>
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                {profile.certificateHistory.map((cert, index) => (
                  <div
                    key={`${cert.attractionName}-${cert.generatedAt}-${index}`}
                    className="rounded-xl border border-ink/5 bg-white p-4 shadow-sm hover:border-coral/20 transition-colors"
                  >
                    <p className="font-bold text-ink text-base">{cert.attractionName}</p>
                    <div className="mt-2 flex items-center gap-3 text-xs text-muted font-medium">
                      <span className="flex items-center gap-1.5 bg-cream px-2 py-1 rounded-md">
                        <MapPin weight="fill" className="text-coral" />
                        {cert.provinceName}
                      </span>
                      {cert.visitDate && (
                        <span className="bg-cream px-2 py-1 rounded-md">
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
          <div className="pt-2">
            <AccountLinkingTeaser isGuest={profile.isGuest} />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
