import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarBlank,
  Certificate,
  ClipboardText,
  IdentificationCard,
  MapPin,
  ShieldCheck,
  Stamp,
} from "@phosphor-icons/react/dist/ssr";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminShell } from "@/components/admin/AdminShell";
import { hasPermission, requirePermission } from "@/lib/auth/guards";
import { getAdminTouristDetail } from "@/lib/repositories/admin-tourist.repository";
import { adminTouristIdSchema } from "@/lib/validation/admin-tourist";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "รายละเอียดนักท่องเที่ยว | ระบบผู้ดูแล",
};

const providerLabels: Record<string, string> = {
  anonymous_device: "ผู้เยี่ยมชมบนอุปกรณ์นี้",
  line: "เชื่อมบัญชี LINE",
  google: "เชื่อมบัญชี Google",
  email: "เชื่อมบัญชีอีเมล",
};

const statusLabels: Record<string, string> = {
  started: "เริ่มต้น",
  minimal_form_completed: "กรอกข้อมูลแล้ว",
  photo_uploaded: "อัปโหลดภาพแล้ว",
  certificate_generated: "สร้างใบประกาศแล้ว",
  survey_completed: "ตอบแบบสำรวจแล้ว",
  abandoned: "ยุติขั้นตอน",
};

function formatDate(value: string | null, withTime = false): string {
  if (!value) return "ไม่ระบุ";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "ไม่ระบุ";
  return date.toLocaleString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
}

function scoreText(score: number | null): string {
  return score === null ? "ไม่ได้ตอบ" : `${score}/5`;
}

