"use client";
import { useState, useTransition } from "react";
import { ArrowClockwise, CaretLeft, CaretRight, ClockCounterClockwise, ShieldCheck } from "@phosphor-icons/react";
import { getAdminNfcRecoveryAction, getAdminNfcRecoveryHistoryAction } from "@/app/actions/admin-nfc-recovery-actions";
import type { NfcRecoveryHistoryRow, NfcRecoveryReviewRow } from "@/lib/validation/nfc-recovery-review";

const button = "inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 transition-colors hover:border-orange-400 hover:bg-orange-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 disabled:opacity-50";
const statuses = { waiting: "รอตามกำหนด", ready: "พร้อมกู้คืน", processing: "กำลังตรวจสอบ", review: "ต้องตรวจสอบ", completed: "กู้คืนสำเร็จ" };
const tones = { waiting: "bg-slate-100 text-slate-700", ready: "bg-sky-50 text-sky-800", processing: "bg-sky-100 text-sky-900", review: "bg-amber-100 text-amber-900", completed: "bg-emerald-100 text-emerald-900" };
const lifecycle = { prepared: "รอยืนยันไฟล์", available: "ไฟล์ลงทะเบียนแล้ว", abandoned: "ยุติการลงทะเบียน" };
const outcomes = { provider_unavailable: "ติดต่อพื้นที่จัดเก็บไม่ได้", absent: "ยังไม่พบไฟล์ในการตรวจครั้งล่าสุด",
  content_conflict: "ไฟล์หรือสถานะรายการไม่ตรงตามเงื่อนไข", namespace_changed: "ปลายทางจัดเก็บเปลี่ยนแปลง",
  actor_unavailable: "ผู้บันทึกไม่มีสิทธิ์ใช้งานแล้ว", tag_changed: "แท็กหรือเวอร์ชันมีการเปลี่ยนแปลง" };
const events = { snapshot: "ข้อมูล ณ วันที่เริ่มเก็บประวัติ", queued: "เข้าคิวกู้คืน", claimed: "เริ่มตรวจสอบ",
  renewed: "ต่อเวลาการตรวจสอบ", deferred: "กำหนดตรวจซ้ำ", review: "ส่งให้ผู้ดูแลตรวจสอบ", completed: "กู้คืนสำเร็จ" };
const format = (value: string | null) => value ? new Date(value).toLocaleString("th-TH", { timeZone: "Asia/Bangkok", dateStyle: "medium", timeStyle: "short" }) : "ยังไม่มี";

