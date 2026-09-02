import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Flask, LockKey, Plus, UsersThree } from "@phosphor-icons/react/dist/ssr";

import { createResearchStudyAction } from "@/app/actions/admin-research-actions";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminShell } from "@/components/admin/AdminShell";
import { hasPermission, requirePermission } from "@/lib/auth/guards";
import { getAdminResearchStudies } from "@/lib/services/admin-research.service";

export const metadata: Metadata = { title: "ศูนย์งานวิจัย | ผู้ดูแลระบบ" };
export const dynamic = "force-dynamic";

const STATUS_LABELS = {
  draft: "ฉบับร่าง",
  active: "กำลังเก็บข้อมูล",
  paused: "พักการเก็บข้อมูล",
  closed: "ปิดการเก็บข้อมูล",
  archived: "เก็บถาวร",
} as const;
const KIND_LABELS = { pilot: "Pilot ควบคุม", final_collection: "เก็บข้อมูลจริง" } as const;

const RESULT_MESSAGES: Record<string, string> = {
  study_failed: "ยังสร้างโครงการวิจัยไม่ได้ กรุณาตรวจข้อมูล รหัสโครงการ และช่วงเวลา",
};

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
export default async function AdminResearchPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [guard, studies, query] = await Promise.all([
    requirePermission("research.read"),
    getAdminResearchStudies(),
    searchParams,
  ]);
  const canManage = hasPermission(guard.actor, "research.manage");
  const activeCount = studies.filter((study) => study.status === "active").length;
  const totalSessions = studies.reduce((sum, study) => sum + study.sessionCount, 0);
  const result = one(query.result);

  return (
    <AdminShell admin={guard.actor}>
      <div className="space-y-6">
        <AdminPageHeader
          eyebrow="Research Operations"
          title="ศูนย์งานวิจัย"
          description="กำกับ protocol, consent, instrument, จุดเก็บข้อมูล และผลวิเคราะห์แบบแยกข้อมูลจริง ข้อมูลจำลอง และ pilot อย่างตรวจสอบย้อนหลังได้"
        />

        {result && RESULT_MESSAGES[result] ? <p role="alert" className="border border-rose-300 bg-rose-50 p-4 text-sm font-bold text-rose-900">{RESULT_MESSAGES[result]}</p> : null}

        <section className="grid gap-px border border-[var(--admin-border)] bg-[var(--admin-border)] sm:grid-cols-3" aria-label="สรุปงานวิจัย">
          <div className="bg-white p-5"><Flask aria-hidden="true" size={22} className="text-[#B94727]" /><p className="mt-3 text-xs font-bold text-slate-500">โครงการทั้งหมด</p><p className="mt-1 text-3xl font-black text-[#202020]">{studies.length.toLocaleString("th-TH")}</p></div>
          <div className="bg-white p-5"><UsersThree aria-hidden="true" size={22} className="text-[#B94727]" /><p className="mt-3 text-xs font-bold text-slate-500">Research sessions</p><p className="mt-1 text-3xl font-black text-[#202020]">{totalSessions.toLocaleString("th-TH")}</p></div>
          <div className="bg-white p-5"><LockKey aria-hidden="true" size={22} className="text-[#B94727]" /><p className="mt-3 text-xs font-bold text-slate-500">กำลังเก็บข้อมูล</p><p className="mt-1 text-3xl font-black text-[#202020]">{activeCount.toLocaleString("th-TH")}</p></div>
        </section>

        <section className="border border-[var(--admin-border)] bg-white" aria-labelledby="study-list-heading">
          <div className="border-b border-[var(--admin-border)] px-5 py-4"><h2 id="study-list-heading" className="text-lg font-black">โครงการและสถานะความพร้อม</h2><p className="mt-1 text-sm text-slate-600">Analytics เลือก collection mode ตามชนิดโครงการอัตโนมัติ และไม่รวม Pilot เข้ากับข้อสรุปภาคสนาม</p></div>
          {studies.length === 0 ? (
            <div className="px-5 py-12 text-center"><p className="font-bold">ยังไม่มีโครงการวิจัย</p><p className="mt-1 text-sm text-slate-600">สร้างได้เฉพาะฉบับร่าง และต้องผ่าน approval gate ก่อนเปิดเก็บข้อมูล</p></div>
          ) : (
            <div className="divide-y divide-[var(--admin-border)]">
              {studies.map((study) => (
                <article key={study.researchStudyId} className="grid gap-4 px-5 py-5 lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:items-center">
                  <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="font-black text-[#202020]">{study.titleTh}</h3><span className="border border-slate-300 px-2 py-1 text-xs font-bold text-slate-700">{STATUS_LABELS[study.status]}</span><span className="border border-orange-200 bg-orange-50 px-2 py-1 text-xs font-bold text-[#9A3412]">{KIND_LABELS[study.studyKind]}</span></div><p className="mt-1 font-mono text-xs text-slate-500">{study.studyCode} · protocol {study.protocolVersion}</p></div>
                  <dl className="grid grid-cols-3 gap-5 text-center text-xs"><div><dt className="text-slate-500">แบบประเมิน</dt><dd className="mt-1 text-lg font-black">{study.instrumentCount}</dd></div><div><dt className="text-slate-500">จุดเก็บข้อมูล</dt><dd className="mt-1 text-lg font-black">{study.activeDeploymentCount}</dd></div><div><dt className="text-slate-500">ผู้ยินยอม</dt><dd className="mt-1 text-lg font-black">{study.sessionCount}</dd></div></dl>
                  <Link href={`/admin/research/${study.researchStudyId}`} className="inline-flex min-h-11 items-center justify-center gap-2 bg-[#202020] px-4 text-sm font-bold text-white hover:bg-[#B94727]">เปิด workspace <ArrowRight aria-hidden="true" /></Link>
                </article>
              ))}
            </div>
          )}
        </section>

        {canManage ? (
          <details className="border border-[var(--admin-border)] bg-white">
            <summary className="flex min-h-14 cursor-pointer list-none items-center gap-2 px-5 font-black text-[#202020]"><Plus aria-hidden="true" /> สร้างโครงการวิจัยฉบับร่าง</summary>
            <form action={createResearchStudyAction} className="grid gap-4 border-t border-[var(--admin-border)] p-5 sm:grid-cols-2">
              <p className="sm:col-span-2 border-l-2 border-[#B94727] pl-3 text-sm leading-6 text-slate-600">การสร้างรายการนี้ยังไม่เริ่มเก็บข้อมูล ต้องบันทึก approval, เผยแพร่ instrument และผูก QR ให้ครบก่อน</p>
              <label className="text-sm font-bold">ชื่อโครงการภาษาไทย<input name="titleTh" required maxLength={255} className="mt-2 min-h-11 w-full border border-slate-300 px-3 font-normal" /></label>
              <label className="text-sm font-bold">รหัสโครงการ<input name="studyCode" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" placeholder="yala-field-2026" className="mt-2 min-h-11 w-full border border-slate-300 px-3 font-mono font-normal" /></label>
              <label className="text-sm font-bold">Protocol version<input name="protocolVersion" required placeholder="protocol-1" className="mt-2 min-h-11 w-full border border-slate-300 px-3 font-normal" /></label>
              <label className="text-sm font-bold">ขอบเขตการศึกษา<input name="scopeCode" required placeholder="yala-city-pilot" className="mt-2 min-h-11 w-full border border-slate-300 px-3 font-normal" /></label>
              <label className="text-sm font-bold">ประเภทโครงการ<select name="studyKind" defaultValue="pilot" className="mt-2 min-h-11 w-full border border-slate-300 bg-white px-3 font-normal"><option value="pilot">Pilot ควบคุม (เริ่มจากตัวเลือกนี้)</option><option value="final_collection">Final collection</option></select></label>
              <label className="text-sm font-bold">Pilot ต้นทางสำหรับ Final<select name="sourcePilotStudyId" defaultValue="" className="mt-2 min-h-11 w-full border border-slate-300 bg-white px-3 font-normal"><option value="">ไม่ใช้สำหรับ Pilot / ต้องเลือกสำหรับ Final</option>{studies.filter((study) => study.studyKind === "pilot").map((study) => <option key={study.researchStudyId} value={study.researchStudyId}>{study.titleTh} ({study.studyCode})</option>)}</select></label>
              <label className="text-sm font-bold">Consent version<input name="consentVersion" required placeholder="consent-1" className="mt-2 min-h-11 w-full border border-slate-300 px-3 font-normal" /></label>
              <label className="text-sm font-bold">Notice version<input name="noticeVersion" required placeholder="notice-1" className="mt-2 min-h-11 w-full border border-slate-300 px-3 font-normal" /></label>
              <label className="text-sm font-bold sm:col-span-2">วัตถุประสงค์ที่ผู้เข้าร่วมจะเห็น<textarea name="purposeTh" required rows={3} className="mt-2 w-full border border-slate-300 px-3 py-2 font-normal" /></label>
              <label className="text-sm font-bold sm:col-span-2">สิ่งที่ผู้เข้าร่วมต้องทำ<textarea name="participationTh" required rows={3} className="mt-2 w-full border border-slate-300 px-3 py-2 font-normal" /></label>
              <label className="text-sm font-bold sm:col-span-2">การใช้และคุ้มครองข้อมูล<textarea name="privacyTh" required rows={3} className="mt-2 w-full border border-slate-300 px-3 py-2 font-normal" /></label>
              <label className="text-sm font-bold sm:col-span-2">สิทธิถอนตัว<textarea name="withdrawalTh" required rows={3} className="mt-2 w-full border border-slate-300 px-3 py-2 font-normal" /></label>
              <label className="text-sm font-bold">อีเมลติดต่อ<input type="email" name="contactEmail" required className="mt-2 min-h-11 w-full border border-slate-300 px-3 font-normal" /></label>
              <label className="text-sm font-bold">ชื่ออังกฤษ (ไม่บังคับ)<input name="titleEn" maxLength={255} className="mt-2 min-h-11 w-full border border-slate-300 px-3 font-normal" /></label>
              <label className="text-sm font-bold">เริ่มเก็บข้อมูล (วางแผน)<input type="date" name="startsAt" className="mt-2 min-h-11 w-full border border-slate-300 px-3 font-normal" /></label>
              <label className="text-sm font-bold">สิ้นสุดเก็บข้อมูล<input type="date" name="endsAt" className="mt-2 min-h-11 w-full border border-slate-300 px-3 font-normal" /></label>
              <label className="text-sm font-bold sm:col-span-2">สิ้นสุดการเก็บรักษาข้อมูล<input type="date" name="retentionUntil" required className="mt-2 min-h-11 w-full border border-slate-300 px-3 font-normal" /></label>
              <button type="submit" className="min-h-11 bg-[#202020] px-4 font-black text-white hover:bg-[#B94727] sm:col-span-2">สร้างฉบับร่าง</button>
            </form>
          </details>
        ) : null}
      </div>
    </AdminShell>
  );
}
