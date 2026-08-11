import Link from "next/link";
import {
  Certificate,
  CheckCircle,
  GlobeHemisphereEast,
  LockKey,
  MapPin,
  Medal,
  ShieldCheck,
  Stamp,
  Trophy,
  UserCircle,
} from "@phosphor-icons/react/dist/ssr";

import { AccountLinkingTeaser } from "@/components/passport/AccountLinkingTeaser";
import { PublicButton } from "@/components/public/PublicButton";
import { PublicPageFrame } from "@/components/public/PublicPageFrame";
import { LeaderboardPrivacyForm } from "@/components/profile/LeaderboardPrivacyForm";
import type { BadgeDefinition, TouristBadge, XPLevelInfo } from "@/types/tourism";

type ProfileData = {
  displayName: string;
  origin: string;
  ageGroup: string;
  preferredLanguage: string | null;
  preferredLanguageSource: string | null;
  leaderboardVisibility: "private" | "alias" | "display_name";
  leaderboardAlias: string | null;
  isGuest: boolean;
  linkedProviders: string[];
  passportSummary: {
    totalStampsEarned: number;
    provinceProgress: Array<{
      provinceName: string;
      earnedCount: number;
      totalCount: number;
    }>;
  };
  certificateHistory: Array<{
    generatedAt: string;
    visitDate: string | null;
    attractionName: string;
    provinceName: string;
    attractionSlug: string | null;
  }>;
};

type TouristProfileViewProps = {
  profile: ProfileData;
  xp: XPLevelInfo;
  badges: TouristBadge[];
  allBadges: BadgeDefinition[];
};

const ageLabels: Record<string, string> = {
  under_18: "ต่ำกว่า 18 ปี",
  "18_24": "18–24 ปี",
  "25_34": "25–34 ปี",
  "35_44": "35–44 ปี",
  "45_54": "45–54 ปี",
  "55_64": "55–64 ปี",
  "65_plus": "65 ปีขึ้นไป",
  prefer_not_to_answer: "ไม่ระบุ",
};

const languageLabels: Record<string, string> = {
  th: "ภาษาไทย",
  en: "ภาษาอังกฤษ",
  ms: "ภาษามลายู",
};

const providerLabels: Record<string, string> = {
  google: "Google",
  line: "LINE",
  email: "อีเมล",
};