export function NfcRecoveryReview({ tagId }: { tagId: string }) {
  return <RecoveryPanel key={tagId} tagId={tagId} />;
}
function RecoveryPanel({ tagId }: { tagId: string }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [result, setResult] = useState<{ rows: NfcRecoveryReviewRow[]; page: number; hasMore: boolean } | null>(null);
  function load(page = 1) {
    start(async () => {
      setError("");
      try {
        const response = await getAdminNfcRecoveryAction({ tagId, page });
        setLoaded(true);
        if (!response.success) { setError(response.message); return; }
        setDisabled(!response.enabled); setResult(response.enabled ? response : null);
      } catch { setError("เชื่อมต่อไม่สำเร็จ กรุณาลองโหลดรายการกู้คืนอีกครั้ง"); }
    });
  }
  return <section aria-label="กู้คืนรูปหลักฐาน NFC" aria-busy={pending} className="mt-6 min-w-0 border-t border-slate-200 pt-5">
    <header className="flex flex-wrap items-center justify-between gap-3">
      <div className="min-w-0"><h3 className="flex items-center gap-2 text-base font-bold text-slate-950"><ShieldCheck size={22} className="shrink-0 text-emerald-700" />กู้คืนรูปหลักฐาน</h3>
        <p className="mt-1 text-xs leading-5 text-slate-500">หลักฐานการติดตั้งแท็ก NFC</p></div>
      <button type="button" className={button} disabled={pending} onClick={() => load(result?.page ?? 1)}><ArrowClockwise size={18} className={pending ? "motion-safe:animate-spin" : ""} />{loaded ? "รีเฟรชรายการกู้คืน" : "โหลดรายการกู้คืน"}</button>
    </header>
    {pending && <p role="status" className="mt-3 text-sm text-slate-600">กำลังอ่านรายการ…</p>}
    {error ? <p role="alert" className="mt-4 border-l-4 border-amber-500 bg-amber-50 p-3 text-sm leading-6 text-amber-950">{error}</p>
      : disabled ? <p role="status" className="py-5 text-sm text-slate-600">ยังไม่เปิดระบบกู้คืนหลักฐาน</p>
        : result && <>
          <p className="mt-4 text-xs text-slate-500">แสดง {result.rows.length} รายการ · หน้า {result.page}</p>
          {!result.rows.length && <p className="py-6 text-sm text-slate-600">ยังไม่มีรายการกู้คืนของแท็กนี้</p>}
          <ol className="mt-2 divide-y divide-slate-200">{result.rows.map(row => <li key={`${row.asset_id}:${row.attempt_count}:${row.status}`} className="min-w-0 py-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0"><p className="text-sm font-bold text-slate-900">หลักฐาน <span className="font-mono" title={row.asset_id}>{row.asset_id.slice(0, 8)}</span></p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{format(row.created_at)} · เวอร์ชันแท็ก {row.tag_version}</p></div>
              <span className={`rounded px-2.5 py-1 text-xs font-bold ${tones[row.status]}`}>{statuses[row.status]}</span>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm lg:grid-cols-4">
              <div><dt className="text-xs text-slate-500">สถานะไฟล์</dt><dd className="mt-1 font-medium text-slate-800">{lifecycle[row.intent_state]}</dd></div>
              <div><dt className="text-xs text-slate-500">จำนวนครั้งที่เริ่มตรวจ</dt><dd className="mt-1 font-medium tabular-nums text-slate-800">{row.attempt_count} ครั้ง</dd></div>
              <div><dt className="text-xs text-slate-500">เริ่มตรวจล่าสุด</dt><dd className="mt-1 text-slate-800">{format(row.last_attempt_at)}</dd></div>
              <div><dt className="text-xs text-slate-500">{row.status === "completed" ? "สำเร็จเมื่อ" : "การดำเนินการถัดไป"}</dt><dd className="mt-1 text-slate-800">{row.status === "completed" ? format(row.completed_at) : row.status === "review" ? "รอผู้ดูแลตรวจสอบ" : row.status === "processing" ? "อยู่ระหว่างตรวจสอบ" : row.status === "ready" ? "รอรอบประมวลผล" : format(row.next_attempt_at)}</dd></div>
            </dl>
            {row.last_outcome && <p className={`mt-3 border-l-2 pl-3 text-sm leading-6 ${row.status === "review" ? "border-amber-500 text-amber-900" : "border-slate-300 text-slate-600"}`}>{outcomes[row.last_outcome]}</p>}
            <RecoveryHistory tagId={tagId} assetId={row.asset_id} />
          </li>)}</ol>
          {(result.page > 1 || result.hasMore) && <nav aria-label="หน้ารายการกู้คืน" className="flex items-center justify-between gap-3 border-t border-slate-200 pt-4">
            <button type="button" className={button} aria-label="รายการกู้คืนหน้าก่อนหน้า" title="หน้าก่อนหน้า" disabled={pending || result.page <= 1} onClick={() => load(result.page - 1)}><CaretLeft size={18} /></button>
            <span className="text-sm text-slate-600">หน้า {result.page}</span>
            <button type="button" className={button} aria-label="รายการกู้คืนหน้าถัดไป" title="หน้าถัดไป" disabled={pending || !result.hasMore} onClick={() => load(result.page + 1)}><CaretRight size={18} /></button>
          </nav>}
        </>}
  </section>;
}
function RecoveryHistory({ tagId, assetId }: { tagId: string; assetId: string }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ rows: NfcRecoveryHistoryRow[]; nextBeforeId: string | null } | null>(null);
  function load(beforeId?: string) {
    start(async () => {
      setError("");
      try {
        const response = await getAdminNfcRecoveryHistoryAction({ tagId, assetId, ...(beforeId ? { beforeId } : {}) });
        if (!response.success) { setError(response.message); return; }
        if (!response.enabled) { setError("ยังไม่เปิดระบบกู้คืนหลักฐาน"); return; }
        setResult(response);
      } catch { setError("เชื่อมต่อไม่สำเร็จ กรุณาลองอ่านประวัติอีกครั้ง"); }
    });
  }
  return <div className="mt-3 min-w-0" aria-busy={pending}>
    <button type="button" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-orange-800 hover:text-orange-950 focus-visible:outline-2 focus-visible:outline-orange-600 disabled:opacity-50" disabled={pending} onClick={() => load()}><ClockCounterClockwise size={18} />{result ? "ประวัติล่าสุด" : "ดูประวัติการกู้คืน"}</button>
    {error ? <p role="alert" className="mt-2 text-sm text-amber-900">{error}</p> : result && <>
      {!result.rows.length && <p className="py-3 text-sm text-slate-500">ยังไม่มีประวัติที่บันทึกไว้</p>}
      <ol className="ml-2 border-l border-slate-200 pl-4">{result.rows.map(event => <li key={event.event_id} className="py-2 text-sm">
        <p className="font-semibold text-slate-800">{events[event.event_type]} <span className="font-normal text-slate-500">· {event.attempt_count ? `ครั้งที่ ${event.attempt_count}` : "ยังไม่เริ่มตรวจ"}</span></p>
        <time dateTime={event.occurred_at} className="text-xs text-slate-500">{format(event.occurred_at)}</time>
        {event.outcome && <p className="mt-1 text-xs leading-5 text-slate-600">{outcomes[event.outcome]}</p>}
      </li>)}</ol>
      {result.nextBeforeId && <button type="button" className={`${button} mt-3`} disabled={pending} onClick={() => load(result.nextBeforeId!)}><CaretRight size={16} />ประวัติก่อนหน้า</button>}
    </>}
  </div>;
}
