import Link from "next/link";
import {
  ArrowLeft,
  CalendarBlank,
  ChartBar,
  ClipboardText,
  Coins,
  MapPin,
  Star,
  User,
} from "@phosphor-icons/react/dist/ssr";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import type { AdminSurveyDetail } from "@/lib/repositories/admin-survey.repository";

function formatDate(value: string | null, withTime = false): string {
  if (!value) return "ไม่ได้ระบุ";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "ไม่ได้ระบุ";
  return date.toLocaleString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
}

function valueOrMissing(value: string | number | null): string {
  return value === null || value === "" ? "ไม่ได้ตอบ" : String(value);
}

function score(value: number | null): string {
  return value === null ? "ไม่ได้ตอบ" : `${value}/5`;
}

const intentionLabels: Record<string, string> = {
  yes: "ใช่",
  maybe: "ยังไม่แน่ใจ",
  no: "ไม่",
};

const overnightLabels: Record<string, string> = {
  same_day: "เดินทางไป-กลับ",
  overnight: "พักค้างคืน",
  unknown: "ไม่ได้ระบุ",
};

function AnswerGrid({
  items,
}: {
  items: Array<{ label: string; value: string; highlight?: boolean }>;
}) {
  return (
    <dl className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-2">
      {items.map((item) => (
        <div key={item.label} className="min-w-0 rounded-md border border-slate-200 bg-white px-4 py-3.5">
          <dt className="text-xs font-semibold text-slate-500">{item.label}</dt>
          <dd className={`mt-1 break-words text-sm font-semibold ${item.highlight ? "text-[#0A6B62]" : "text-slate-900"}`}>
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function SurveyDetailView({
  survey,
  canReadComments,
  canReadTourist,
}: {
  survey: AdminSurveyDetail;
  canReadComments: boolean;
  canReadTourist: boolean;
}) {
  const sections = [
    { label: "พฤติกรรม", answered: survey.answerSummary.hasTravelBehavior },
    { label: "ค่าใช้จ่าย", answered: survey.answerSummary.hasExpense },
    { label: "ความพึงพอใจ", answered: survey.answerSummary.hasSatisfaction },
    { label: "ความคิดเห็น", answered: survey.answerSummary.hasComment },
  ];

  return (
    <div className="space-y-7">
      <div>
        <Link
          href="/admin/surveys"
          className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-slate-600 transition-colors hover:text-[#0A6B62] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A6B62]"
        >
          <ArrowLeft aria-hidden="true" size={18} weight="bold" />
          กลับไปรายการคำตอบ
        </Link>
        <AdminPageHeader
          eyebrow="ข้อมูลรายรายการ"
          title="รายละเอียดคำตอบแบบสมัครใจ"
          description="คำตอบนี้เชื่อมกับการเข้าชมหนึ่งครั้ง เพื่อให้เจ้าหน้าที่เข้าใจบริบทโดยไม่เปิดเผยรหัสอุปกรณ์หรือข้อมูลยืนยันตัวตนทางเทคนิค"
        />
      </div>

      <section aria-labelledby="coverage-heading" className="border-y border-slate-200 py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 id="coverage-heading" className="text-base font-bold text-slate-900">ข้อมูลที่ผู้ใช้เลือกกรอก</h2>
            <p className="mt-1 text-sm text-slate-600">
              ตอบทั้งหมด {survey.answerSummary.answeredFieldCount.toLocaleString("th-TH")} ช่อง โดยทุกช่องเป็นข้อมูลเพิ่มเติมที่ไม่บังคับ
            </p>
          </div>
          <div className="flex flex-wrap gap-2" aria-label="หมวดคำตอบ">
            {sections.map((section) => (
              <StatusBadge
                key={section.label}
                label={`${section.label}: ${section.answered ? "มีข้อมูล" : "ไม่ได้ตอบ"}`}
                tone={section.answered ? "teal" : "gray"}
              />
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="respondent-heading">
          <div className="mb-3 flex items-center gap-2">
            <User aria-hidden="true" className="text-[#0A6B62]" size={21} weight="fill" />
            <h2 id="respondent-heading" className="text-lg font-bold text-slate-900">ผู้ตอบแบบสำรวจ</h2>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            {canReadTourist ? (
              <Link
                href={`/admin/tourists/${survey.respondent.touristId}`}
                className="inline-flex min-h-11 items-center font-bold text-[#075049] underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A6B62]"
              >
                {survey.respondent.displayName} ({survey.respondent.reference})
              </Link>
            ) : (
              <p className="py-2 font-bold text-slate-900">
                {survey.respondent.displayName} ({survey.respondent.reference})
              </p>
            )}
            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <div><dt className="text-xs font-semibold text-slate-500">ประเทศต้นทาง</dt><dd className="mt-1 font-medium text-slate-900">{survey.respondent.countryName ?? "ไม่ได้ระบุ"}</dd></div>
              <div><dt className="text-xs font-semibold text-slate-500">จังหวัดต้นทาง</dt><dd className="mt-1 font-medium text-slate-900">{survey.respondent.provinceName ?? "ไม่ได้ระบุ"}</dd></div>
              <div><dt className="text-xs font-semibold text-slate-500">ช่วงอายุ</dt><dd className="mt-1 font-medium text-slate-900">{survey.respondent.ageGroup ?? "ไม่ได้ระบุ"}</dd></div>
              <div><dt className="text-xs font-semibold text-slate-500">ภาษา</dt><dd className="mt-1 font-medium text-slate-900">{survey.respondent.preferredLanguage?.toUpperCase() ?? "ไม่ได้ระบุ"}</dd></div>
            </dl>
          </div>
        </section>

        <section aria-labelledby="visit-heading">
          <div className="mb-3 flex items-center gap-2">
            <MapPin aria-hidden="true" className="text-[#0A6B62]" size={21} weight="fill" />
            <h2 id="visit-heading" className="text-lg font-bold text-slate-900">บริบทการเข้าชม</h2>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="font-bold text-slate-900">{survey.visit.attractionName ?? "ไม่ระบุสถานที่"}</p>
            <p className="mt-1 text-sm text-slate-600">{survey.visit.attractionProvince ?? "ไม่ระบุจังหวัด"}</p>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">
              <span className="inline-flex items-center gap-1.5"><CalendarBlank aria-hidden="true" size={16} /> {formatDate(survey.visit.visitedAt ?? survey.visit.visitDate, true)}</span>
              {survey.visit.photoSpotName ? <span>จุดถ่ายภาพ: {survey.visit.photoSpotName}</span> : null}
              {survey.visit.checkinLabel ? <span>จุดเช็กอิน: {survey.visit.checkinLabel}</span> : null}
            </div>
          </div>
        </section>
      </div>

      <section aria-labelledby="behavior-heading" className="border-t border-slate-200 pt-6">
        <div className="mb-4 flex items-center gap-2">
          <ChartBar aria-hidden="true" className="text-[#0A6B62]" size={22} weight="fill" />
          <div><h2 id="behavior-heading" className="text-lg font-bold text-slate-900">พฤติกรรมการเดินทาง</h2><p className="mt-0.5 text-sm text-slate-600">ข้อมูลในหมวดนี้ผูกกับการเข้าชมครั้งนี้เท่านั้น</p></div>
        </div>
        <AnswerGrid items={[
          { label: "เดินทางกับใคร", value: valueOrMissing(survey.travelBehavior.companion) },
          { label: "ขนาดกลุ่ม", value: survey.travelBehavior.groupSize === null ? "ไม่ได้ตอบ" : `${survey.travelBehavior.groupSize} คน` },
          { label: "รูปแบบการเดินทาง", value: valueOrMissing(survey.travelBehavior.transportMode) },
          { label: "วัตถุประสงค์", value: valueOrMissing(survey.travelBehavior.travelPurpose) },
          { label: "การพักค้างคืน", value: survey.travelBehavior.overnightStatus ? (overnightLabels[survey.travelBehavior.overnightStatus] ?? survey.travelBehavior.overnightStatus) : "ไม่ได้ตอบ" },
          { label: "จำนวนคืน", value: survey.travelBehavior.nights === null ? "ไม่ได้ตอบ" : `${survey.travelBehavior.nights} คืน` },
        ]} />
      </section>

      <section aria-labelledby="expense-heading" className="border-t border-slate-200 pt-6">
        <div className="mb-4 flex items-center gap-2">
          <Coins aria-hidden="true" className="text-[#0A6B62]" size={22} weight="fill" />
          <div><h2 id="expense-heading" className="text-lg font-bold text-slate-900">ค่าใช้จ่ายโดยประมาณ</h2><p className="mt-0.5 text-sm text-slate-600">เป็นช่วงที่ผู้ตอบเลือกเอง ไม่ใช่ข้อมูลธุรกรรมหรือรายได้ที่ตรวจสอบแล้ว</p></div>
        </div>
        <AnswerGrid items={[
          { label: "ช่วงค่าใช้จ่าย", value: survey.expense?.spendingRange ?? "ไม่ได้ตอบ", highlight: Boolean(survey.expense?.spendingRange) },
          { label: "หมวดที่ใช้จ่ายมากที่สุด", value: survey.expense?.category ?? "ไม่ได้ตอบ" },
        ]} />
      </section>

      <section aria-labelledby="satisfaction-heading" className="border-t border-slate-200 pt-6">
        <div className="mb-4 flex items-center gap-2">
          <Star aria-hidden="true" className="text-amber-600" size={22} weight="fill" />
          <div><h2 id="satisfaction-heading" className="text-lg font-bold text-slate-900">ความพึงพอใจ</h2><p className="mt-0.5 text-sm text-slate-600">ช่องที่ไม่ได้ตอบแสดงเป็น “ไม่ได้ตอบ” และไม่ถูกคำนวณเป็นศูนย์</p></div>
        </div>
        <AnswerGrid items={[
          { label: "สิ่งอำนวยความสะดวก (Facility)", value: score(survey.satisfaction.facilityScore), highlight: survey.satisfaction.facilityScore !== null },
          { label: "โดยรวม", value: score(survey.satisfaction.overallScore), highlight: survey.satisfaction.overallScore !== null },
          { label: "ความปลอดภัย", value: score(survey.satisfaction.safetyScore) },
          { label: "ความสะอาด", value: score(survey.satisfaction.cleanlinessScore) },
          { label: "การเข้าถึง", value: score(survey.satisfaction.accessibilityScore) },
          { label: "ข้อมูลและป้าย", value: score(survey.satisfaction.informationScore) },
          { label: "ความคุ้มค่า", value: score(survey.satisfaction.valueScore) },
          { label: "ตั้งใจกลับมาอีก", value: survey.satisfaction.revisitIntention ? (intentionLabels[survey.satisfaction.revisitIntention] ?? survey.satisfaction.revisitIntention) : "ไม่ได้ตอบ" },
          { label: "ตั้งใจแนะนำต่อ", value: survey.satisfaction.recommendIntention ? (intentionLabels[survey.satisfaction.recommendIntention] ?? survey.satisfaction.recommendIntention) : "ไม่ได้ตอบ" },
        ]} />
      </section>

      <section aria-labelledby="comment-heading" className="border-t border-slate-200 pt-6">
        <div className="mb-3 flex items-center gap-2">
          <ClipboardText aria-hidden="true" className="text-[#0A6B62]" size={22} weight="fill" />
          <h2 id="comment-heading" className="text-lg font-bold text-slate-900">ความคิดเห็นเพิ่มเติม</h2>
        </div>
        {canReadComments ? (
          <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm leading-7 text-slate-700">
            {survey.satisfaction.comment ?? "ผู้ตอบไม่ได้เขียนความคิดเห็นเพิ่มเติม"}
          </div>
        ) : (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
            บัญชีนี้ไม่มีสิทธิ์ดูความคิดเห็นแบบข้อความ โปรดติดต่อผู้ดูแลสิทธิ์หากจำเป็นต่อการปฏิบัติงาน
          </div>
        )}
      </section>

      <p className="border-t border-slate-200 pt-4 text-xs leading-5 text-slate-500">
        ส่งคำตอบเมื่อ {formatDate(survey.completedAt ?? survey.submittedAt, true)} ข้อมูลหน้านี้ใช้เพื่อการดูแลประสบการณ์และวิเคราะห์แบบสรุปตามสิทธิ์ที่ได้รับ
      </p>
    </div>
  );
}