function formatThaiDate(value: string) {
  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function TouristProfileView({ profile, xp, badges, allBadges }: TouristProfileViewProps) {
  const progressPercent = Math.max(0, Math.min(100, Math.round(xp.progress * 100)));
  const earnedBadgeIds = new Set(badges.map((item) => item.badge.badgeId));

  return (
    <main className="bg-[var(--public-canvas)] py-8 sm:py-12">
      <PublicPageFrame variant="listing">
        <header className="border-b border-slate-300 pb-7">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold text-teal">พาสปอร์ตท่องเที่ยวของฉัน</p>
              <h1 className="mt-2 text-3xl font-black text-ink sm:text-4xl">โปรไฟล์นักเดินทาง</h1>
              <p className="mt-2 text-base text-slate-600">ตรวจสอบข้อมูล บัญชีที่เชื่อม และการแสดงชื่อสาธารณะได้จากหน้านี้</p>
            </div>
            <PublicButton href="/passport" variant="secondary">
              ดูพาสปอร์ตและตราประทับ
            </PublicButton>
          </div>
        </header>

        <div className="grid gap-6 py-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
          <div className="space-y-6">
            <section className="overflow-hidden rounded-[var(--public-radius-panel)] border border-slate-200 bg-white">
              <div className="flex items-start gap-4 border-b border-slate-200 p-6 sm:p-7">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-ink text-white">
                  <UserCircle aria-hidden="true" size={28} weight="fill" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg font-black text-ink">ข้อมูลสำหรับใบประกาศ</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-600">ชื่อที่บันทึกไว้จะแสดงบนใบประกาศครั้งถัดไป</p>
                  <p className="mt-4 break-words text-2xl font-black text-ink">{profile.displayName}</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2">
                <div className="border-b border-slate-200 p-6 sm:border-b-0 sm:border-r sm:p-7">
                  <h2 className="flex items-center gap-2 text-lg font-black text-ink">
                    <GlobeHemisphereEast aria-hidden="true" size={22} className="text-teal" weight="fill" />
                    ภูมิลำเนาและภาษา
                  </h2>
                  <dl className="mt-4 space-y-3 text-sm">
                    <div className="flex justify-between gap-4">
                      <dt className="text-slate-600">ภูมิลำเนา</dt>
                      <dd className="text-right font-semibold text-ink">{profile.origin}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-slate-600">ช่วงอายุ</dt>
                      <dd className="text-right font-semibold text-ink">{ageLabels[profile.ageGroup] ?? profile.ageGroup}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-slate-600">ภาษาที่ใช้</dt>
                      <dd className="text-right font-semibold text-ink">
                        {profile.preferredLanguage
                          ? languageLabels[profile.preferredLanguage] ?? profile.preferredLanguage
                          : "ตามภาษาของอุปกรณ์"}
                      </dd>
                    </div>
                  </dl>
                  <p className="mt-5 text-xs leading-5 text-slate-500">แก้ข้อมูลพื้นฐานได้ในขั้นตอนเช็กอินครั้งถัดไปก่อนยืนยัน</p>
                </div>

                <div className="p-6 sm:p-7">
                  <h2 className="flex items-center gap-2 text-lg font-black text-ink">
                    <LockKey aria-hidden="true" size={22} className="text-coral" weight="fill" />
                    บัญชีที่เชื่อมต่อ
                  </h2>
                  {profile.isGuest ? (
                    <div className="mt-4">
                      <p className="font-semibold text-ink">ใช้งานแบบผู้เยี่ยมชม</p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        บัญชีแบบผู้เยี่ยมชมไม่มีรหัสผ่าน ข้อมูลจะอยู่บนเบราว์เซอร์นี้จนกว่าจะเชื่อมบัญชี
                      </p>
                    </div>
                  ) : (
                    <div className="mt-4">
                      <ul className="space-y-2" aria-label="บัญชีที่เชื่อมแล้ว">
                        {profile.linkedProviders.map((provider) => (
                          <li key={provider} className="flex items-center gap-2 text-sm font-semibold text-ink">
                            <CheckCircle aria-hidden="true" size={18} className="text-teal" weight="fill" />
                            {providerLabels[provider] ?? provider}
                          </li>
                        ))}
                      </ul>
                      <p className="mt-3 text-sm leading-6 text-slate-600">
                        Google หรือ LINE เป็นผู้จัดการรหัสผ่าน ระบบนี้จึงไม่เก็บและไม่สามารถแสดงรหัสผ่านของคุณได้
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </section>

            <section className="rounded-[var(--public-radius-panel)] border border-slate-200 bg-white p-6 sm:p-7">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h2 className="flex items-center gap-2 text-xl font-black text-ink">
                    <Trophy aria-hidden="true" size={23} className="text-gold" weight="fill" />
                    ระดับและความสำเร็จ
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">คะแนนมาจากกิจกรรมที่บันทึกสำเร็จในระบบ</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-600">ระดับ {xp.currentLevel}</p>
                  <p className="text-xl font-black text-teal">{xp.currentXp.toLocaleString("th-TH")} คะแนน</p>
                </div>
              </div>

              <div className="mt-5">
                <div className="mb-2 flex justify-between text-xs font-semibold text-slate-600">
                  <span>{xp.xpForCurrentLevel.toLocaleString("th-TH")}</span>
                  <span>{progressPercent}%</span>
                  <span>{xp.xpForNextLevel.toLocaleString("th-TH")}</span>
                </div>
                <div
                  role="progressbar"
                  aria-label="ความคืบหน้าสู่ระดับถัดไป"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={progressPercent}
                  className="h-2 overflow-hidden rounded-full bg-slate-200"
                >
                  <div className="h-full bg-teal" style={{ width: `${progressPercent}%` }} />
                </div>
              </div>

              <div className="mt-6 border-t border-slate-200 pt-5">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-black text-ink">เหรียญความสำเร็จ</h3>
                  <span className="text-sm font-semibold text-slate-600">ได้รับ {badges.length} จาก {allBadges.length}</span>
                </div>
                {allBadges.length === 0 ? (
                  <p className="mt-3 text-sm text-slate-600">ยังไม่มีเกณฑ์เหรียญที่เปิดใช้งาน</p>
                ) : (
                  <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                    {allBadges.map((badge) => {
                      const earned = earnedBadgeIds.has(badge.badgeId);
                      return (
                        <li key={badge.badgeId} className="flex items-center gap-3 border-t border-slate-100 py-3 first:border-t-0">
                          <Medal aria-hidden="true" size={22} className={earned ? "text-gold" : "text-slate-300"} weight={earned ? "fill" : "regular"} />
                          <div>
                            <p className={`text-sm font-semibold ${earned ? "text-ink" : "text-slate-500"}`}>{badge.nameTh}</p>
                            <p className="text-xs text-slate-500">{earned ? "ได้รับแล้ว" : "ยังไม่ได้รับ"}</p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </section>

            <section className="rounded-[var(--public-radius-panel)] border border-slate-200 bg-white p-6 sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="flex items-center gap-2 text-xl font-black text-ink">
                    <Certificate aria-hidden="true" size={23} className="text-coral" weight="fill" />
                    บันทึกการเดินทาง
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">แสดงเฉพาะการเดินทางที่สร้างใบประกาศสำเร็จ</p>
                </div>
                <span className="text-sm font-semibold text-slate-600">{profile.certificateHistory.length} รายการ</span>
              </div>

              {profile.certificateHistory.length === 0 ? (
                <div className="mt-5 border border-dashed border-slate-300 p-6 text-center">
                  <p className="font-semibold text-ink">ยังไม่มีบันทึกการเดินทาง</p>
                  <PublicButton href="/attractions" variant="quiet" className="mt-3">ค้นหาสถานที่ในยะลา</PublicButton>
                </div>
              ) : (
                <ul className="mt-5 divide-y divide-slate-200">
                  {profile.certificateHistory.map((certificate, index) => {
                    const content = (
                      <>
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-teal/10 text-teal">
                          <MapPin aria-hidden="true" size={20} weight="fill" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-semibold text-ink">{certificate.attractionName}</span>
                          <span className="mt-1 block text-sm text-slate-600">
                            {certificate.provinceName} · {formatThaiDate(certificate.visitDate ?? certificate.generatedAt)}
                          </span>
                        </span>
                      </>
                    );

                    return (
                      <li key={`${certificate.generatedAt}-${index}`}>
                        {certificate.attractionSlug ? (
                          <Link href={`/attractions/${certificate.attractionSlug}`} className="flex min-h-16 items-center gap-3 py-4 hover:text-teal">
                            {content}
                          </Link>
                        ) : (
                          <div className="flex min-h-16 items-center gap-3 py-4">{content}</div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </div>

          <aside className="space-y-6">
            <section aria-labelledby="public-name-heading">
              <h2 id="public-name-heading" className="mb-3 flex items-center gap-2 text-xl font-black text-ink">
                <ShieldCheck aria-hidden="true" size={23} className="text-teal" weight="fill" />
                การแสดงชื่อสาธารณะ
              </h2>
              <LeaderboardPrivacyForm
                initialVisibility={profile.leaderboardVisibility}
                initialAlias={profile.leaderboardAlias}
                displayName={profile.displayName}
              />
            </section>

            <AccountLinkingTeaser isGuest={profile.isGuest} context="profile" />

            <section className="rounded-[var(--public-radius-panel)] border border-slate-200 bg-white p-6">
              <h2 className="flex items-center gap-2 text-lg font-black text-ink">
                <Stamp aria-hidden="true" size={21} className="text-coral" weight="fill" />
                ความคืบหน้าในยะลา
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">สะสมแล้ว {profile.passportSummary.totalStampsEarned} ตราประทับ</p>
              <dl className="mt-4 divide-y divide-slate-200">
                {profile.passportSummary.provinceProgress.map((item) => (
                  <div key={item.provinceName} className="flex justify-between gap-4 py-3 text-sm">
                    <dt className="font-semibold text-ink">{item.provinceName}</dt>
                    <dd className="text-slate-600">{item.earnedCount} / {item.totalCount}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section className="border-t border-slate-300 pt-5">
              <h2 className="text-lg font-black text-ink">ข้อมูลและความเป็นส่วนตัว</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">อ่านวิธีใช้ข้อมูล หรือส่งคำขอเกี่ยวกับข้อมูลของคุณได้โดยไม่กระทบการใช้งานแบบผู้เยี่ยมชม</p>
              <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold">
                <Link href="/privacy" className="min-h-11 py-3 text-teal hover:underline">นโยบายความเป็นส่วนตัว</Link>
                <Link href="/contact" className="min-h-11 py-3 text-teal hover:underline">ติดต่อเรื่องข้อมูลส่วนบุคคล</Link>
              </div>
            </section>
          </aside>
        </div>
      </PublicPageFrame>
    </main>
  );
}
