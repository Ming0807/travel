export const dynamic = "force-dynamic";

import Link from "next/link";
import {
  Compass,
  GlobeHemisphereEast,
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
    <div className="overflow-x-hidden min-h-screen bg-slate-50 text-ink selection:bg-teal selection:text-white flex flex-col">
      {/* Background Ambience */}
      <div className="fixed top-0 right-0 w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] bg-teal/5 rounded-full blur-[100px] pointer-events-none -translate-y-1/3 translate-x-1/3"></div>
      <div className="fixed bottom-0 left-0 w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] bg-coral/5 rounded-full blur-[120px] pointer-events-none translate-y-1/3 -translate-x-1/3"></div>

      <main className="flex-1 relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-20">

        <div className="flex flex-col lg:flex-row gap-8 xl:gap-12 items-start">

          {/* LEFT COLUMN (Sticky on Desktop) */}
          <div className="w-full lg:w-[380px] shrink-0 lg:sticky lg:top-24 flex flex-col gap-6">

            {/* Identity Card */}
            <div className="bg-white rounded-3xl border border-ink/10 shadow-[0_4px_30px_rgb(0,0,0,0.02)] overflow-hidden">
              <div className="bg-ink p-8 relative">
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay"></div>
                <div className="relative z-10 flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-teal/80 mb-2">
                      Digital Passport
                    </p>
                    <h1 className="text-3xl font-semibold tracking-tight text-white leading-tight">
                      {profile.displayName}
                    </h1>
                  </div>
                  <div className="w-12 h-12 rounded-full border border-white/20 bg-white/5 flex items-center justify-center backdrop-blur-md shrink-0">
                    <GlobeHemisphereEast size={24} className="text-white/40" />
                  </div>
                </div>
              </div>

              <div className="p-8 pb-10">
                <p className="text-sm font-medium text-ink/60 mb-6">
                  {profile.isGuest
                    ? "บัญชีผู้เยี่ยมชม (Guest Account)"
                    : `เชื่อมต่อบัญชี: ${profile.linkedProviders.join(", ")}`}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-ink/40 mb-1">ภูมิลำเนา (Origin)</p>
                    <p className="text-base font-semibold text-ink truncate">{profile.origin}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-ink/40 mb-1">กลุ่มอายุ (Age)</p>
                    <p className="text-base font-semibold text-ink">{formatAgeGroup(profile.ageGroup)}</p>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-ink/40 mb-3 flex items-center justify-between">
                    <span>ระดับนักเดินทาง (Level)</span>
                  </p>
                  <XPProgressBar xp={xp} />
                </div>
              </div>
            </div>

            {/* Account Linking Context */}
            <AccountLinkingTeaser isGuest={profile.isGuest} context="profile" />

          </div>

          {/* RIGHT COLUMN (Scrollable Content) */}
          <div className="flex-1 min-w-0 w-full flex flex-col gap-12 lg:gap-16 lg:pt-0 pt-6">

            {/* Visas & Achievements */}
            <section>
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight text-ink flex items-center gap-2">
                    <Trophy weight="fill" className="text-gold" />
                    ความสำเร็จและตราประทับ
                  </h2>
                  <p className="text-sm text-ink/50 mt-1">Visas & Achievements</p>
                </div>
                {allBadges.length > 0 && badges.length < allBadges.length && (
                  <Link
                    href="/leaderboard"
                    className="inline-flex items-center gap-1 text-[13px] font-bold text-teal hover:text-teal/80 transition-colors"
                  >
                    ดู Leaderboard &rarr;
                  </Link>
                )}
              </div>

              <div className="bg-white border border-ink/10 rounded-3xl p-6 sm:p-10 shadow-[0_4px_30px_rgb(0,0,0,0.02)]">
                <BadgeGrid allBadges={allBadges} earnedBadges={badges} compact />
              </div>
            </section>

            {/* Province Progress (Stamps) */}
            <section>
              <h2 className="text-xl font-semibold tracking-tight text-ink mb-2 flex items-center gap-2">
                <Stamp weight="fill" className="text-coral" />
                สถิติการเช็คอินแยกตามจังหวัด
              </h2>
              <p className="text-sm text-ink/50 mb-8 border-b border-ink/5 pb-4">Check-in statistics by province</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-10">
                {profile.passportSummary.provinceProgress.map((item) => {
                  const percent =
                    item.totalCount > 0
                      ? Math.min(100, Math.round((item.earnedCount / item.totalCount) * 100))
                      : 0;
                  return (
                    <div key={item.provinceName} className="group flex flex-col">
                      <div className="mb-3 flex items-end justify-between">
                        <span className="font-semibold text-ink text-base leading-none">{item.provinceName}</span>
                        <span className="font-mono font-medium text-ink/40 text-xs">
                          {item.earnedCount} / {item.totalCount || 0}
                        </span>
                      </div>
                      <div className="h-1 overflow-hidden rounded-full bg-ink/5 w-full">
                        <div
                          className="h-full rounded-full bg-teal transition-all duration-1000 ease-out"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Travel Log (Certificates) */}
            <section>
              <h2 className="text-xl font-semibold tracking-tight text-ink mb-2 flex items-center gap-2">
                <Certificate weight="fill" className="text-teal" />
                บันทึกการเดินทาง
              </h2>
              <p className="text-sm text-ink/50 mb-8 border-b border-ink/5 pb-4">Travel Log & Certificates</p>

              {profile.certificateHistory.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-ink/10 rounded-3xl bg-white/50">
                  <p className="text-sm font-medium text-ink/40">ยังไม่มีบันทึกการเดินทาง</p>
                  <p className="text-[13px] text-ink/30 mt-1">แสกน QR Code เพื่อรับใบประกาศและเริ่มบันทึก</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {profile.certificateHistory.map((cert, index) => (
                    <div
                      key={`${cert.attractionName}-${cert.generatedAt}-${index}`}
                      className="group bg-white p-5 rounded-2xl border border-ink/5 shadow-sm hover:shadow-md hover:border-teal/20 transition-all flex items-start gap-4"
                    >
                      <div className="w-10 h-10 shrink-0 rounded-full bg-teal/10 text-teal flex items-center justify-center">
                        <MapPin weight="fill" size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-coral truncate pr-2">
                            {cert.provinceName}
                          </span>
                          {cert.visitDate && (
                            <span className="text-[10px] font-semibold text-ink/40 shrink-0">
                              {new Date(cert.visitDate).toLocaleDateString("en-GB", { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          )}
                        </div>
                        <p className="text-[15px] font-semibold text-ink leading-snug line-clamp-2">
                          {cert.attractionName}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