export default async function AdminTouristDetailPage({
  params,
}: {
  params: Promise<{ touristId: string }>;
}) {
  const guard = await requirePermission("tourist.detail");
  const canReadSurveyDetail = hasPermission(guard.actor, "survey.detail");
  const { touristId: rawTouristId } = await params;
  const parsedId = adminTouristIdSchema.safeParse(rawTouristId);
  if (!parsedId.success) notFound();

  const tourist = await getAdminTouristDetail(parsedId.data);
  if (!tourist) notFound();

  return (
    <AdminShell>
      <div className="space-y-7">
        <div>
          <Link
            href="/admin/tourists"
            className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-slate-600 transition-colors hover:text-[#0A6B62] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A6B62]"
          >
            <ArrowLeft aria-hidden="true" size={18} weight="bold" />
            กลับไปข้อมูลนักท่องเที่ยว
          </Link>
          <AdminPageHeader
            eyebrow={tourist.reference}
            title={tourist.displayName}
            description="ข้อมูลสำหรับดูแลประสบการณ์และตรวจสอบประวัติการมีส่วนร่วม ข้อมูลระบุตัวตนทางเทคนิคถูกซ่อนไว้ตามหลักความเป็นส่วนตัว"
          />
        </div>

        <section aria-labelledby="tourist-summary-heading">
          <h2 id="tourist-summary-heading" className="sr-only">ภาพรวม</h2>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              { label: "การเข้าชม", value: tourist.totals.visits, icon: MapPin },
              { label: "ใบประกาศ", value: tourist.totals.certificates, icon: Certificate },
              { label: "ตราประทับ", value: tourist.totals.stamps, icon: Stamp },
              { label: "แบบสำรวจ", value: tourist.totals.surveys, icon: ClipboardText },
            ].map((item) => (
              <div key={item.label} className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-slate-600">{item.label}</p>
                  <item.icon aria-hidden="true" className="text-[#0A6B62]" size={20} />
                </div>
                <p className="mt-2 text-2xl font-bold text-slate-900">{item.value.toLocaleString("th-TH")}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-slate-200 pt-6" aria-labelledby="profile-heading">
          <div className="flex items-center gap-2">
            <IdentificationCard aria-hidden="true" className="text-[#0A6B62]" size={22} weight="fill" />
            <h2 id="profile-heading" className="text-lg font-bold text-slate-900">ข้อมูลโปรไฟล์</h2>
          </div>
          <dl className="mt-4 grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
            <div><dt className="text-xs font-semibold text-slate-500">ชื่อที่ใช้ในใบประกาศ</dt><dd className="mt-1 text-sm font-medium text-slate-900">{tourist.displayName}</dd></div>
            <div><dt className="text-xs font-semibold text-slate-500">ประเทศต้นทาง</dt><dd className="mt-1 text-sm font-medium text-slate-900">{tourist.countryName ?? "ไม่ระบุ"}</dd></div>
            <div><dt className="text-xs font-semibold text-slate-500">จังหวัดต้นทาง</dt><dd className="mt-1 text-sm font-medium text-slate-900">{tourist.provinceName ?? "ไม่ระบุ"}</dd></div>
            <div><dt className="text-xs font-semibold text-slate-500">ช่วงอายุ</dt><dd className="mt-1 text-sm font-medium text-slate-900">{tourist.ageGroup ?? "ไม่ระบุ"}</dd></div>
            <div><dt className="text-xs font-semibold text-slate-500">ภาษาที่เลือก</dt><dd className="mt-1 text-sm font-medium text-slate-900">{tourist.preferredLanguage?.toUpperCase() ?? "ไม่ระบุ"}</dd></div>
            <div><dt className="text-xs font-semibold text-slate-500">เริ่มใช้งาน</dt><dd className="mt-1 text-sm font-medium text-slate-900">{formatDate(tourist.createdAt, true)}</dd></div>
          </dl>
        </section>

        <section className="border-t border-slate-200 pt-6" aria-labelledby="identity-heading">
          <div className="flex items-center gap-2">
            <ShieldCheck aria-hidden="true" className="text-[#0A6B62]" size={22} weight="fill" />
            <h2 id="identity-heading" className="text-lg font-bold text-slate-900">วิธีเข้าใช้งาน</h2>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {(tourist.identityProviders.length ? tourist.identityProviders : ["anonymous_device"]).map((provider) => (
              <span key={provider} className="rounded-md bg-[#E6F4EF] px-3 py-2 text-sm font-semibold text-[#075049]">
                {providerLabels[provider] ?? "เชื่อมบัญชีแล้ว"}
              </span>
            ))}
          </div>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            ระบบแสดงเฉพาะประเภทการเชื่อมบัญชี ไม่แสดงรหัสอุปกรณ์ รหัสผู้ใช้จากผู้ให้บริการ หรือข้อมูลรหัสผ่าน
          </p>
        </section>

        <section className="border-t border-slate-200 pt-6" aria-labelledby="visits-heading">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 id="visits-heading" className="text-lg font-bold text-slate-900">ประวัติการเดินทางและแบบสำรวจ</h2>
              <p className="mt-1 text-sm text-slate-600">แสดงรายการล่าสุดไม่เกิน 50 ครั้ง โดยไม่แสดงภาพหรือความคิดเห็นดิบ</p>
            </div>
            <span className="text-xs font-semibold text-slate-500">ทั้งหมด {tourist.totals.visits.toLocaleString("th-TH")} ครั้ง</span>
          </div>

          {tourist.recentVisits.length === 0 ? (
            <div className="mt-4 rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-600">
              ยังไม่มีประวัติการเข้าชม
            </div>
          ) : (
            <ol className="mt-5 space-y-3">
              {tourist.recentVisits.map((visit) => (
                <li key={visit.visitId} className="rounded-lg border border-slate-200 bg-white p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">{visit.attractionName ?? "ไม่ระบุสถานที่"}</p>
                      <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><CalendarBlank aria-hidden="true" size={14} /> {formatDate(visit.visitedAt ?? visit.createdAt, true)}</span>
                        {visit.attractionProvince ? <span>{visit.attractionProvince}</span> : null}
                        {visit.photoSpotName ? <span>จุดถ่ายภาพ: {visit.photoSpotName}</span> : null}
                      </p>
                    </div>
                    <span className="w-fit rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                      {statusLabels[visit.completionStatus] ?? visit.completionStatus}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-3 text-xs">
                    <span className="rounded-md bg-[#E6F4EF] px-2.5 py-1.5 font-semibold text-[#075049]">
                      ใบประกาศ {visit.certificates.length.toLocaleString("th-TH")} ใบ
                    </span>
                    {visit.survey ? (
                      <span className="rounded-md bg-amber-50 px-2.5 py-1.5 font-semibold text-amber-800">
                        ความพึงพอใจ {scoreText(visit.survey.overallScore)}
                      </span>
                    ) : (
                      <span className="rounded-md bg-slate-100 px-2.5 py-1.5 font-semibold text-slate-600">ยังไม่ตอบแบบสำรวจ</span>
                    )}
                  </div>

                  {visit.survey ? (
                    <div className="mt-3">
                      <dl className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4 lg:grid-cols-7">
                        {[
                          ["โดยรวม", visit.survey.overallScore],
                          ["สิ่งอำนวยความสะดวก", visit.survey.facilityScore],
                          ["ความสะอาด", visit.survey.cleanlinessScore],
                          ["ความปลอดภัย", visit.survey.safetyScore],
                          ["การเข้าถึง", visit.survey.accessibilityScore],
                          ["ข้อมูล", visit.survey.informationScore],
                          ["ความคุ้มค่า", visit.survey.valueScore],
                        ].map(([label, value]) => (
                          <div key={String(label)}><dt className="text-slate-500">{label}</dt><dd className="mt-0.5 font-semibold text-slate-800">{scoreText(value as number | null)}</dd></div>
                        ))}
                      </dl>
                      {canReadSurveyDetail && visit.survey ? (
                        <Link
                          href={`/admin/surveys/${visit.survey.surveyId}`}
                          className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-[#075049] underline-offset-4 hover:underline"
                        >
                          ดูคำตอบเพิ่มเติมของการเข้าชมครั้งนี้
                        </Link>
                      ) : null}
                    </div>
                  ) : null}
                </li>
              ))}
            </ol>
          )}
        </section>

        <section className="border-t border-slate-200 pt-6" aria-labelledby="stamps-heading">
          <div className="flex items-center justify-between gap-3">
            <h2 id="stamps-heading" className="text-lg font-bold text-slate-900">ตราประทับที่ได้รับ</h2>
            <span className="text-xs font-semibold text-slate-500">ทั้งหมด {tourist.totals.stamps.toLocaleString("th-TH")} ดวง</span>
          </div>
          {tourist.recentStamps.length === 0 ? (
            <p className="mt-4 text-sm text-slate-600">ยังไม่มีตราประทับ</p>
          ) : (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {tourist.recentStamps.map((stamp, index) => (
                <div key={`${stamp.earnedAt}-${index}`} className="rounded-lg border border-slate-200 bg-white p-4">
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-700">
                      <Stamp aria-hidden="true" size={21} weight="fill" />
                    </span>
                    <div>
                      <p className="font-semibold text-slate-900">{stamp.stampName ?? "ตราประทับการเดินทาง"}</p>
                      <p className="mt-1 text-xs text-slate-600">{stamp.attractionName ?? "ไม่ระบุสถานที่"}</p>
                      <p className="mt-2 text-xs text-slate-500">ได้รับเมื่อ {formatDate(stamp.earnedAt, true)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </AdminShell>
  );
}
